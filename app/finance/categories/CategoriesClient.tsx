"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceSubnav } from "@/components/finance/FinanceSubnav";
import { CategoryModal } from "@/components/finance/modals/CategoryModal";
import { FinancialCategory, TransactionType } from "@/types/finance";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  migrateLocalStorageToSupabaseIfNeeded,
} from "@/lib/finance/service";
import {
  Tags,
  PlusCircle,
  Edit2,
  Trash2,
} from "lucide-react";

interface CategoriesClientProps {
  userId: string;
  userName?: string;
}

export function CategoriesClient({
  userId,
  userName,
}: CategoriesClientProps) {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FinancialCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId || userId === "guest-user") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      await migrateLocalStorageToSupabaseIfNeeded(userId);
      const cats = await getCategories(userId);
      setCategories(cats);
    } catch (err: any) {
      console.error("Error loading categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const filtered = categories.filter((c) => c.type === activeTab);

  const handleSaveCategory = async (data: Partial<FinancialCategory>) => {
    try {
      if (editingCategory) {
        await updateCategory(userId, editingCategory.id, data);
      } else {
        await createCategory(userId, data);
      }
      setEditingCategory(null);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kategori.");
    }
  };

  const handleDeleteCategory = async (cat: FinancialCategory) => {
    if (cat.is_default || !cat.user_id) {
      alert("Kategori bawaan sistem tidak dapat dihapus.");
      return;
    }

    if (confirm(`Hapus kategori "${cat.name}"?`)) {
      try {
        await deleteCategory(userId, cat.id);
        await loadData();
      } catch (err: any) {
        alert(err.message || "Gagal menghapus kategori.");
      }
    }
  };

  return (
    <AppShell title="Categories" userName={userName}>
      <FinanceSubnav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold font-heading text-gray-900 tracking-tight">
            Kategori Transaksi
          </h1>
          <p className="text-sm leading-5 text-gray-500 mt-0.5">
            Kelola kategori pemasukan dan pengeluaran sesuai kebiasaan finansial Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold rounded-full bg-[#107c74] text-white hover:bg-[#0d6861] transition shadow-xs"
        >
          <PlusCircle size={16} /> Kategori Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("expense")}
          className={`px-4.5 py-2 rounded-full text-[13px] font-semibold transition ${
            activeTab === "expense"
              ? "bg-[#107c74] text-white shadow-2xs"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Kategori Pengeluaran ({categories.filter((c) => c.type === "expense").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("income")}
          className={`px-4.5 py-2 rounded-full text-[13px] font-semibold transition ${
            activeTab === "income"
              ? "bg-[#107c74] text-white shadow-2xs"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Kategori Pemasukan ({categories.filter((c) => c.type === "income").length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="p-4 bg-white border border-[#e2eaf0] rounded-2xl shadow-xs flex items-center justify-between hover:border-gray-300 transition"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs"
                style={{ backgroundColor: cat.color || "#107c74" }}
              >
                <Tags size={15} />
              </span>
              <div>
                <h4 className="text-[14px] font-semibold text-gray-900 font-heading">
                  {cat.name}
                </h4>
                <span className="text-xs text-gray-400">
                  {cat.is_default ? "Kategori Standar" : "Kustom Pengguna"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(cat);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition"
                title="Edit Kategori"
              >
                <Edit2 size={13} />
              </button>
              {!cat.is_default && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-50 transition"
                  title="Hapus Kategori"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />
    </AppShell>
  );
}
