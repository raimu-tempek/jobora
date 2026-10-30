"use client";

import { useState, useEffect } from "react";
import { FinancialCategory, TransactionType } from "@/types/finance";
import { X } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FinancialCategory>) => void;
  initialData?: FinancialCategory | null;
}

const CATEGORY_COLORS = [
  "#107c74",
  "#f97316",
  "#3b82f6",
  "#ec4899",
  "#eab308",
  "#a855f7",
  "#ef4444",
  "#10b981",
  "#6366f1",
  "#64748b",
];

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CategoryModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState("#107c74");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setColor(initialData.color || "#107c74");
    } else {
      setName("");
      setType("expense");
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
      alert("Nama kategori wajib diisi.");
      return;
    }

    onSave({
      name: name.trim(),
      type,
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
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[#e2eaf0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 font-heading">
            {isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
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
              Tipe Kategori
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  type === "expense"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  type === "income"
                    ? "bg-white text-emerald-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="cth. Belanja Online, Donasi & Zakat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Warna Kategori
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
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
              {isEditing ? "Simpan Perubahan" : "Tambah Kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
