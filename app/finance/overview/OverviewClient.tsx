"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceSubnav } from "@/components/finance/FinanceSubnav";
import { FinanceKpiCard } from "@/components/finance/FinanceKpiCard";
import { FinanceFilterBar } from "@/components/finance/FinanceFilterBar";
import { IncomeExpenseChart } from "@/components/finance/IncomeExpenseChart";
import { ExpenseCategoryPie } from "@/components/finance/ExpenseCategoryPie";
import { CashFlowTrendChart } from "@/components/finance/CashFlowTrendChart";
import { BudgetOverviewCard } from "@/components/finance/BudgetOverviewCard";
import { RecentTransactionsCard } from "@/components/finance/RecentTransactionsCard";
import { AccountsSummaryWidget } from "@/components/finance/AccountsSummaryWidget";
import { TransactionModal } from "@/components/finance/modals/TransactionModal";
import { TransferModal } from "@/components/finance/modals/TransferModal";
import { AccountModal } from "@/components/finance/modals/AccountModal";
import { TransactionDetailModal } from "@/components/finance/modals/TransactionDetailModal";
import {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  FinancialBudget,
  DateFilter,
} from "@/types/finance";
import {
  getAccounts,
  getCategories,
  getTransactions,
  getBudgets,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransfer,
  createAccount,
  updateAccount,
  deleteAccount,
  getFinanceSummary,
} from "@/lib/finance/service";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  PlusCircle,
  Upload,
} from "lucide-react";

interface OverviewClientProps {
  userId: string;
  userName?: string;
}

