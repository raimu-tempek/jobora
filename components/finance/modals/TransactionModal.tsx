"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FinancialTransaction,
  FinancialAccount,
  FinancialCategory,
  TransactionType,
  ReceiptScanResult,
  ReceiptItem,
} from "@/types/finance";
import { checkForDuplicateTransaction } from "@/lib/finance/service";
import { formatIDR } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Select } from "@/components/ui/select";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import {
  X,
  AlertTriangle,
  Sparkles,
  Upload,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  ChevronDown,
  ShoppingBag,
  Edit3,
} from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  initialTab?: "manual" | "scan";
  onClose: () => void;
  onSave: (txData: Partial<FinancialTransaction>) => void;
  userId: string;
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  initialData?: FinancialTransaction | null;
  onSuccess?: () => void;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: "Tunai", label: "Tunai / Cash" },
  { value: "Transfer Bank", label: "Transfer Bank" },
  { value: "QRIS", label: "QRIS" },
  { value: "Kartu Debit", label: "Kartu Debit" },
  { value: "Kartu Kredit", label: "Kartu Kredit" },
  { value: "E-Wallet", label: "E-Wallet (GoPay / OVO / ShopeePay)" },
];

export function TransactionModal({
  isOpen,
  initialTab = "manual",
  onClose,
  onSave,
  userId,
  accounts,
  categories,
  initialData,
  onSuccess,
}: TransactionModalProps) {
  const isEditing = Boolean(initialData);
  const [activeTab, setActiveTab] = useState<"manual" | "scan">(initialTab);

  // Body scroll lock
  useBodyScrollLock(isOpen);

  // ---------------------------------------------------------------------------
  // State: Manual Entry Tab
  // ---------------------------------------------------------------------------
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [description, setDescription] = useState("");
  const [manualDuplicateWarning, setManualDuplicateWarning] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // State: Scan Struk (AI) Tab (PERSIS SAMA FIELD DENGAN MANUAL + TAMBAHAN OCR)
  // ---------------------------------------------------------------------------
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptScanResult | null>(null);

  // Field Utama (Identik persis dengan Manual: tipe, judul, nominal, tanggal, akun, kategori, metode, deskripsi)
  const [scanType, setScanType] = useState<TransactionType>("expense");
  const [scanTitle, setScanTitle] = useState("");
  const [scanAmount, setScanAmount] = useState<string>("");
  const [scanDate, setScanDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [scanAccountId, setScanAccountId] = useState("");
  const [scanCategoryId, setScanCategoryId] = useState("");
  const [scanPaymentMethod, setScanPaymentMethod] = useState("Tunai");
  const [scanDescription, setScanDescription] = useState("");

  // Detail Tambahan Khusus Struk (+ Detail Lanjutan: Collapsed by Default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showItemsList, setShowItemsList] = useState(false);
  const [transactionTime, setTransactionTime] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [scanDuplicateWarning, setScanDuplicateWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to reset Scan Tab state
  const resetScanState = useCallback(() => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setIsProcessing(false);
    setOcrError(null);
    setExtractedData(null);
    setScanType("expense");
    setScanTitle("");
    setScanAmount("");
    setScanDate(new Date().toISOString().split("T")[0]);
    setScanAccountId(accounts[0]?.id || "");
    const defExp = categories.find((c) => c.type === "expense");
    setScanCategoryId(defExp?.id || "");
    setScanPaymentMethod("Tunai");
    setScanDescription("");
    setShowAdvanced(false);
    setShowItemsList(false);
    setTransactionTime("");
    setReceiptNumber("");
    setTax("0");
    setDiscount("0");
    setItems([]);
    setScanDuplicateWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl, categories, accounts]);

  // Helper to reset Manual Tab state
  const resetManualState = useCallback(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(initialData.amount ? String(initialData.amount) : "");
      setDate(initialData.date);
      setAccountId(initialData.account_id);
      setCategoryId(initialData.category_id || "");
      setPaymentMethod(initialData.payment_method || "Tunai");
      setDescription(initialData.description || "");
    } else {
      setType("expense");
      setTitle("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setAccountId(accounts[0]?.id || "");
      const defExpCat = categories.find((c) => c.type === "expense");
      setCategoryId(defExpCat?.id || "");
      setPaymentMethod("Tunai");
      setDescription("");
    }
    setManualDuplicateWarning(null);
  }, [initialData, accounts, categories]);

  // Handle Full Close
  const handleClose = useCallback(() => {
    resetScanState();
    resetManualState();
    setActiveTab(initialTab);
    onClose();
  }, [initialTab, onClose, resetScanState, resetManualState]);

  // Handle Tab Switch
  const handleTabChange = (newTab: "manual" | "scan") => {
    if (newTab === activeTab) return;
    if (newTab === "manual") {
      resetScanState();
    } else {
      resetManualState();
      resetScanState();
    }
    setActiveTab(newTab);
  };

  // Sync on modal open or initialData change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setActiveTab("manual");
        resetManualState();
      } else {
        setActiveTab(initialTab);
        resetManualState();
        resetScanState();
      }
    }
  }, [isOpen, initialData, initialTab, resetManualState, resetScanState]);

  // Check duplicate for manual entry
  useEffect(() => {
    if (!userId || !amount || !date || !accountId) {
      setManualDuplicateWarning(null);
      return;
    }
    const num = Math.round(Number(amount));
    if (num > 0) {
      const dup = checkForDuplicateTransaction(
        userId,
        num,
        date,
        accountId,
        initialData?.id
      );
      if (dup) {
        setManualDuplicateWarning(
          `Peringatan duplikasi: Ditemukan transaksi "${dup.title}" dengan nominal ${formatIDR(
            dup.amount
          )} pada akun dan tanggal yang sama.`
        );
      } else {
        setManualDuplicateWarning(null);
      }
    }
  }, [amount, date, accountId, userId, initialData]);

  // Check duplicate for scan entry
  useEffect(() => {
    if (!userId || !scanAmount || !scanDate || !scanAccountId) {
      setScanDuplicateWarning(null);
      return;
    }
    const num = Math.round(Number(scanAmount));
    if (num > 0) {
      const dup = checkForDuplicateTransaction(
        userId,
        num,
        scanDate,
        scanAccountId,
        initialData?.id
      );
      if (dup) {
        setScanDuplicateWarning(
          `Peringatan: Ditemukan transaksi mirip "${dup.title}" (${formatIDR(
            dup.amount
          )}) pada tanggal ${dup.date}.`
        );
      } else {
        setScanDuplicateWarning(null);
      }
    }
  }, [scanAmount, scanDate, scanAccountId, userId, initialData]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // Scan OCR File Handlers
  // ---------------------------------------------------------------------------
  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setOcrError("Hanya file format JPG, PNG, atau WEBP yang didukung.");
      return;
    }

    setFile(selectedFile);
    setOcrError(null);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessOCR = async () => {
    if (!file && !previewUrl) return;

    setIsProcessing(true);
    setOcrError(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("receipt", file);
        res = await fetch("/api/finance/ocr", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/finance/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: previewUrl }),
        });
      }

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error ||
            "Gagal membaca struk. Anda dapat mengisi data struk secara manual di bawah ini."
        );
      }

      const data: ReceiptScanResult = result.data;
      setExtractedData(data);

      // Otomatis tentukan tipe transaksi: income jika bukti transfer masuk/slip gaji/pemasukan, expense jika belanja/struk
      const detectedType: TransactionType =
        data.transaction_type === "income" ? "income" : "expense";
      setScanType(detectedType);

      // Auto-fill field inti: Judul, Nominal, Tanggal
      if (data.merchant_name) {
        setScanTitle(data.merchant_name);
      }
      if (data.grand_total) {
        setScanAmount(String(data.grand_total));
      }
      if (data.transaction_date) {
        setScanDate(data.transaction_date);
      }

      // Auto-suggest category sesuai tipe transaksi (expense / income)
      const targetCategories = categories.filter((c) => c.type === detectedType);
      if (data.suggested_category) {
        const matchedCat = targetCategories.find(
          (c) =>
            c.name.toLowerCase().includes(data.suggested_category!.toLowerCase()) ||
            data.suggested_category!.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCat) {
          setScanCategoryId(matchedCat.id);
        } else if (targetCategories.length > 0) {
          setScanCategoryId(targetCategories[0].id);
        }
      } else if (targetCategories.length > 0) {
        setScanCategoryId(targetCategories[0].id);
      }

      // Auto-fill metode bayar jika terdeteksi
      if (data.payment_method) {
        const matchedMethod = PAYMENT_METHOD_OPTIONS.find((opt) =>
          opt.value.toLowerCase().includes(data.payment_method!.toLowerCase())
        );
        if (matchedMethod) {
          setScanPaymentMethod(matchedMethod.value);
        } else {
          setScanPaymentMethod(data.payment_method);
        }
      }

      // Populate advanced detail fields
      setTransactionTime(data.transaction_time || "");
      setReceiptNumber(data.receipt_number || "");
      setItems(data.items || []);
      setTax(String(data.tax || 0));
      setDiscount(String(data.discount || 0));
    } catch (err: any) {
      setOcrError(
        err.message || "Gagal memproses struk dengan OCR. Periksa gambar dan coba lagi."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { name: "Item Baru", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof ReceiptItem,
    value: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        item.subtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------------------------------
  // Submit Handlers
  // ---------------------------------------------------------------------------
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Judul transaksi wajib diisi.");
      return;
    }
    const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
    if (cleanAmount <= 0) {
      alert("Nominal transaksi harus lebih dari 0.");
      return;
    }
    if (!accountId) {
      alert("Pilih akun keuangan.");
      return;
    }

    onSave({
      title: title.trim(),
      type,
      amount: cleanAmount,
      date,
      account_id: accountId,
      category_id: categoryId || undefined,
      payment_method: paymentMethod,
      description: description.trim(),
      input_source: initialData?.input_source || "manual",
    });

    onSuccess?.();
    handleClose();
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanTitle.trim()) {
      alert("Judul transaksi wajib diisi.");
      return;
    }
    const finalAmount = Math.max(0, Math.round(Number(scanAmount) || 0));
    if (finalAmount <= 0) {
      alert("Nominal transaksi harus lebih dari 0.");
      return;
    }
    if (!scanAccountId) {
      alert("Pilih akun keuangan.");
      return;
    }

    // CATATAN PENTING: receipt_url sengaja TIDAK disimpan ke database agar kapasitas penyimpanan backend tidak penuh
    const receiptMeta = [
      receiptNumber ? `Nomor Struk: ${receiptNumber}` : null,
      transactionTime ? `Waktu: ${transactionTime}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const formattedDescription = scanDescription.trim()
      ? receiptMeta
        ? `${scanDescription.trim()}\n(${receiptMeta})`
        : scanDescription.trim()
      : receiptMeta || "";

    onSave({
      title: scanTitle.trim(),
      type: scanType, // Otomatis sesuai hasil deteksi atau pilihan user
      amount: finalAmount,
      date: scanDate,
      category_id: scanCategoryId || undefined,
      account_id: scanAccountId,
      payment_method: scanPaymentMethod,
      description: formattedDescription,
      receipt_url: undefined, // File gambar TIDAK disimpan ke database
      receipt_data: {
        merchant_name: scanTitle.trim(),
        transaction_type: scanType,
        transaction_date: scanDate,
        transaction_time: transactionTime,
        receipt_number: receiptNumber,
        items,
        subtotal: items.reduce((s, it) => s + (it.subtotal || 0), 0),
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        grand_total: finalAmount,
        payment_method: scanPaymentMethod,
        suggested_category: categories.find((c) => c.id === scanCategoryId)?.name,
      },
      input_source: "receipt_ocr",
    });

    onSuccess?.();
    handleClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl w-full ${
          activeTab === "scan" && !isEditing ? "max-w-4xl" : "max-w-xl"
        } shadow-xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[90vh] transition-[max-width] duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-heading flex items-center gap-2">
              {activeTab === "scan" && !isEditing ? (
                <>
                  <Sparkles size={18} className="text-[#107c74]" />
                  <span>Unggah & Pindai Struk Belanja</span>
                </>
              ) : isEditing ? (
                <span>Edit Transaksi</span>
              ) : (
                <span>Tambah Transaksi Baru</span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeTab === "scan" && !isEditing
                ? "Pindai struk fisik dengan AI OCR secara instan tanpa membebani penyimpanan database."
                : isEditing
                ? "Perbarui rincian transaksi catatan keuangan Anda."
                : "Catat transaksi keuangan secara manual atau pindai struk otomatis via AI."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto min-h-[460px]">
          {/* Top Segmented Tab Switcher (hanya saat mode create) */}
          {!isEditing && (
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "manual"}
                onClick={() => handleTabChange("manual")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === "manual"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Edit3
                  size={14}
                  className={activeTab === "manual" ? "text-[#107c74]" : "text-gray-400"}
                />
                <span>Input Manual</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "scan"}
                onClick={() => handleTabChange("scan")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === "scan"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Sparkles
                  size={14}
                  className={activeTab === "scan" ? "text-[#107c74]" : "text-gray-400"}
                />
                <span>Scan Struk (AI)</span>
                <span className="text-[10px] font-semibold bg-[#e6faf7] text-[#107c74] px-1.5 py-0.5 rounded-full ml-0.5">
                  Beta
                </span>
              </button>
            </div>
          )}

          {/* ===================================================================
              TAB 1: INPUT MANUAL
              =================================================================== */}
          {activeTab === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in duration-200">
              {/* Duplicate Warning */}
              {manualDuplicateWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>{manualDuplicateWarning}</span>
                </div>
              )}

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setType("expense");
                      const def = categories.find((c) => c.type === "expense");
                      setCategoryId(def?.id || "");
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      type === "expense"
                        ? "bg-white text-rose-600 shadow-xs"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Pengeluaran (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType("income");
                      const def = categories.find((c) => c.type === "income");
                      setCategoryId(def?.id || "");
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      type === "income"
                        ? "bg-white text-emerald-600 shadow-xs"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Pemasukan (Income)
                  </button>
                </div>
              </div>

              {/* 1. Judul Transaksi */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Judul Transaksi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    type === "expense"
                      ? "cth. Makan Siang, Bensin"
                      : "cth. Gaji Bulanan, Bonus Proyek"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                />
              </div>

              {/* 2 & 3. Nominal (IDR) & Tanggal (Grid 2 Kolom) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nominal (IDR) <span className="text-rose-500">*</span>
                  </label>
                  <CurrencyInput
                    required
                    placeholder="cth. 50.000"
                    value={amount}
                    onChange={(val) => setAmount(val)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                  />
                </div>
              </div>

              {/* 4 & 5. Akun Keuangan & Kategori (Grid 2 Kolom) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Akun Keuangan <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    required
                    value={accountId}
                    onChange={(val) => setAccountId(val)}
                    placeholder="Pilih Akun"
                    size="sm"
                    options={accounts.map((a) => ({
                      value: a.id,
                      label: `${a.name} (${formatIDR(a.current_balance ?? a.initial_balance)})`,
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <Select
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                    placeholder="Pilih Kategori"
                    size="sm"
                    options={[
                      { value: "", label: "Pilih Kategori" },
                      ...filteredCategories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* 6. Metode Pembayaran */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Metode Pembayaran
                </label>
                <Select
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                  placeholder="Pilih Metode Pembayaran"
                  size="sm"
                  options={PAYMENT_METHOD_OPTIONS}
                />
              </div>

              {/* 7. Catatan / Deskripsi (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan / Deskripsi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs"
                >
                  {isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================
              TAB 2: SCAN STRUK (AI)
              PERSIS SAMA DENGAN TAB MANUAL + UPLOAD FOTO STRUK & AUTO-FILL OCR
              =================================================================== */}
          {activeTab === "scan" && !isEditing && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
              {/* Left Column: Dropzone (Foto Struk) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-gray-50/70 border border-[#e2eaf0] rounded-2xl p-4">
                  <span className="text-xs font-bold text-gray-900 font-heading mb-2 flex items-center gap-1.5 block">
                    <Upload size={15} className="text-[#107c74]" />
                    Foto Struk
                  </span>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-[#107c74] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition bg-white hover:bg-[#e6faf7]/20 min-h-[160px]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                      }}
                    />
                    <ScanLine size={34} className="text-[#107c74] mb-2" />
                    <p className="font-semibold text-xs text-gray-800">
                      Pilih atau Geser Foto Struk
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG, atau WEBP (hanya untuk scan)
                    </p>
                  </div>

                  {/* Preview & Action Buttons */}
                  {previewUrl && (
                    <div className="mt-3 space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 max-h-48 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview Struk"
                          className="max-h-48 object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handleProcessOCR}
                          className="flex-1 py-2 px-3 rounded-full font-semibold text-xs bg-[#107c74] text-white hover:bg-[#0d6861] transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Mengekstrak OCR...
                            </>
                          ) : (
                            <>
                              <ScanLine size={14} />
                              Mulai Ekstraksi OCR
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                            setExtractedData(null);
                            setOcrError(null);
                          }}
                          className="p-2 text-gray-400 hover:text-rose-600 rounded-full border border-gray-200 hover:bg-white transition"
                          title="Ganti Foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OCR Error / Feedback */}
                  {ocrError && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-xs">Perhatian</p>
                        <p className="text-[11px] mt-0.5">{ocrError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: PERSIS SAMA DENGAN TAB MANUAL (FIELD SET, URUTAN, GRID) */}
              <div className="lg:col-span-7">
                <form onSubmit={handleScanSubmit} className="space-y-4">
                  {/* OCR Success Banner */}
                  {extractedData && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                      <span>
                        Data struk berhasil diekstrak otomatis via AI OCR. Silakan periksa kembali.
                      </span>
                    </div>
                  )}

                  {/* Duplicate warning */}
                  {scanDuplicateWarning && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>{scanDuplicateWarning}</span>
                    </div>
                  )}

                  {/* Tipe Transaksi (Otomatis terdeteksi dari gambar struk/bukti transfer atau bisa diubah) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tipe Transaksi
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setScanType("expense");
                          const def = categories.find((c) => c.type === "expense");
                          setScanCategoryId(def?.id || "");
                        }}
                        className={`py-2 text-xs font-semibold rounded-lg transition ${
                          scanType === "expense"
                            ? "bg-white text-rose-600 shadow-xs"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Pengeluaran (Expense)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setScanType("income");
                          const def = categories.find((c) => c.type === "income");
                          setScanCategoryId(def?.id || "");
                        }}
                        className={`py-2 text-xs font-semibold rounded-lg transition ${
                          scanType === "income"
                            ? "bg-white text-emerald-600 shadow-xs"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Pemasukan (Income)
                      </button>
                    </div>
                  </div>

                  {/* 1. Judul Transaksi (SAMA PERSIS DENGAN TAB MANUAL) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Judul Transaksi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cth. Indomaret, Alfamart, Starbucks"
                      value={scanTitle}
                      onChange={(e) => setScanTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                    />
                  </div>

                  {/* 2 & 3. Nominal (IDR) & Tanggal (SAMA PERSIS GRID 2 KOLOM) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nominal (IDR) <span className="text-rose-500">*</span>
                      </label>
                      <CurrencyInput
                        required
                        placeholder="cth. 50.000"
                        value={scanAmount}
                        onChange={(val) => setScanAmount(val)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tanggal <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={scanDate}
                        onChange={(e) => setScanDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                      />
                    </div>
                  </div>

                  {/* 4 & 5. Akun Keuangan & Kategori (SAMA PERSIS GRID 2 KOLOM) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Akun Keuangan <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        required
                        value={scanAccountId}
                        onChange={(val) => setScanAccountId(val)}
                        placeholder="Pilih Akun"
                        size="sm"
                        options={accounts.map((a) => ({
                          value: a.id,
                          label: `${a.name} (${formatIDR(a.current_balance ?? a.initial_balance)})`,
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Kategori
                      </label>
                      <Select
                        value={scanCategoryId}
                        onChange={(val) => setScanCategoryId(val)}
                        placeholder="Pilih Kategori"
                        size="sm"
                        options={[
                          { value: "", label: "Pilih Kategori" },
                          ...categories
                            .filter((c) => c.type === scanType)
                            .map((c) => ({
                              value: c.id,
                              label: c.name,
                            })),
                        ]}
                      />
                    </div>
                  </div>

                  {/* 6. Metode Pembayaran (SAMA PERSIS DENGAN TAB MANUAL) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Metode Pembayaran
                    </label>
                    <Select
                      value={scanPaymentMethod}
                      onChange={(val) => setScanPaymentMethod(val)}
                      placeholder="Pilih Metode Pembayaran"
                      size="sm"
                      options={PAYMENT_METHOD_OPTIONS}
                    />
                  </div>

                  {/* 7. Catatan / Deskripsi (Opsional) (SAMA PERSIS DENGAN TAB MANUAL) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Catatan / Deskripsi (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan tambahan..."
                      value={scanDescription}
                      onChange={(e) => setScanDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                    />
                  </div>

                  {/* DETAIL TAMBAHAN KHUSUS STRUK: TOGGLE "+ Detail Lanjutan" (COLLAPSED BY DEFAULT) */}
                  <div className="pt-1 pb-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((prev) => !prev)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#107c74] hover:text-[#0d6861] py-1 transition group"
                    >
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${
                          showAdvanced ? "rotate-180" : ""
                        }`}
                      />
                      <span>
                        {showAdvanced ? "Sembunyikan Detail Lanjutan" : "+ Detail Lanjutan (OCR)"}
                      </span>
                      {!showAdvanced && items.length > 0 && (
                        <span className="bg-[#e6faf7] text-[#107c74] font-semibold text-[11px] px-2 py-0.5 rounded-full ml-1">
                          {items.length} item terdeteksi
                        </span>
                      )}
                    </button>

                    {/* Collapsed Panel */}
                    {showAdvanced && (
                      <div className="mt-3 p-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-3.5 animate-in fade-in duration-150">
                        {/* Waktu & Nomor Struk */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Waktu / Jam
                            </label>
                            <input
                              type="text"
                              placeholder="cth. 14:35"
                              value={transactionTime}
                              onChange={(e) => setTransactionTime(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Nomor Struk / Bill
                            </label>
                            <input
                              type="text"
                              placeholder="cth. INV-2026-09"
                              value={receiptNumber}
                              onChange={(e) => setReceiptNumber(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74] bg-white"
                            />
                          </div>
                        </div>

                        {/* Pajak / PPN & Diskon / Promo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Pajak / PPN (IDR)
                            </label>
                            <CurrencyInput
                              value={tax}
                              onChange={(val) => setTax(val)}
                              placeholder="0"
                              showTerbilang={false}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Diskon / Promo (IDR)
                            </label>
                            <CurrencyInput
                              value={discount}
                              onChange={(val) => setDiscount(val)}
                              placeholder="0"
                              showTerbilang={false}
                            />
                          </div>
                        </div>

                        {/* Daftar Barang Belanja */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => setShowItemsList((prev) => !prev)}
                            className="w-full flex items-center justify-between p-2.5 text-left hover:bg-gray-50/80 transition"
                          >
                            <div className="flex items-center gap-2">
                              <ShoppingBag size={14} className="text-[#107c74]" />
                              <span className="font-semibold text-xs text-gray-800">
                                Daftar Barang Belanja
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {items.length > 0
                                  ? `${items.length} item terdeteksi`
                                  : "0 item"}
                              </span>
                            </div>
                            <span className="text-xs text-[#107c74] font-semibold flex items-center gap-1">
                              {showItemsList ? "Tutup rincian" : "Tap buat lihat/edit"}
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  showItemsList ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>

                          {showItemsList && (
                            <div className="p-3 border-t border-gray-200 space-y-2 bg-gray-50/40">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-gray-500 font-medium">
                                  Edit item, qty, atau harga barang
                                </span>
                                <button
                                  type="button"
                                  onClick={handleAddItem}
                                  className="text-xs text-[#107c74] font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                  <Plus size={13} /> Tambah Item
                                </button>
                              </div>

                              {items.length === 0 ? (
                                <div className="p-3 text-center border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs bg-white">
                                  Belum ada item belanja. Klik &quot;Tambah Item&quot; untuk memasukkan rincian.
                                </div>
                              ) : (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {items.map((it, idx) => (
                                    <div
                                      key={idx}
                                      className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 text-xs shadow-2xs"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Nama barang"
                                        value={it.name}
                                        onChange={(e) =>
                                          handleUpdateItem(idx, "name", e.target.value)
                                        }
                                        className="col-span-5 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#107c74]"
                                      />
                                      <input
                                        type="number"
                                        min="1"
                                        placeholder="Qty"
                                        value={it.quantity}
                                        onChange={(e) =>
                                          handleUpdateItem(
                                            idx,
                                            "quantity",
                                            Number(e.target.value) || 1
                                          )
                                        }
                                        className="col-span-2 px-2 py-1 text-xs text-center border border-gray-200 rounded-md focus:outline-none focus:border-[#107c74]"
                                      />
                                      <div className="col-span-4 border border-gray-200 rounded-md bg-white">
                                        <input
                                          type="number"
                                          placeholder="Harga total"
                                          value={it.subtotal || ""}
                                          onChange={(e) =>
                                            handleUpdateItem(
                                              idx,
                                              "subtotal",
                                              Number(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs text-right focus:outline-none font-medium"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItem(idx)}
                                        className="col-span-1 text-gray-400 hover:text-rose-600 flex justify-center"
                                        title="Hapus Baris"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Action Toolbar */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Simpan Transaksi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
