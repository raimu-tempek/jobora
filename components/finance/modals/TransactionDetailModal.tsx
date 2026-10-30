"use client";

import { useEffect } from "react";
import { FinancialTransaction } from "@/types/finance";
import { formatIDR, formatDateIndo } from "@/lib/finance/format";
import { X, Receipt, Calendar, CreditCard, Building2, Tag, Edit3, Trash2 } from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FinancialTransaction | null;
  onEdit: (tx: FinancialTransaction) => void;
  onDelete: (tx: FinancialTransaction) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  useBodyScrollLock(isOpen);
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

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === "income";

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
          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                isIncome
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <Receipt size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900 font-heading">
                Detail Transaksi
              </h2>
              <span className="text-[11px] text-gray-400">
                ID: {transaction.id.slice(0, 16)}...
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Amount Hero */}
          <div className="text-center py-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              {isIncome ? "Pemasukan (Income)" : "Pengeluaran (Expense)"}
            </span>
            <div
              className={`text-2xl font-bold font-heading ${
                isIncome ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isIncome ? "+" : "-"} {formatIDR(transaction.amount)}
            </div>
            <div className="text-gray-700 font-semibold text-sm mt-1">
              {transaction.title}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
              <Calendar size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Tanggal
                </span>
                <span className="font-semibold text-gray-800">
                  {formatDateIndo(transaction.date)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
              <Tag size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Kategori
                </span>
                <span className="font-semibold text-gray-800">
                  {transaction.category_name || "Lainnya"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
              <Building2 size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Akun Keuangan
                </span>
                <span className="font-semibold text-gray-800">
                  {transaction.account_name || "Utama"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 flex items-start gap-2.5">
              <CreditCard size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Metode Bayar
                </span>
                <span className="font-semibold text-gray-800">
                  {transaction.payment_method || "Tunai"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                Catatan
              </span>
              <p className="text-gray-700 whitespace-pre-wrap">
                {transaction.description}
              </p>
            </div>
          )}

          {/* Receipt Data & Breakdown (if scanned from OCR) */}
          {transaction.receipt_data && transaction.receipt_data.items?.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-2">
                Rincian Barang dari Struk
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 pb-1 text-[11px]">
                      <th>Barang</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Harga</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    {transaction.receipt_data.items.map((item, i) => (
                      <tr key={i} className="py-1">
                        <td className="py-1.5 font-medium text-gray-800">{item.name}</td>
                        <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-1.5 text-right text-gray-600">{formatIDR(item.unit_price)}</td>
                        <td className="py-1.5 text-right font-semibold text-gray-900">{formatIDR(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Receipt Image Preview */}
          {transaction.receipt_url && (
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1.5">
                Foto Bukti Struk
              </span>
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 max-h-56 flex items-center justify-center">
                <img
                  src={transaction.receipt_url}
                  alt="Bukti Struk"
                  className="max-h-56 object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
          <button
            type="button"
            onClick={() => {
              onDelete(transaction);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <Trash2 size={14} /> Hapus
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-xl transition shadow-xs"
            >
              <Edit3 size={14} /> Edit Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
