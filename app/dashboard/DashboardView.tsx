"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { Upload, Plus, CheckCircle2, Download, Briefcase } from "lucide-react";
import {
  FollowUpReminderBanner,
  RecentApplicationsTable,
  TopStatsRow,
  ApplicationsActivityPanel,
  ActivePipelinePanel,
  JobSourcePerformancePanel,
} from "@/components/dashboard";
import {
  AddApplicationModal,
  ImportModal,
  type AddApplicationFormData,
} from "@/components/applications";
import { Application } from "@/types/application";
import { computeDashboardTopStats } from "@/lib/applications/dashboard-stats";
import { getFollowUps } from "@/lib/applications/reminders";
import { formatDate } from "@/lib/applications/format";
import { createApplication } from "@/lib/applications/actions";
import { exportBackupData } from "@/lib/backup/backup";

export interface DashboardViewProps {
  userName?: string;
  applications: Application[];
}

export function DashboardView({
  userName,
  applications,
}: DashboardViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const displayName = userName || "Pengguna";

  // Dynamic greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  }, []);

  // Compute 6 Top Stats dynamically from actual application data
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

  const handleAddSubmit = async (data: AddApplicationFormData) => {
    const res = await createApplication(data);
    if (res.success) {
      setIsModalOpen(false);
      setToastMessage("Lamaran berhasil disimpan!");
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert(res.error || "Gagal menyimpan lamaran.");
    }
  };

  return (
    <AppShell title="Dashboard Analisis Karier" userName={userName}>
      <div className="space-y-6">
        {/* 1. Header with Greeting & Quick Action Buttons */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-[26px] leading-[34px] font-bold font-heading text-gray-900 tracking-tight">
              Halo, {displayName} 👋
            </h1>
            <p className="text-sm leading-5 text-gray-500 font-normal mt-0.5">
              {greeting}, pantau dan kelola seluruh perkembangan lamaran pekerjaan Anda hari ini.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={exportBackupData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-white border border-[#e2eaf0] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-2xs"
            >
              <Download size={14} className="text-gray-500" />
              <span>Cadangkan Data</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-white border border-[#e2eaf0] text-[#107c74] hover:bg-[#e6faf7] transition shadow-2xs"
            >
              <Upload size={14} />
              <span>Impor Data</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
            >
              <Plus size={15} strokeWidth={2.6} />
              <span>Tambah Lamaran</span>
            </button>
          </div>
        </header>

        {/* 2. Follow-Up Reminder Banner */}
        <FollowUpReminderBanner count={followUpCount} />

        {/* 3. 6 KPI Cards in 1 Row on Desktop */}
        <section aria-label="Statistik Utama Karier">
          <TopStatsRow stats={topStats} />
        </section>

        {/* 4. Full-Width Applications & Response Activity Panel (Bklit UI / Multi-series Chart) */}
        <section aria-label="Aktivitas Lamaran & Respons">
          <ApplicationsActivityPanel applications={applications} />
        </section>

        {/* 5. Bottom 2-Column Grid: Active Pipeline Status (Left) & Closure Reasons (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Status Pipeline & Sumber Lowongan">
          <ActivePipelinePanel applications={applications} />
          <JobSourcePerformancePanel applications={applications} />
        </section>

        {/* 6. Recent Applications Table */}
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

        {/* Add Application Modal */}
        {isModalOpen && (
          <AddApplicationModal
            isOpen={isModalOpen}
            initialTab="manual"
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddSubmit}
          />
        )}

        {/* Import Applications Modal */}
        {isImportModalOpen && (
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={(msg) => {
              setToastMessage(msg);
              setTimeout(() => setToastMessage(null), 4000);
            }}
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
