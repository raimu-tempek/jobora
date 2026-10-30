"use client";

import { useState, useEffect } from "react";
import { FinancialAccount } from "@/types/finance";
import { X, ArrowRight, ArrowLeftRight } from "lucide-react";
import { formatIDR } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Select } from "@/components/ui/select";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    fee?: number;
    transfer_date: string;
    notes?: string;
  }) => void;
  accounts: FinancialAccount[];
}

export function TransferModal({
  isOpen,
  onClose,
  onSave,
  accounts,
}: TransferModalProps) {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Close on Escape key
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      alert("Akun sumber dan akun tujuan tidak boleh sama.");
      return;
    }
    const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
    if (cleanAmount <= 0) {
      alert("Nominal transfer harus lebih besar dari 0.");
      return;
    }
    const cleanFee = Math.max(0, Math.round(Number(fee) || 0));

    onSave({
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount: cleanAmount,
      fee: cleanFee,
      transfer_date: date,
      notes: notes.trim(),
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
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[#e2eaf0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e6faf7] text-[#107c74] flex items-center justify-center">
              <ArrowLeftRight size={18} />
            </div>
            <h2 className="text-base font-bold text-gray-900 font-heading">
              Transfer Antar Akun
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500">
            Transfer dana internal antar rekening atau e-wallet. Tidak dihitung sebagai pemasukan atau pengeluaran.
          </p>

          {/* Account Route Selection */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dari Akun (Sumber)
              </label>
              <Select
                required
                value={fromAccountId}
                onChange={(val) => setFromAccountId(val)}
                placeholder="Pilih Akun Asal"
                size="sm"
                options={accounts.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${formatIDR(a.current_balance ?? a.initial_balance)})`,
                }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ke Akun (Tujuan)
              </label>
              <Select
                required
                value={toAccountId}
                onChange={(val) => setToAccountId(val)}
                placeholder="Pilih Akun Tujuan"
                size="sm"
                options={accounts.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${formatIDR(a.current_balance ?? a.initial_balance)})`,
                }))}
              />
            </div>
          </div>

          {/* Amount & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nominal Transfer <span className="text-rose-500">*</span>
              </label>
              <CurrencyInput
                required
                placeholder="cth. 100.000"
                value={amount}
                onChange={(val) => setAmount(val)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Biaya Admin (Jika ada)
              </label>
              <CurrencyInput
                placeholder="0"
                value={fee}
                onChange={(val) => setFee(val)}
                showTerbilang={false}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tanggal Transfer <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="cth. Top-up e-wallet, tarik tunai ATM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <ArrowRight size={14} /> Proses Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
