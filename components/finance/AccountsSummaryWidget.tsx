"use client";

import { FinancialAccount } from "@/types/finance";
import { formatIDR } from "@/lib/finance/format";
import {
  ArrowLeftRight,
  PlusCircle,
  Building2,
  Smartphone,
  Banknote,
  Edit2,
  Trash2,
} from "lucide-react";

interface AccountsSummaryWidgetProps {
  accounts: FinancialAccount[];
  onOpenTransferModal: () => void;
  onOpenAccountModal: () => void;
  onEditAccount?: (account: FinancialAccount) => void;
  onDeleteAccount?: (account: FinancialAccount) => void;
}

export function AccountsSummaryWidget({
  accounts,
  onOpenTransferModal,
  onOpenAccountModal,
  onEditAccount,
  onDeleteAccount,
}: AccountsSummaryWidgetProps) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Building2 size={16} />;
      case "ewallet":
        return <Smartphone size={16} />;
      case "cash":
      default:
        return <Banknote size={16} />;
    }
  };

  return (
    <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
            Rekening & Dompet
          </h3>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Kelola saldo multi-akun & transfer internal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTransferModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#107c74] text-[#107c74] hover:bg-[#e6faf7] transition"
            title="Transfer Antar Akun"
          >
            <ArrowLeftRight size={13} /> Transfer
          </button>
          <button
            type="button"
            onClick={onOpenAccountModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-2xs"
            title="Tambah Akun Baru"
          >
            <PlusCircle size={13} /> Tambah
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13.5px] font-semibold text-gray-800 truncate flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                  style={{ backgroundColor: acc.color || "#107c74" }}
                >
                  {getAccountIcon(acc.type)}
                </span>
                {acc.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {acc.type}
                </span>
                {onEditAccount && (
                  <button
                    type="button"
                    onClick={() => onEditAccount(acc)}
                    className="p-1 text-gray-400 hover:text-[#107c74] rounded-md hover:bg-white transition"
                    title={`Edit ${acc.name}`}
                  >
                    <Edit2 size={12} />
                  </button>
                )}
                {onDeleteAccount && accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteAccount(acc)}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-white transition"
                    title={`Hapus ${acc.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm font-bold text-gray-900 font-heading">
              {formatIDR(acc.current_balance ?? acc.initial_balance)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
