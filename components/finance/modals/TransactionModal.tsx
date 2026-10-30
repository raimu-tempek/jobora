"use client";

import { useState, useEffect } from "react";
import {
  FinancialTransaction,
  FinancialAccount,
  FinancialCategory,
  TransactionType,
} from "@/types/finance";
import { checkForDuplicateTransaction } from "@/lib/finance/service";
import { X, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { formatIDR } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Select } from "@/components/ui/select";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<FinancialTransaction>) => void;
  userId: string;
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  initialData?: FinancialTransaction | null;
  onSwitchToScanner?: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  userId,
  accounts,
  categories,
  initialData,
  onSwitchToScanner,
}: TransactionModalProps) {
  const isEditing = Boolean(initialData);

  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [description, setDescription] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(initialData.amount ? String(initialData.amount) : "");
      setDate(initialData.date);
      setAccountId(initialData.account_id);
      setCategoryId(initialData.category_id || "");
      setPaymentMethod(initialData.payment_method || "Tunai");
      setDescription(initialData.description || "");
    } else {
      setType("expense");
      setTitle("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setAccountId(accounts[0]?.id || "");
      const defExpCat = categories.find((c) => c.type === "expense");
      setCategoryId(defExpCat?.id || "");
      setPaymentMethod("Tunai");
      setDescription("");
    }
  }, [initialData, isOpen, accounts, categories]);

  // Check for duplicate warning on blur/change
  useEffect(() => {
    if (!userId || !amount || !date || !accountId) {
      setDuplicateWarning(null);
      return;
    }
    const num = Math.round(Number(amount));
    if (num > 0) {
      const dup = checkForDuplicateTransaction(
        userId,
        num,
        date,
        accountId,
        initialData?.id
      );
      if (dup) {
        setDuplicateWarning(
          `Peringatan duplikasi: Ditemukan transaksi "${dup.title}" dengan nominal ${formatIDR(
            dup.amount
          )} pada akun dan tanggal yang sama.`
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [amount, date, accountId, userId, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Judul transaksi wajib diisi.");
      return;
    }
    const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
    if (cleanAmount <= 0) {
      alert("Nominal transaksi harus lebih dari 0.");
      return;
    }
    if (!accountId) {
      alert("Pilih akun keuangan.");
      return;
    }

    onSave({
      title: title.trim(),
      type,
      amount: cleanAmount,
      date,
      account_id: accountId,
      category_id: categoryId || undefined,
      payment_method: paymentMethod,
      description: description.trim(),
      input_source: initialData?.input_source || "manual",
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 font-heading">
            {isEditing ? "Edit Transaksi" : "Tambah Transaksi Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Quick CTA to Scanner Modal if user has physical receipt */}
          {onSwitchToScanner && !isEditing && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/70 border border-[#107c74]/20 text-[#107c74]">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles size={15} className="shrink-0 text-[#107c74]" />
                <span className="font-medium text-gray-800">
                  Punya struk fisik belanja?
                </span>
              </div>
              <button
                type="button"
                onClick={onSwitchToScanner}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#107c74] hover:text-[#0d6861] hover:underline"
              >
                <span>Scan otomatis di sini</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  const def = categories.find((c) => c.type === "expense");
                  setCategoryId(def?.id || "");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  type === "expense"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pengeluaran (Expense)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  const def = categories.find((c) => c.type === "income");
                  setCategoryId(def?.id || "");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  type === "income"
                    ? "bg-white text-emerald-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pemasukan (Income)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Judul Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={type === "expense" ? "cth. Makan Siang, Bensin" : "cth. Gaji Bulanan, Bonus Proyek"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nominal (IDR) <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                required
                placeholder="cth. 50.000"
                value={amount}
                onChange={(val) => setAmount(val)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
              />
            </div>
          </div>

          {/* Account & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Akun Keuangan <span className="text-rose-500">*</span>
              </label>
              <Select
                required
                value={accountId}
                onChange={(val) => setAccountId(val)}
                placeholder="Pilih Akun"
                size="sm"
                options={accounts.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${formatIDR(a.current_balance ?? a.initial_balance)})`,
                }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kategori
              </label>
              <Select
                value={categoryId}
                onChange={(val) => setCategoryId(val)}
                placeholder="Pilih Kategori"
                size="sm"
                options={[
                  { value: "", label: "Pilih Kategori" },
                  ...filteredCategories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Metode Pembayaran
            </label>
            <Select
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val)}
              placeholder="Pilih Metode Pembayaran"
              size="sm"
              options={[
                { value: "Tunai", label: "Tunai / Cash" },
                { value: "Transfer Bank", label: "Transfer Bank" },
                { value: "QRIS", label: "QRIS" },
                { value: "Kartu Debit", label: "Kartu Debit" },
                { value: "Kartu Kredit", label: "Kartu Kredit" },
                { value: "E-Wallet", label: "E-Wallet (GoPay / OVO / ShopeePay)" },
              ]}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Catatan / Deskripsi (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs"
            >
              {isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
