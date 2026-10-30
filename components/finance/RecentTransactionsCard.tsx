import Link from "next/link";
import { FinancialTransaction } from "@/types/finance";
import { formatIDR, formatDateIndo } from "@/lib/finance/format";
import { ArrowRight, Receipt, PlusCircle, Upload, Edit2 } from "lucide-react";

interface RecentTransactionsCardProps {
  transactions: FinancialTransaction[];
  onOpenCreateModal?: () => void;
  onOpenScanModal?: () => void;
  onSelectTransaction?: (tx: FinancialTransaction) => void;
  onEditTransaction?: (tx: FinancialTransaction) => void;
}

export function RecentTransactionsCard({
  transactions,
  onOpenCreateModal,
  onOpenScanModal,
  onSelectTransaction,
  onEditTransaction,
}: RecentTransactionsCardProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt size={36} className="text-gray-300 mb-2" />
        <p className="text-gray-700 font-semibold text-sm">Belum Ada Transaksi</p>
        <p className="text-gray-400 text-xs mt-1 mb-4">
          Catat transaksi manual atau unggah struk belanja untuk mulai mencatat keuangan Anda.
        </p>
        <div className="flex items-center gap-2">
          {onOpenCreateModal && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition"
            >
              <PlusCircle size={14} /> Tambah Transaksi
            </button>
          )}
          {onOpenScanModal ? (
            <button
              type="button"
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#107c74] text-[#107c74] hover:bg-[#e6faf7] transition"
            >
              <Upload size={14} /> Unggah Struk
            </button>
          ) : (
            <Link
              href="/finance/transactions"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#107c74] text-[#107c74] hover:bg-[#e6faf7] transition"
            >
              <Upload size={14} /> Unggah Struk
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[11px] pb-2">
              <th className="py-2.5">Transaksi</th>
              <th className="py-2.5">Kategori</th>
              <th className="py-2.5">Akun</th>
              <th className="py-2.5 text-right">Nominal</th>
              {(onSelectTransaction || onEditTransaction) && (
                <th className="py-2.5 text-center w-12">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.slice(0, 5).map((t) => {
              const isIncome = t.type === "income";
              return (
                <tr
                  key={t.id}
                  className={`hover:bg-gray-50/50 transition ${
                    onSelectTransaction ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onSelectTransaction?.(t)}
                >
                  <td className="py-3">
                    <div className="font-semibold text-gray-900 truncate max-w-[180px] text-sm">
                      {t.title}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span>{formatDateIndo(t.date)}</span>
                      {t.input_source === "receipt_ocr" && (
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-1 rounded text-[10px]">
                          OCR
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">
                      {t.category_name || "Lainnya"}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 font-medium">
                    {t.account_name || "Utama"}
                  </td>
                  <td className="py-3 text-right font-bold whitespace-nowrap text-sm">
                    <span
                      className={isIncome ? "text-emerald-600" : "text-rose-600"}
                    >
                      {isIncome ? "+" : "-"} {formatIDR(t.amount)}
                    </span>
                  </td>
                  {(onSelectTransaction || onEditTransaction) && (
                    <td
                      className="py-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onEditTransaction
                            ? onEditTransaction(t)
                            : onSelectTransaction?.(t)
                        }
                        className="p-1 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 transition"
                        title="Edit Transaksi"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-right">
        <Link
          href="/finance/transactions"
          className="text-sm font-semibold text-[#107c74] hover:underline inline-flex items-center gap-1"
        >
          Lihat Semua Transaksi <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
