"use client";

import { useEffect } from "react";
import { FinancialAccount } from "@/types/finance";
import { formatIDR, formatDateIndo } from "@/lib/finance/format";
import {
  X,
  Building2,
  Smartphone,
  Banknote,
  Coins,
  Wallet,
  Calendar,
  Hash,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: FinancialAccount | null;
  onEdit?: (account: FinancialAccount) => void;
  onDelete?: (account: FinancialAccount) => void;
  canDelete?: boolean;
}

export function AccountDetailModal({
  isOpen,
  onClose,
  account,
  onEdit,
  onDelete,
  canDelete = false,
}: AccountDetailModalProps) {
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

  if (!isOpen || !account) return null;

  const getAccountTypeDetails = (type: string) => {
    switch (type) {
      case "bank":
        return {
          label: "Bank Account (Rekening Bank)",
          shortLabel: "Bank",
          icon: <Building2 size={16} />,
        };
      case "ewallet":
        return {
          label: "E-Wallet (Dompet Digital)",
          shortLabel: "E-Wallet",
          icon: <Smartphone size={16} />,
        };
      case "investment":
        return {
          label: "Investasi / Reksadana / Saham",
          shortLabel: "Investasi",
          icon: <Coins size={16} />,
        };
      case "cash":
        return {
          label: "Tunai / Cash",
          shortLabel: "Tunai",
          icon: <Banknote size={16} />,
        };
      default:
        return {
          label: "Akun Keuangan Lainnya",
          shortLabel: "Lainnya",
          icon: <Wallet size={16} />,
        };
    }
  };

  const typeInfo = getAccountTypeDetails(account.type);
  const currentBalance = account.current_balance ?? account.initial_balance;
  const initialBalance = account.initial_balance ?? 0;
  const accountColor = account.color || "#107c74";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-2xs shrink-0"
              style={{ backgroundColor: accountColor }}
            >
              {typeInfo.icon}
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-heading">
                Detail Akun Keuangan
              </h2>
              <p className="text-[12px] text-gray-500">
                Informasi saldo & konfigurasi rekening
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition hover:bg-gray-100"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Balance Hero Card */}
          <div className="text-center py-4 px-5 bg-gradient-to-b from-[#e6faf7]/40 to-gray-50 rounded-2xl border border-[#107c74]/15">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Saldo Saat Ini
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Aktif
              </span>
            </div>
            <div className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
              {formatIDR(currentBalance)}
            </div>
            <div className="text-gray-700 font-semibold text-sm mt-1 flex items-center justify-center gap-1.5">
              <span>{account.name}</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tipe Akun */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-2.5">
              <Tag size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Tipe Akun
                </span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {typeInfo.shortLabel}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  {typeInfo.label}
                </span>
              </div>
            </div>

            {/* Saldo Awal */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-2.5">
              <Wallet size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Saldo Awal
                </span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {formatIDR(initialBalance)}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  Modal pembukaan akun
                </span>
              </div>
            </div>

            {/* Warna Penanda */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-2.5">
              <span
                className="w-4 h-4 rounded-full shrink-0 mt-0.5 border border-black/10 shadow-2xs"
                style={{ backgroundColor: accountColor }}
              />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Warna Penanda
                </span>
                <span className="font-mono font-medium text-gray-800 block mt-0.5">
                  {accountColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Tanggal / Status */}
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-2.5">
              <Calendar size={16} className="text-[#107c74] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                  Terdaftar Sejak
                </span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {account.created_at
                    ? formatDateIndo(account.created_at.split("T")[0])
                    : "Tersimpan"}
                </span>
              </div>
            </div>
          </div>

          {/* Account ID / Reference */}
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/30 flex items-center justify-between text-gray-500">
            <span className="text-[11px] flex items-center gap-1.5 font-medium">
              <Hash size={13} className="text-gray-400" /> ID Akun:
            </span>
            <span className="font-mono text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
              {account.id}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div>
            {onDelete && canDelete && (
              <button
                type="button"
                onClick={() => onDelete(account)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                title={`Hapus ${account.name}`}
              >
                <Trash2 size={13} /> Hapus
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition"
            >
              Tutup
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(account)}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-xl transition shadow-xs"
              >
                <Edit2 size={13} /> Edit Akun
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
