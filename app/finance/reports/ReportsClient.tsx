"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceSubnav } from "@/components/finance/FinanceSubnav";
import {
  FinancialAccount,
  FinancialTransaction,
  DateFilter,
} from "@/types/finance";
import {
  getAccounts,
  getTransactions,
  migrateLocalStorageToSupabaseIfNeeded,
} from "@/lib/finance/service";
import { formatIDR } from "@/lib/finance/format";
import { Select } from "@/components/ui/select";
import {
  Download,
  Printer,
} from "lucide-react";

interface ReportsClientProps {
  userId: string;
  userName?: string;
}

type ReportPeriodType = "monthly" | "quarterly" | "annual" | "custom";

export function ReportsClient({ userId, userName }: ReportsClientProps) {
  const [periodType, setPeriodType] = useState<ReportPeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedQuarter, setSelectedQuarter] = useState("Q4");
  const [selectedYear, setSelectedYear] = useState(() =>
    String(new Date().getFullYear())
  );
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

  // Compute resolved date filter for the selected report period
  const dateFilter: DateFilter = useMemo(() => {
    if (periodType === "monthly") {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = `${selectedMonth}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;
      return { range: "custom", startDate: start, endDate: end };
    }

    if (periodType === "quarterly") {
      const y = selectedYear;
      if (selectedQuarter === "Q1")
        return { range: "custom", startDate: `${y}-01-01`, endDate: `${y}-03-31` };
      if (selectedQuarter === "Q2")
        return { range: "custom", startDate: `${y}-04-01`, endDate: `${y}-06-30` };
      if (selectedQuarter === "Q3")
        return { range: "custom", startDate: `${y}-07-01`, endDate: `${y}-09-30` };
      return { range: "custom", startDate: `${y}-10-01`, endDate: `${y}-12-31` };
    }

    if (periodType === "annual") {
      return {
        range: "custom",
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
      };
    }

    return { range: "custom", startDate: customStart, endDate: customEnd };
  }, [
    periodType,
    selectedMonth,
    selectedQuarter,
    selectedYear,
    customStart,
    customEnd,
  ]);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId || userId === "guest-user") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      await migrateLocalStorageToSupabaseIfNeeded(userId);
      const [accs, txs] = await Promise.all([
        getAccounts(userId),
        getTransactions(userId, dateFilter),
      ]);
      setAccounts(accs);
      setTransactions(txs);
    } catch (err: any) {
      console.error("Error loading reports data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, dateFilter]);

  useEffect(() => {
    loadData();
  }, [userId, dateFilter]);

  // Summaries derived reactively from loaded accounts and transactions
  const summary = useMemo(() => {
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.current_balance ?? acc.initial_balance ?? 0),
      0
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      if (t.type === "income") {
        totalIncome += Math.round(t.amount);
      } else if (t.type === "expense") {
        totalExpenses += Math.round(t.amount);
      }
    }

    const netCashFlow = totalIncome - totalExpenses;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      netCashFlow,
      transactionCount: transactions.length,
    };
  }, [accounts, transactions]);

  // Breakdown by category
  const categoryBreakdown = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === "expense");
    const map = new Map<string, { total: number; count: number }>();

    for (const t of expenseTx) {
      const cat = t.category_name || "Lainnya";
      const prev = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, {
        total: prev.total + Math.round(t.amount),
        count: prev.count + 1,
      });
    }

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage:
          summary.totalExpenses > 0
            ? Math.round((data.total / summary.totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, summary.totalExpenses]);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();

    for (const t of transactions) {
      const monthKey = t.date ? t.date.substring(0, 7) : "Unknown";
      const cur = map.get(monthKey) || { income: 0, expense: 0 };
      if (t.type === "income") cur.income += Math.round(t.amount);
      if (t.type === "expense") cur.expense += Math.round(t.amount);
      map.set(monthKey, cur);
    }

    return Array.from(map.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("Tidak ada data transaksi pada periode ini untuk diexport.");
      return;
    }

    const headers = [
      "ID",
      "Tanggal",
      "Tipe",
      "Kategori",
      "Akun",
      "Judul",
      "Nominal (IDR)",
      "Metode Pembayaran",
      "Sumber",
      "Catatan",
    ];

    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type === "income" ? "Pemasukan" : "Pengeluaran"}"`,
      `"${t.category_name || "-"}"`,
      `"${t.account_name || "-"}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.payment_method || "-"}"`,
      `"${t.input_source}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Laporan_Keuangan_Jobora_${dateFilter.startDate || "start"}_sd_${
        dateFilter.endDate || "end"
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF Export
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <AppShell title="Financial Reports" userName={userName}>
      <div className="print:hidden">
        <FinanceSubnav />
      </div>

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold font-heading text-gray-900 tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-sm leading-5 text-gray-500 mt-0.5">
            Ekspor dan evaluasi performa finansial periodik Anda dalam format CSV atau PDF cetak.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition shadow-2xs"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
          >
            <Printer size={16} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* Period Selection Bar */}
      <div className="bg-white border border-[#e2eaf0] rounded-2xl p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full text-[13px] font-semibold">
          <button
            type="button"
            onClick={() => setPeriodType("monthly")}
            className={`px-3.5 py-1.5 rounded-full transition ${
              periodType === "monthly"
                ? "bg-white text-[#107c74] shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => setPeriodType("quarterly")}
            className={`px-3.5 py-1.5 rounded-full transition ${
              periodType === "quarterly"
                ? "bg-white text-[#107c74] shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Kuartalan
          </button>
          <button
            type="button"
            onClick={() => setPeriodType("annual")}
            className={`px-3.5 py-1.5 rounded-full transition ${
              periodType === "annual"
                ? "bg-white text-[#107c74] shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tahunan
          </button>
          <button
            type="button"
            onClick={() => setPeriodType("custom")}
            className={`px-3.5 py-1.5 rounded-full transition ${
              periodType === "custom"
                ? "bg-white text-[#107c74] shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Kustom
          </button>
        </div>

        {/* Dynamic Period Inputs */}
        <div className="flex items-center gap-2 text-sm">
          {periodType === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-1.5 border border-gray-200 rounded-full bg-white font-medium text-sm text-gray-700"
            />
          )}

          {periodType === "quarterly" && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedQuarter}
                onChange={(val) => setSelectedQuarter(val)}
                className="w-44"
                size="sm"
                options={[
                  { value: "Q1", label: "Q1 (Jan - Mar)" },
                  { value: "Q2", label: "Q2 (Apr - Jun)" },
                  { value: "Q3", label: "Q3 (Jul - Sep)" },
                  { value: "Q4", label: "Q4 (Okt - Des)" },
                ]}
              />
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-24 px-3.5 py-1.5 border border-gray-200 rounded-full bg-white font-medium text-sm text-gray-700"
              />
            </div>
          )}

          {periodType === "annual" && (
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-28 px-3.5 py-1.5 border border-gray-200 rounded-full bg-white font-medium text-sm text-gray-700"
            />
          )}

          {periodType === "custom" && (
            <div className="flex items-center gap-2 text-sm">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3.5 py-1.5 border border-gray-200 rounded-full bg-white font-medium text-sm text-gray-700"
              />
              <span className="text-gray-400">s/d</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3.5 py-1.5 border border-gray-200 rounded-full bg-white font-medium text-sm text-gray-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="space-y-6">
        {/* Print Header */}
        <div className="hidden print:block border-b-2 border-[#107c74] pb-4 mb-4">
          <h1 className="text-2xl font-bold text-[#107c74] font-heading">
            Jobora Finance Tracker — Executive Report
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Periode: {dateFilter.startDate || "-"} s/d {dateFilter.endDate || "-"}
          </p>
        </div>

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">
              Total Pemasukan
            </span>
            <span className="text-[26px] leading-8 font-bold text-emerald-600 font-heading block mt-2">
              {formatIDR(summary.totalIncome)}
            </span>
          </div>

          <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">
              Total Pengeluaran
            </span>
            <span className="text-[26px] leading-8 font-bold text-rose-600 font-heading block mt-2">
              {formatIDR(summary.totalExpenses)}
            </span>
          </div>

          <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">
              Arus Kas Bersih (Net Flow)
            </span>
            <span
              className={`text-[26px] leading-8 font-bold font-heading block mt-2 ${
                summary.netCashFlow >= 0 ? "text-[#107c74]" : "text-rose-600"
              }`}
            >
              {formatIDR(summary.netCashFlow)}
            </span>
          </div>

          <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">
              Saldo Keseluruhan Akun
            </span>
            <span className="text-[26px] leading-8 font-bold text-gray-900 font-heading block mt-2">
              {formatIDR(summary.totalBalance)}
            </span>
          </div>
        </div>

        {/* 2. Monthly Financial Comparison Table */}
        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight mb-3">
            Perbandingan Finansial Bulanan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Bulan</th>
                  <th className="py-2.5 px-3 text-right">Pemasukan</th>
                  <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                  <th className="py-2.5 px-3 text-right">Arus Kas Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyComparison.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">
                      Tidak ada data transaksi untuk rentang ini.
                    </td>
                  </tr>
                ) : (
                  monthlyComparison.map((m) => (
                    <tr key={m.month} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {m.month}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                        {formatIDR(m.income)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-medium">
                        {formatIDR(m.expense)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          m.net >= 0 ? "text-[#107c74]" : "text-rose-600"
                        }`}
                      >
                        {formatIDR(m.net)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Expense Breakdown by Category */}
        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight mb-3">
            Rincian Pengeluaran Berdasarkan Kategori
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Transaksi</th>
                  <th className="py-2.5 px-3 text-right">Total Nominal</th>
                  <th className="py-2.5 px-3 text-right">Porsi (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">
                      Tidak ada pengeluaran pada rentang waktu ini.
                    </td>
                  </tr>
                ) : (
                  categoryBreakdown.map((cat) => (
                    <tr key={cat.name} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {cat.name}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600">
                        {cat.count}x
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                        {formatIDR(cat.total)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-500">
                        {cat.percentage}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Accounts Balance Summary */}
        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight mb-3">
            Ringkasan Saldo Akun Keuangan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/50"
              >
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="text-[13px] font-semibold text-gray-800">{acc.name}</span>
                  <span className="uppercase text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {acc.type}
                  </span>
                </div>
                <div className="text-base font-bold text-gray-900 font-heading">
                  {formatIDR(acc.current_balance ?? acc.initial_balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
