"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import {
  Upload,
  Plus,
  CheckCircle2,
  Download,
  Briefcase,
  Wallet,
  Calendar,
  LayoutDashboard,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import {
  FollowUpReminderBanner,
  RecentApplicationsTable,
  TopStatsRow,
  ApplicationsActivityPanel,
  ActivePipelinePanel,
  ClosureReasonsPanel,
} from "@/components/dashboard";
import {
  AddApplicationModal,
  ImportModal,
  type AddApplicationFormData,
} from "@/components/applications";
import { EventModal } from "@/components/applications/calendar/EventModal";
import { TransactionModal } from "@/components/finance/modals/TransactionModal";
import {
  CommandCenterKpis,
  CareerOverviewCard,
  FinanceOverviewCard,
  ProductivityOverviewCard,
  RecentActivityFeed,
} from "@/components/command-center";
import { Application } from "@/types/application";
import { RecruitmentEvent, ApplicationStatusHistory } from "@/types/recruitment";
import {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  FinancialBudget,
  FinanceSummary,
} from "@/types/finance";
import { computeDashboardTopStats } from "@/lib/applications/dashboard-stats";
import { getFollowUps } from "@/lib/applications/reminders";
import { formatDate, isActiveStatus } from "@/lib/applications/format";
import { createApplication } from "@/lib/applications/actions";
import { exportBackupData } from "@/lib/backup/backup";
import {
  getAccounts,
  getCategories,
  getTransactions,
  getBudgets,
  getFinanceSummary,
  createTransaction,
} from "@/lib/finance/service";
import {
  fetchRecruitmentEvents,
  saveRecruitmentEvent,
  fetchStatusHistory,
} from "@/lib/applications/recruitment-service";
import { createClient } from "@/lib/supabase/client";

export interface DashboardViewProps {
  userName?: string;
  applications: Application[];
}

