"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  FinancialAccount,
  FinancialTransaction,
  FinancialBudget,
  FinanceSummary,
} from "@/types/finance";
import { formatIDR, formatIDRCompact, formatDateIndo } from "@/lib/finance/format";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  PlusCircle,
} from "lucide-react";
import styles from "./CommandCenter.module.css";

export interface FinanceOverviewCardProps {
  summary: FinanceSummary;
  accounts: FinancialAccount[];
  transactions: FinancialTransaction[];
  budgets: FinancialBudget[];
  onAddTransaction?: () => void;
}

export function FinanceOverviewCard({
  summary,
  accounts,
  transactions,
  budgets,
  onAddTransaction,
}: FinanceOverviewCardProps) {
  const isSurplus = summary.netCashFlow >= 0;

  // Compute total budget progress
  const budgetStats = useMemo(() => {
    let totalAllocated = 0;
    let totalSpent = 0;

    for (const b of budgets) {
      totalAllocated += b.amount;
      totalSpent += b.spent_amount || 0;
    }

    const pct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    return { totalAllocated, totalSpent, pct };
  }, [budgets]);

  const recentTxs = transactions.slice(0, 3);

  return (
    <div className={styles.sectionCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>
            <Wallet size={18} className="text-blue-700" />
            <span>Keuangan & Anggaran</span>
          </h3>
          <p className={styles.cardSubtitle}>
            Ringkasan arus kas, saldo gabungan, dan penggunaan budget bulan ini
          </p>
        </div>

        <Link href="/finance/overview" className={styles.linkBtn}>
          <span>Buka Finance Tracker</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 3 Metrics: Income, Expense, Net */}
      <div className={styles.metricRow}>
        <div className={styles.metricItem}>
          <span className={styles.metricItemLabel}>Pemasukan</span>
          <span className={`${styles.metricItemValue} text-emerald-700`}>
            {formatIDRCompact(summary.totalIncome)}
          </span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricItemLabel}>Pengeluaran</span>
          <span className={`${styles.metricItemValue} text-rose-700`}>
            {formatIDRCompact(summary.totalExpenses)}
          </span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricItemLabel}>Arus Kas</span>
          <span
            className={`${styles.metricItemValue} ${
              isSurplus ? "text-teal-700" : "text-rose-700"
            }`}
          >
            {formatIDRCompact(summary.netCashFlow)}
          </span>
        </div>
      </div>

      {/* Budget Usage Mini Progress */}
      {budgets.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <PieChart size={14} className="text-blue-600" />
              <span>Penggunaan Anggaran Bulan Ini</span>
            </span>
            <span className="font-bold text-gray-900">{budgetStats.pct}%</span>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetStats.pct >= 100
                  ? "bg-rose-500"
                  : budgetStats.pct >= 80
                  ? "bg-amber-500"
                  : "bg-teal-600"
              }`}
              style={{ width: `${Math.min(100, budgetStats.pct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Terpakai: {formatIDRCompact(budgetStats.totalSpent)}</span>
            <span>Batas: {formatIDRCompact(budgetStats.totalAllocated)}</span>
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>Transaksi Terakhir</span>
          <Link
            href="/finance/transactions"
            className="text-teal-700 font-semibold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {recentTxs.length === 0 ? (
          <div className={styles.emptyState}>
            <Wallet size={20} className="text-gray-400" />
            <p className={styles.emptyStateTitle}>Belum ada transaksi dicatat bulan ini</p>
            <p className={styles.emptyStateText}>
              Catat transaksi harian atau scan struk belanja untuk memantau pengeluaran.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentTxs.map((t) => (
              <div
                key={t.id}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.type === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {t.type === "income" ? (
                      <TrendingUp size={12} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={12} strokeWidth={2.5} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-900 block truncate">
                      {t.title}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {formatDateIndo(t.date)}
                    </span>
                  </div>
                </div>

                <span
                  className={`font-bold tabular-nums text-xs whitespace-nowrap ${
                    t.type === "income" ? "text-emerald-700" : "text-gray-900"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatIDR(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Links */}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-2 flex-wrap">
        <Link
          href="/finance/transactions"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          ➕ Catat Transaksi
        </Link>
        <Link
          href="/finance/budgets"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          🎯 Atur Anggaran
        </Link>
        <Link
          href="/finance/reports"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          📊 Laporan Keuangan
        </Link>
      </div>
    </div>
  );
}
