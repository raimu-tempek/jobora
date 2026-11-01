"use client";

import { useState, useEffect } from "react";
import { FinancialAccount, AccountType } from "@/types/finance";
import { X, Trash2 } from "lucide-react";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Select } from "@/components/ui/select";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FinancialAccount>) => void;
  initialData?: FinancialAccount | null;
  onDelete?: (account: FinancialAccount) => void;
  canDelete?: boolean;
}

const COLORS = [
  "#107c74",
  "#2563eb",
  "#059669",
  "#7c3aed",
  "#ea580c",
  "#e11d48",
  "#475569",
];

export function AccountModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  onDelete,
  canDelete = true,
}: AccountModalProps) {
  useBodyScrollLock(isOpen);
  const isEditing = Boolean(initialData);

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [initialBalance, setInitialBalance] = useState("");
  const [color, setColor] = useState("#107c74");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setInitialBalance(String(initialData.initial_balance || 0));
      setColor(initialData.color || "#107c74");
    } else {
      setName("");
      setType("bank");
      setInitialBalance("0");
      setColor("#107c74");
    }
  }, [initialData, isOpen]);

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
    if (!name.trim()) {
      alert("Nama akun wajib diisi.");
      return;
    }

    onSave({
      name: name.trim(),
      type,
      initial_balance: Math.max(0, Math.round(Number(initialBalance) || 0)),
      color,
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
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-heading">
              {isEditing ? "Kelola Akun Keuangan" : "Tambah Akun Keuangan"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? "Ubah data akun, saldo, atau hapus akun ini"
                : "Tambahkan rekening bank, e-wallet, atau dompet tunai baru"}
            </p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Akun / Rekening <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="cth. BCA Utama, GoPay, Dompet Tunai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tipe Akun
            </label>
            <Select
              value={type}
              onChange={(val) => setType(val as AccountType)}
              size="sm"
              options={[
                { value: "bank", label: "Bank Account (Rekening Bank)" },
                { value: "ewallet", label: "E-Wallet (GoPay, OVO, ShopeePay)" },
                { value: "cash", label: "Tunai / Cash" },
                { value: "investment", label: "Investasi / Reksadana / Saham" },
                { value: "other", label: "Lainnya" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Saldo Awal (IDR) <span className="text-rose-500">*</span>
            </label>
            <CurrencyInput
              required
              placeholder="0"
              value={initialBalance}
              onChange={(val) => setInitialBalance(val)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Warna Penanda
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    color === c ? "border-gray-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            {isEditing && onDelete && initialData ? (
              <button
                type="button"
                onClick={() => onDelete(initialData)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <Trash2 size={14} /> Hapus Akun
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-xl transition shadow-xs"
              >
                {isEditing ? "Simpan Perubahan" : "Tambah Akun"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