export function OverviewClient({ userId, userName }: OverviewClientProps) {
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    range: "this_month",
  });

  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<FinancialBudget[]>([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalInitialTab, setTxModalInitialTab] = useState<"manual" | "scan">("manual");
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<FinancialTransaction | null>(null);

  const loadData = () => {
    if (!userId) return;
    const accs = getAccounts(userId);
    const cats = getCategories(userId);
    const txs = getTransactions(userId, dateFilter);
    const bgs = getBudgets(userId, currentMonthStr);

    setAccounts(accs);
    setCategories(cats);
    setTransactions(txs);
    setBudgets(bgs);

    if (selectedTxDetail) {
      const refreshed = txs.find((t) => t.id === selectedTxDetail.id);
      if (refreshed) {
        setSelectedTxDetail(refreshed);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, dateFilter]);

  // Dynamic Metrics
  const summary = useMemo(() => {
    return getFinanceSummary(userId, dateFilter);
  }, [userId, dateFilter, accounts, transactions]);

  // Handlers
  const handleSaveTransaction = (data: Partial<FinancialTransaction>) => {
    if (editingTx) {
      const updated = updateTransaction(userId, editingTx.id, data);
      if (updated && selectedTxDetail?.id === updated.id) {
        setSelectedTxDetail(updated);
      }
    } else {
      createTransaction(userId, data as any);
    }
    setEditingTx(null);
    loadData();
  };

  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${tx.title}"?`)) {
      deleteTransaction(userId, tx.id);
      if (selectedTxDetail?.id === tx.id) {
        setSelectedTxDetail(null);
      }
      loadData();
    }
  };

  const handleProcessTransfer = (transferData: any) => {
    createTransfer(userId, transferData);
    loadData();
  };

  const handleSaveAccount = (accData: Partial<FinancialAccount>) => {
    if (editingAccount) {
      updateAccount(userId, editingAccount.id, accData);
    } else {
      createAccount(userId, accData);
    }
    setEditingAccount(null);
    loadData();
  };

  const handleDeleteAccount = (acc: FinancialAccount) => {
    if (accounts.length <= 1) {
      alert("Minimal harus ada 1 akun keuangan.");
      return;
    }

    if (
      confirm(
        `Apakah Anda yakin ingin menghapus akun "${acc.name}"? Transaksi yang terhubung dengan akun ini akan dialihkan ke akun utama secara otomatis.`
      )
    ) {
      try {
        deleteAccount(userId, acc.id);
        setIsAccountModalOpen(false);
        setEditingAccount(null);
        loadData();
      } catch (err: any) {
        alert(err.message || "Gagal menghapus akun.");
      }
    }
  };

  return (
    <AppShell title="Finance Tracker" userName={userName}>
      <FinanceSubnav />

      {/* Header action toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold font-heading text-gray-900 tracking-tight">
            Ringkasan Keuangan
          </h1>
          <p className="text-sm leading-5 text-gray-500 mt-0.5">
            Pantau arus kas, pemasukan, pengeluaran, dan anggaran Anda dalam satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setTxModalInitialTab("scan");
              setIsTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-[#107c74] text-[#107c74] bg-[#e6faf7]/40 hover:bg-[#e6faf7] transition shadow-2xs"
          >
            <Upload size={16} /> Unggah Struk
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setTxModalInitialTab("manual");
              setIsTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
          >
            <PlusCircle size={16} /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <FinanceFilterBar filter={dateFilter} onChange={setDateFilter} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <FinanceKpiCard
          label="Total Saldo Saat Ini"
          amount={summary.totalBalance}
          icon={<Wallet size={20} />}
          iconBgColor="#e6faf7"
          iconColor="#107c74"
          variant="neutral"
          subtitle="Saldo gabungan seluruh akun aktif"
        />
        <FinanceKpiCard
          label="Total Pemasukan"
          amount={summary.totalIncome}
          icon={<TrendingUp size={20} />}
          iconBgColor="#dcfce7"
          iconColor="#10b981"
          variant="positive"
          subtitle={`${summary.transactionCount} transaksi pada filter`}
        />
        <FinanceKpiCard
          label="Total Pengeluaran"
          amount={summary.totalExpenses}
          icon={<TrendingDown size={20} />}
          iconBgColor="#fee2e2"
          iconColor="#dc2626"
          variant="negative"
          subtitle="Pengeluaran terkonfirmasi"
        />
        <FinanceKpiCard
          label="Arus Kas Bersih (Net Flow)"
          amount={summary.netCashFlow}
          icon={<Scale size={20} />}
          iconBgColor={summary.netCashFlow >= 0 ? "#e6faf7" : "#fee2e2"}
          iconColor={summary.netCashFlow >= 0 ? "#107c74" : "#dc2626"}
          variant={summary.netCashFlow >= 0 ? "positive" : "negative"}
          subtitle="Pemasukan dikurangi Pengeluaran"
        />
      </div>

      {/* Multiple Accounts & Transfers Widget */}
      <div className="mb-6">
        <AccountsSummaryWidget
          accounts={accounts}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
          onOpenAccountModal={() => {
            setEditingAccount(null);
            setIsAccountModalOpen(true);
          }}
          onEditAccount={(acc) => {
            setEditingAccount(acc);
            setIsAccountModalOpen(true);
          }}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Pemasukan vs Pengeluaran
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Perbandingan arus dana masuk dan keluar
              </p>
            </div>
          </div>
          <IncomeExpenseChart transactions={transactions} />
        </div>

        {/* Expense Category Donut */}
        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Distribusi Pengeluaran
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">Berdasarkan kategori belanja</p>
            </div>
          </div>
          <ExpenseCategoryPie transactions={transactions} />
        </div>
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cash Flow Trend */}
        <div className="lg:col-span-2 bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Tren Arus Kas Bulanan
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Pertumbuhan akumulasi surplus/defisit bulanan
              </p>
            </div>
          </div>
          <CashFlowTrendChart transactions={transactions} />
        </div>

        {/* Budget Progress Overview */}
        <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                  Progres Anggaran Bulan Ini
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Batas belanja per kategori</p>
              </div>
            </div>
            <BudgetOverviewCard
              budgets={budgets}
              currentMonth={currentMonthStr}
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
              Transaksi Terkini
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Catatan transaksi terbaru pada akun Anda
            </p>
          </div>
        </div>
        <RecentTransactionsCard
          transactions={transactions}
          onOpenCreateModal={() => {
            setEditingTx(null);
            setTxModalInitialTab("manual");
            setIsTxModalOpen(true);
          }}
          onOpenScanModal={() => {
            setEditingTx(null);
            setTxModalInitialTab("scan");
            setIsTxModalOpen(true);
          }}
          onSelectTransaction={(t) => setSelectedTxDetail(t)}
          onEditTransaction={(t) => {
            setEditingTx(t);
            setTxModalInitialTab("manual");
            setIsTxModalOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        initialTab={txModalInitialTab}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        userId={userId}
        accounts={accounts}
        categories={categories}
        initialData={editingTx}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={handleProcessTransfer}
        accounts={accounts}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        initialData={editingAccount}
        onDelete={handleDeleteAccount}
        canDelete={accounts.length > 1}
      />

      <TransactionDetailModal
        isOpen={Boolean(selectedTxDetail)}
        onClose={() => setSelectedTxDetail(null)}
        transaction={selectedTxDetail}
        onEdit={(tx) => {
          setEditingTx(tx);
          setIsTxModalOpen(true);
        }}
        onDelete={handleDeleteTransaction}
      />
    </AppShell>
  );
}
