"use client";

import { useState } from "react";
import { FinancialAccount } from "@/types/finance";
import { formatIDR } from "@/lib/finance/format";
import {
  ArrowLeftRight,
  PlusCircle,
  Building2,
  Smartphone,
  Banknote,
  Coins,
  Wallet,
  Edit2,
  Trash2,
} from "lucide-react";
import { AccountDetailModal } from "@/components/finance/modals/AccountDetailModal";

interface AccountsSummaryWidgetProps {
  accounts: FinancialAccount[];
  onOpenTransferModal: () => void;
  onOpenAccountModal: () => void;
  onEditAccount?: (account: FinancialAccount) => void;
  onDeleteAccount?: (account: FinancialAccount) => void;
  onSelectAccount?: (account: FinancialAccount) => void;
}

export function AccountsSummaryWidget({
  accounts,
  onOpenTransferModal,
  onOpenAccountModal,
  onEditAccount,
  onDeleteAccount,
  onSelectAccount,
}: AccountsSummaryWidgetProps) {
  const [detailAccount, setDetailAccount] = useState<FinancialAccount | null>(
    null
  );

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Building2 size={15} />;
      case "ewallet":
        return <Smartphone size={15} />;
      case "investment":
        return <Coins size={15} />;
      case "cash":
        return <Banknote size={15} />;
      default:
        return <Wallet size={15} />;
    }
  };

  const handleCardClick = (acc: FinancialAccount) => {
    setDetailAccount(acc);
    if (onSelectAccount) {
      onSelectAccount(acc);
    }
  };

  // Find live account data for open modal (in case balance/fields updated)
  const currentDetailAccount = detailAccount
    ? accounts.find((a) => a.id === detailAccount.id) || detailAccount
    : null;

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
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(acc)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(acc);
              }
            }}
            className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-[#107c74]/40 hover:shadow-xs transition cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 text-left"
            title={`Klik untuk melihat detail ${acc.name}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13.5px] font-semibold text-gray-800 truncate flex items-center gap-2 group-hover:text-[#107c74] transition-colors">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-2xs"
                  style={{ backgroundColor: acc.color || "#107c74" }}
                >
                  {getAccountIcon(acc.type)}
                </span>
                <span className="truncate">{acc.name}</span>
              </span>
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] uppercase font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {acc.type}
                </span>
                {onEditAccount && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount(acc);
                    }}
                    className="p-1 text-gray-400 hover:text-[#107c74] rounded-md hover:bg-white transition"
                    title={`Edit ${acc.name}`}
                    aria-label={`Edit ${acc.name}`}
                  >
                    <Edit2 size={12} />
                  </button>
                )}
                {onDeleteAccount && accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAccount(acc);
                    }}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-white transition"
                    title={`Hapus ${acc.name}`}
                    aria-label={`Hapus ${acc.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-sm font-bold text-gray-900 font-heading">
                {formatIDR(acc.current_balance ?? acc.initial_balance)}
              </div>
              <span className="text-[11px] font-medium text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-[#107c74] transition-all">
                Detail &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Account Read-Only Detail Modal */}
      <AccountDetailModal
        isOpen={Boolean(detailAccount)}
        account={currentDetailAccount}
        onClose={() => setDetailAccount(null)}
        onEdit={(acc) => {
          setDetailAccount(null);
          if (onEditAccount) {
            onEditAccount(acc);
          }
        }}
        onDelete={
          onDeleteAccount
            ? (acc) => {
                setDetailAccount(null);
                onDeleteAccount(acc);
              }
            : undefined
        }
        canDelete={accounts.length > 1}
      />
    </div>
  );
}
