"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceSubnav } from "@/components/finance/FinanceSubnav";
import { BudgetModal } from "@/components/finance/modals/BudgetModal";
import {
  FinancialCategory,
  FinancialBudget,
} from "@/types/finance";
import {
  getCategories,
  getBudgets,
  upsertBudget,
  deleteBudget,
  migrateLocalStorageToSupabaseIfNeeded,
} from "@/lib/finance/service";
import { formatIDR, formatDateMonthIndo } from "@/lib/finance/format";
import {
  PieChart,
  PlusCircle,
  Calendar,
  Edit2,
  Trash2,
} from "lucide-react";

interface BudgetsClientProps {
  userId: string;
  userName?: string;
}

export function BudgetsClient({ userId, userName }: BudgetsClientProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [budgets, setBudgets] = useState<FinancialBudget[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<FinancialBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId || userId === "guest-user") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      await migrateLocalStorageToSupabaseIfNeeded(userId);
      const [cats, bgs] = await Promise.all([
        getCategories(userId),
        getBudgets(userId, currentMonth),
      ]);
      setCategories(cats);
      setBudgets(bgs);
    } catch (err: any) {
      console.error("Error loading budgets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentMonth]);

  useEffect(() => {
    loadData();
  }, [userId, currentMonth]);

  // Overall budget summary
  const summary = useMemo(() => {
    let totalAllocated = 0;
    let totalSpent = 0;

    for (const b of budgets) {
      totalAllocated += b.amount;
      totalSpent += b.spent_amount || 0;
    }

    const overallPct =
      totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    return {
      totalAllocated,
      totalSpent,
      remaining: Math.max(0, totalAllocated - totalSpent),
      overallPct,
    };
  }, [budgets]);

  const handleSaveBudget = async (
    categoryId: string,
    month: string,
    amount: number
  ) => {
    try {
      await upsertBudget(userId, categoryId, month, amount);
      setEditingBudget(null);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan anggaran.");
    }
  };

  const handleDeleteBudget = async (budget: FinancialBudget) => {
    if (
      confirm(
        `Hapus anggaran kategori "${budget.category_name}" untuk bulan ${budget.month}?`
      )
    ) {
      try {
        await deleteBudget(userId, budget.id);
        await loadData();
      } catch (err: any) {
        alert(err.message || "Gagal menghapus anggaran.");
      }
    }
  };

  return (
    <AppShell title="Budgets" userName={userName}>
      <FinanceSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold font-heading text-gray-900 tracking-tight">
            Anggaran Bulanan
          </h1>
          <p className="text-sm leading-5 text-gray-500 mt-0.5">
            Kendalikan pengeluaran bulanan Anda per kategori dengan indikator visual otomatis.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Picker */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-2xs">
            <Calendar size={15} className="text-[#107c74]" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent border-0 outline-none cursor-pointer font-medium text-sm text-gray-800"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
          >
            <PlusCircle size={16} /> Atur Anggaran
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Total Alokasi Anggaran ({formatDateMonthIndo(currentMonth)})
          </span>
          <span className="text-[26px] leading-8 font-bold font-heading text-gray-900 mt-1 block">
            {formatIDR(summary.totalAllocated)}
          </span>
        </div>

        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Total Terpakai
          </span>
          <span className="text-[26px] leading-8 font-bold font-heading text-rose-600 mt-1 block">
            {formatIDR(summary.totalSpent)}
          </span>
          <span className="text-xs text-gray-400 block mt-1">
            {summary.overallPct}% dari total anggaran
          </span>
        </div>

        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Sisa Anggaran Tersedia
          </span>
          <span className="text-[26px] leading-8 font-bold font-heading text-[#107c74] mt-1 block">
            {formatIDR(summary.remaining)}
          </span>
          <span className="text-xs text-gray-400 block mt-1">
            {100 - Math.min(summary.overallPct, 100)}% kuota tersisa
          </span>
        </div>
      </div>

      {/* Budget Grid */}
      <div className="bg-white border border-[#e2eaf0] rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 font-heading mb-4 tracking-tight">
          Status Anggaran Tiap Kategori
        </h2>

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PieChart size={44} className="text-gray-300 mb-2" />
            <h3 className="font-heading font-bold text-gray-800 text-base">
              Belum Ada Anggaran untuk {formatDateMonthIndo(currentMonth)}
            </h3>
            <p className="text-gray-500 text-sm mt-1 mb-4 max-w-sm">
              Tetapkan batas pengeluaran untuk kategori seperti Makanan, Transportasi, atau Belanja untuk mencegah overspending.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
            >
              <PlusCircle size={16} /> Buat Anggaran Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const spent = b.spent_amount || 0;
              const total = b.amount;
              const pct = total > 0 ? Math.round((spent / total) * 100) : 0;
              const remaining = total - spent;

              let statusColor = "#10b981"; // Normal
              let statusLabel = "Normal (<80%)";

              if (pct > 100) {
                statusColor = "#dc2626"; // Overspending
                statusLabel = "Over Budget (>100%)";
              } else if (pct === 100) {
                statusColor = "#ea580c"; // 100% reached
                statusLabel = "Batas Tercapai (100%)";
              } else if (pct >= 80) {
                statusColor = "#d97706"; // 80-99% approaching limit
                statusLabel = "Mendekati Batas (80-99%)";
              }

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-[14px] font-heading">
                        {b.category_name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDateMonthIndo(b.month)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                          color: statusColor,
                          backgroundColor: `${statusColor}15`,
                        }}
                      >
                        {statusLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudget(b);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBudget(b)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: statusColor,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span>{pct}% terpakai</span>
                      <span>
                        {remaining >= 0
                          ? `Sisa ${formatIDR(remaining)}`
                          : `Defisit ${formatIDR(Math.abs(remaining))}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[13px] pt-1.5 border-t border-gray-100 text-gray-600">
                    <div>
                      <span className="text-[11px] font-medium text-gray-400 block">
                        Terpakai
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatIDR(spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-medium text-gray-400 block">
                        Batas Anggaran
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatIDR(total)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        categories={categories}
        currentMonth={currentMonth}
        initialData={editingBudget}
      />
    </AppShell>
  );
}
