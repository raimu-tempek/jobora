"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceSubnav } from "@/components/finance/FinanceSubnav";
import { TransactionModal } from "@/components/finance/modals/TransactionModal";
import { TransactionDetailModal } from "@/components/finance/modals/TransactionDetailModal";
import {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  TransactionType,
} from "@/types/finance";
import {
  getAccounts,
  getCategories,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/finance/service";
import { formatIDR, formatDateIndo } from "@/lib/finance/format";
import { Select } from "@/components/ui/select";
import {
  PlusCircle,
  Upload,
  Search,
  Eye,
  Edit2,
  Trash2,
  Receipt,
} from "lucide-react";

interface TransactionsClientProps {
  userId: string;
  userName?: string;
}

export function TransactionsClient({
  userId,
  userName,
}: TransactionsClientProps) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalInitialTab, setTxModalInitialTab] = useState<"manual" | "scan">("manual");
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] =
    useState<FinancialTransaction | null>(null);

  const loadData = () => {
    if (!userId) return;
    const accs = getAccounts(userId);
    const cats = getCategories(userId);
    const txs = getTransactions(userId);
    setAccounts(accs);
    setCategories(cats);
    setTransactions(txs);

    if (selectedTxDetail) {
      const refreshed = txs.find((t) => t.id === selectedTxDetail.id);
      if (refreshed) {
        setSelectedTxDetail(refreshed);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchCat = t.category_name?.toLowerCase().includes(q);
          const matchAcc = t.account_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchAcc) return false;
        }

        // Type filter
        if (typeFilter !== "all" && t.type !== typeFilter) return false;

        // Account filter
        if (accountFilter !== "all" && t.account_id !== accountFilter) return false;

        // Category filter
        if (categoryFilter !== "all" && t.category_id !== categoryFilter)
          return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "desc"
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date);
        } else {
          return sortDirection === "desc" ? b.amount - a.amount : a.amount - b.amount;
        }
      });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    accountFilter,
    categoryFilter,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleSaveTransaction = (data: Partial<FinancialTransaction>) => {
    if (editingTx) {
      updateTransaction(userId, editingTx.id, data);
    } else {
      createTransaction(userId, data as any);
    }
    setEditingTx(null);
    loadData();
  };

  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    if (confirm(`Yakin ingin menghapus transaksi "${tx.title}"?`)) {
      deleteTransaction(userId, tx.id);
      if (selectedTxDetail?.id === tx.id) {
        setSelectedTxDetail(null);
      }
      loadData();
    }
  };

  return (
    <AppShell title="Transactions" userName={userName}>
      <FinanceSubnav />

      {/* Header action toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold font-heading text-gray-900 tracking-tight">
            Daftar Transaksi
          </h1>
          <p className="text-sm leading-5 text-gray-500 mt-0.5">
            Kelola seluruh transaksi keuangan Anda dengan pencarian dan filter mendalam.
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

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#e2eaf0] rounded-2xl p-4 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari transaksi, toko, catatan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          {/* Type Filter */}
          <div>
            <Select
              value={typeFilter}
              onChange={(val) => {
                setTypeFilter(val as TransactionType | "all");
                setCurrentPage(1);
              }}
              size="sm"
              options={[
                { value: "all", label: "Semua Tipe Transaksi" },
                { value: "expense", label: "Pengeluaran (Expense)" },
                { value: "income", label: "Pemasukan (Income)" },
              ]}
            />
          </div>

          {/* Account Filter */}
          <div>
            <Select
              value={accountFilter}
              onChange={(val) => {
                setAccountFilter(val);
                setCurrentPage(1);
              }}
              size="sm"
              options={[
                { value: "all", label: "Semua Rekening / Akun" },
                ...accounts.map((a) => ({
                  value: a.id,
                  label: a.name,
                })),
              ]}
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(1);
              }}
              size="sm"
              options={[
                { value: "all", label: "Semua Kategori" },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Urutkan:</span>
            <button
              type="button"
              onClick={() => {
                if (sortField === "date") {
                  setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                } else {
                  setSortField("date");
                  setSortDirection("desc");
                }
              }}
              className={`px-3 py-1 rounded-full border flex items-center gap-1 transition ${
                sortField === "date"
                  ? "bg-[#e6faf7] border-[#107c74] text-[#107c74] font-semibold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Tanggal {sortField === "date" && (sortDirection === "desc" ? "↓" : "↑")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortField === "amount") {
                  setSortDirection(sortDirection === "desc" ? "asc" : "desc");
                } else {
                  setSortField("amount");
                  setSortDirection("desc");
                }
              }}
              className={`px-3 py-1 rounded-full border flex items-center gap-1 transition ${
                sortField === "amount"
                  ? "bg-[#e6faf7] border-[#107c74] text-[#107c74] font-semibold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Nominal {sortField === "amount" && (sortDirection === "desc" ? "↓" : "↑")}
            </button>
          </div>
          <div>
            Menampilkan <span className="font-semibold text-gray-800">{filteredTransactions.length}</span> transaksi
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#e2eaf0] rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt size={44} className="text-gray-300 mb-2" />
            <h3 className="font-heading font-bold text-gray-800 text-base">
              Tidak Ada Transaksi yang Cocok
            </h3>
            <p className="text-gray-500 text-sm mt-1 mb-4 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau filter yang Anda pilih.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setAccountFilter("all");
                setCategoryFilter("all");
              }}
              className="text-sm font-semibold text-[#107c74] hover:underline"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Transaksi & Keterangan</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Akun & Metode</th>
                  <th className="py-3.5 px-4 text-right">Nominal</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.map((t) => {
                  const isIncome = t.type === "income";
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/60 transition group cursor-pointer"
                      onClick={() => setSelectedTxDetail(t)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 font-medium">
                        {formatDateIndo(t.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          <span>{t.title}</span>
                          {t.input_source === "receipt_ocr" && (
                            <span className="bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                              OCR
                            </span>
                          )}
                          {t.receipt_url && (
                            <Receipt size={14} className="text-gray-400" />
                          )}
                        </div>
                        {t.description && (
                          <div className="text-gray-400 text-xs truncate max-w-xs mt-0.5">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">
                          {t.category_name || "Lainnya"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                        <div className="font-semibold text-gray-800 text-[13.5px]">
                          {t.account_name || "Utama"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {t.payment_method || "Tunai"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-sm">
                        <span
                          className={isIncome ? "text-emerald-600" : "text-rose-600"}
                        >
                          {isIncome ? "+" : "-"} {formatIDR(t.amount)}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTxDetail(t)}
                            title="Lihat Detail"
                            className="p-1 text-gray-400 hover:text-[#107c74] rounded-lg hover:bg-gray-100 transition"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTx(t);
                              setIsTxModalOpen(true);
                            }}
                            title="Edit"
                            className="p-1 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 transition"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(t)}
                            title="Hapus"
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
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

      <TransactionDetailModal
        isOpen={Boolean(selectedTxDetail)}
        onClose={() => setSelectedTxDetail(null)}
        transaction={selectedTxDetail}
        onEdit={(tx) => {
          setEditingTx(tx);
          setTxModalInitialTab("manual");
          setIsTxModalOpen(true);
        }}
        onDelete={handleDeleteTransaction}
      />
    </AppShell>
  );
}
