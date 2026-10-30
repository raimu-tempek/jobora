"use client";

import { useState, useEffect } from "react";
import { FinancialCategory, FinancialBudget } from "@/types/finance";
import { X } from "lucide-react";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Select } from "@/components/ui/select";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string, month: string, amount: number) => void;
  categories: FinancialCategory[];
  currentMonth: string;
  initialData?: FinancialBudget | null;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSave,
  categories,
  currentMonth,
  initialData,
}: BudgetModalProps) {
  const isEditing = Boolean(initialData);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || expenseCategories[0]?.id || ""
  );
  const [month, setMonth] = useState(initialData?.month || currentMonth);
  const [amount, setAmount] = useState(
    initialData?.amount ? String(initialData.amount) : ""
  );

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category_id);
      setMonth(initialData.month);
      setAmount(String(initialData.amount));
    } else {
      setCategoryId(expenseCategories[0]?.id || "");
      setMonth(currentMonth);
      setAmount("");
    }
  }, [initialData, isOpen, currentMonth]);

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
    const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
    if (cleanAmount <= 0) {
      alert("Alokasi anggaran harus lebih dari 0.");
      return;
    }
    if (!categoryId) {
      alert("Pilih kategori pengeluaran.");
      return;
    }

    onSave(categoryId, month, cleanAmount);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 font-heading">
            {isEditing ? "Edit Anggaran Bulanan" : "Atur Anggaran Bulanan"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bulan Anggaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kategori Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <Select
              required
              disabled={isEditing}
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
              placeholder="Pilih Kategori"
              size="sm"
              options={expenseCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Batas Alokasi Anggaran (IDR) <span className="text-rose-500">*</span>
            </label>
            <CurrencyInput
              required
              placeholder="cth. 1.500.000"
              value={amount}
              onChange={(val) => setAmount(val)}
            />
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-xl transition shadow-xs"
            >
              {isEditing ? "Simpan Perubahan" : "Tetapkan Anggaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