export function DashboardView({
  userName,
  applications,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"command-center" | "career-analytics">("command-center");

  // User identification
  const [userId, setUserId] = useState<string>(applications[0]?.user_id || "");

  useEffect(() => {
    if (!userId) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      });
    }
  }, [userId]);

  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Finance states
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<FinancialBudget[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    transactionCount: 0,
  });

  // Recruitment events & status history
  const [recruitmentEvents, setRecruitmentEvents] = useState<RecruitmentEvent[]>([]);
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistory[]>([]);

  const loadData = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      // 1. Finance data
      const accs = getAccounts(uid);
      const cats = getCategories(uid);
      const txs = getTransactions(uid, { range: "this_month" });
      const bgs = getBudgets(uid, currentMonthStr);
      const summary = getFinanceSummary(uid, { range: "this_month" });

      setAccounts(accs);
      setCategories(cats);
      setTransactions(txs);
      setBudgets(bgs);
      setFinanceSummary(summary);

      // 2. Recruitment Events
      const evts = await fetchRecruitmentEvents(uid);
      setRecruitmentEvents(evts);

      // 3. Status History (from first application or all)
      if (applications.length > 0) {
        const histPromises = applications.slice(0, 5).map((app) =>
          fetchStatusHistory(uid, app.id)
        );
        const results = await Promise.all(histPromises);
        setStatusHistory(results.flat());
      }
    } catch (err) {
      console.warn("Failed loading command center data:", err);
    }
  }, [applications, currentMonthStr]);

  useEffect(() => {
    if (userId) {
      loadData(userId);
    }
  }, [userId, loadData]);

  // Modals state
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayName = userName || "Pengguna";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  // Compute Active Applications
  const activeJobsCount = useMemo(
    () => applications.filter((app) => isActiveStatus(app.status)).length,
    [applications]
  );

  // Compute Upcoming Events (Interviews & Deadlines in next 7 days)
  const upcomingEventsCount = useMemo(() => {
    const now = Date.now();
    const next7Days = now + 7 * 24 * 60 * 60 * 1000;
    return recruitmentEvents.filter(
      (e) =>
        !e.is_completed &&
        new Date(e.start_time).getTime() >= now - 3600000 &&
        new Date(e.start_time).getTime() <= next7Days
    ).length;
  }, [recruitmentEvents]);

  // Compute 6 Top Stats for Career Analytics
  const topStats = useMemo(
    () => computeDashboardTopStats(applications),
    [applications]
  );

  const followUpCount = useMemo(
    () => getFollowUps(applications).length,
    [applications]
  );

  const recentApplications = useMemo(
    () =>
      applications.slice(0, 5).map((app) => ({
        company: app.company,
        position: app.position,
        status: app.status,
        date: formatDate(app.date),
      })),
    [applications]
  );

  const handleAddAppSubmit = async (data: AddApplicationFormData) => {
    const res = await createApplication(data);
    if (res.success) {
      setIsAddAppModalOpen(false);
      showToast("Lamaran berhasil disimpan!");
      if (userId) loadData(userId);
    } else {
      alert(res.error || "Gagal menyimpan lamaran.");
    }
  };

  const handleSaveTransaction = (txData: Partial<FinancialTransaction>) => {
    if (!userId) return;
    createTransaction(userId, txData as Parameters<typeof createTransaction>[1]);
    setIsAddTxModalOpen(false);
    showToast("Transaksi berhasil dicatat!");
    loadData(userId);
  };

  const handleSaveEvent = async (eventData: Parameters<typeof saveRecruitmentEvent>[1]) => {
    if (!userId) return { success: false, error: "Sesi tidak valid" };
    const res = await saveRecruitmentEvent(userId, eventData);
    if (res.success) {
      setIsEventModalOpen(false);
      showToast("Jadwal agenda berhasil disimpan!");
      loadData(userId);
      return { success: true };
    }
    return { success: false, error: res.error || "Gagal menyimpan jadwal" };
  };

  return (
    <AppShell title="Command Center" userName={userName}>
      <div className="space-y-6">
        {/* 1. Header with Greeting & Quick Action Buttons */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <LayoutDashboard size={12} />
                Personal Command Center
              </span>
            </div>
            <h1 className="text-[26px] leading-[34px] font-extrabold font-heading text-gray-900 tracking-tight">
              Halo, {displayName} 👋
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-normal mt-0.5">
              {greeting}, pantau dan kendalikan seluruh progres karier, keuangan, dan produktivitas Anda dalam satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddAppModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
            >
              <Plus size={14} strokeWidth={2.6} />
              <span>Tambah Lamaran</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddTxModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-white border border-[#e2eaf0] text-blue-700 hover:bg-blue-50 transition shadow-2xs"
            >
              <Wallet size={14} />
              <span>Catat Transaksi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-white border border-[#e2eaf0] text-purple-700 hover:bg-purple-50 transition shadow-2xs"
            >
              <Calendar size={14} />
              <span>Jadwal Agenda</span>
            </button>

            <button
              type="button"
              onClick={exportBackupData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full bg-white border border-[#e2eaf0] text-gray-600 hover:bg-gray-50 transition shadow-2xs"
              title="Cadangkan seluruh data ke JSON"
            >
              <Download size={13} />
              <span>Backup</span>
            </button>
          </div>
        </header>

        {/* 2. Top Segmented Switcher: Command Center vs Career Analytics */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
          <div className="inline-flex bg-gray-100 p-1 rounded-full border border-gray-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "command-center"}
              onClick={() => setActiveTab("command-center")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "command-center"
                  ? "bg-white text-teal-800 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Command Center</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "career-analytics"}
              onClick={() => setActiveTab("career-analytics")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "career-analytics"
                  ? "bg-white text-teal-800 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 size={14} />
              <span>Analisis Karier</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 font-medium">
            <Link href="/applications?view=kanban" className="hover:text-teal-700 transition">
              🍱 Kanban
            </Link>
            <span>•</span>
            <Link href="/applications?view=calendar" className="hover:text-teal-700 transition">
              📅 Kalender
            </Link>
            <span>•</span>
            <Link href="/finance/overview" className="hover:text-teal-700 transition">
              💰 Keuangan
            </Link>
          </div>
        </div>

        {/* 3. Tab Content: COMMAND CENTER (Phase 1) */}
        {activeTab === "command-center" && (
          <div className="space-y-6">
            {/* Top 4 Executive KPI Cards */}
            <CommandCenterKpis
              activeJobsCount={activeJobsCount}
              upcomingEventsCount={upcomingEventsCount}
              totalBalance={financeSummary.totalBalance}
              netCashFlow={financeSummary.netCashFlow}
            />

            {/* 2-Column Responsive Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Career & Productivity */}
              <div className="space-y-6">
                {/* Section A: Career Overview */}
                <CareerOverviewCard
                  applications={applications}
                  events={recruitmentEvents}
                />

                {/* Section C: Productivity & Schedule Overview */}
                <ProductivityOverviewCard
                  events={recruitmentEvents}
                  applications={applications}
                />
              </div>

              {/* Right Column: Finance & Recent Activity */}
              <div className="space-y-6">
                {/* Section B: Finance Overview */}
                <FinanceOverviewCard
                  summary={financeSummary}
                  accounts={accounts}
                  transactions={transactions}
                  budgets={budgets}
                  onAddTransaction={() => setIsAddTxModalOpen(true)}
                />

                {/* Section D: Recent Activity Feed */}
                <RecentActivityFeed
                  applications={applications}
                  events={recruitmentEvents}
                  history={statusHistory}
                  transactions={transactions}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. Tab Content: CAREER ANALYTICS (Preserving all original dashboard tools) */}
        {activeTab === "career-analytics" && (
          <div className="space-y-6">
            <FollowUpReminderBanner count={followUpCount} />

            <section aria-label="Statistik Utama Karier">
              <TopStatsRow stats={topStats} />
            </section>

            <section aria-label="Aktivitas Lamaran & Respons">
              <ApplicationsActivityPanel applications={applications} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Status Pipeline & Penutupan">
              <ActivePipelinePanel applications={applications} />
              <ClosureReasonsPanel applications={applications} />
            </section>

            <section className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs" aria-label="Riwayat Lamaran Terbaru">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                    <Briefcase size={16} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                      Riwayat Lamaran Terbaru
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Daftar lamaran kerja yang baru saja Anda kirimkan
                    </p>
                  </div>
                </div>
              </div>
              <RecentApplicationsTable applications={recentApplications} />
            </section>
          </div>
        )}

        {/* Modal: Tambah Lamaran */}
        {isAddAppModalOpen && (
          <AddApplicationModal
            isOpen={isAddAppModalOpen}
            initialTab="manual"
            onClose={() => setIsAddAppModalOpen(false)}
            onSubmit={handleAddAppSubmit}
          />
        )}

        {/* Modal: Impor Lamaran */}
        {isImportModalOpen && (
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={(msg) => {
              showToast(msg);
            }}
          />
        )}

        {/* Modal: Catat Transaksi Keuangan */}
        {isAddTxModalOpen && userId && (
          <TransactionModal
            isOpen={isAddTxModalOpen}
            userId={userId}
            accounts={accounts}
            categories={categories}
            onClose={() => setIsAddTxModalOpen(false)}
            onSave={handleSaveTransaction}
            onSuccess={() => loadData(userId)}
          />
        )}

        {/* Modal: Jadwalkan Agenda Rekrutmen */}
        {isEventModalOpen && (
          <EventModal
            isOpen={isEventModalOpen}
            applications={applications}
            onClose={() => setIsEventModalOpen(false)}
            onSubmit={handleSaveEvent}
          />
        )}

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#107c74] text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 size={18} strokeWidth={2.5} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default DashboardView;
