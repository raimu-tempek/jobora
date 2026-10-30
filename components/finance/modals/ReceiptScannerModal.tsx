"use client";

import { useState, useRef, useEffect } from "react";
import {
  FinancialAccount,
  FinancialCategory,
  ReceiptScanResult,
  ReceiptItem,
} from "@/types/finance";
import {
  createTransaction,
  checkForDuplicateTransaction,
} from "@/lib/finance/service";
import { formatIDR } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/finance/CurrencyInput";
import { Select } from "@/components/ui/select";
import {
  Upload,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Store,
  AlertTriangle,
  X,
  Sparkles,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  accounts,
  categories,
}: ReceiptScannerModalProps) {
  // Upload & OCR states
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptScanResult | null>(
    null
  );

  // 4 Main Fields (Always Visible)
  const [merchantName, setMerchantName] = useState("");
  const [transactionDate, setTransactionDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [grandTotal, setGrandTotal] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Advanced Fields (Collapsed in "+ Detail Lanjutan")
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showItemsList, setShowItemsList] = useState(false);
  const [transactionTime, setTransactionTime] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAccountMethodLabel = (type: string) => {
    switch (type) {
      case "bank":
        return "Transfer Bank";
      case "ewallet":
        return "E-Wallet";
      case "cash":
      default:
        return "Tunai";
    }
  };

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      if (accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accounts[0].id);
        setPaymentMethod(getAccountMethodLabel(accounts[0].type));
      }
      const defExp = categories.find((c) => c.type === "expense");
      if (defExp && !selectedCategoryId) {
        setSelectedCategoryId(defExp.id);
      }
    } else {
      // Reset states on modal close
      setFile(null);
      setPreviewUrl(null);
      setIsProcessing(false);
      setOcrError(null);
      setExtractedData(null);
      setMerchantName("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setGrandTotal("");
      setSelectedCategoryId("");
      setShowAdvanced(false);
      setShowItemsList(false);
      setTransactionTime("");
      setReceiptNumber("");
      setTax("0");
      setDiscount("0");
      setNotes("");
      setItems([]);
      setDuplicateWarning(null);
    }
  }, [isOpen, accounts, categories]);

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

      // Populate main fields
      setMerchantName(data.merchant_name || "");
      if (data.transaction_date) {
        setTransactionDate(data.transaction_date);
      }
      setGrandTotal(String(data.grand_total || ""));

      // Populate advanced fields
      setTransactionTime(data.transaction_time || "");
      setReceiptNumber(data.receipt_number || "");
      setItems(data.items || []);
      setTax(String(data.tax || 0));
      setDiscount(String(data.discount || 0));
      if (data.payment_method) {
        setPaymentMethod(data.payment_method);
      }

      // Auto-suggest category
      if (data.suggested_category) {
        const matchedCat = categories.find(
          (c) =>
            c.name.toLowerCase().includes(data.suggested_category!.toLowerCase()) ||
            data.suggested_category!.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCat) {
          setSelectedCategoryId(matchedCat.id);
        }
      }

      // Check duplicate
      if (data.grand_total && data.transaction_date && selectedAccountId) {
        const dup = checkForDuplicateTransaction(
          userId,
          data.grand_total,
          data.transaction_date,
          selectedAccountId
        );
        if (dup) {
          setDuplicateWarning(
            `Peringatan: Ditemukan transaksi mirip "${dup.title}" (${formatIDR(
              dup.amount
            )}) pada tanggal ${dup.date}.`
          );
        }
      }
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

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Math.max(0, Math.round(Number(grandTotal) || 0));
    if (finalAmount <= 0) {
      alert("Total pembayaran struk harus lebih dari 0.");
      return;
    }
    if (!selectedAccountId) {
      alert("Pilih akun pembayaran.");
      return;
    }

    const title = merchantName.trim()
      ? `Struk ${merchantName.trim()}`
      : "Struk Belanja";

    // CATATAN PENTING: receipt_url sengaja TIDAK disimpan ke database agar kapasitas penyimpanan backend tidak penuh
    createTransaction(userId, {
      title,
      type: "expense",
      amount: finalAmount,
      date: transactionDate,
      category_id: selectedCategoryId || undefined,
      account_id: selectedAccountId,
      payment_method: paymentMethod,
      description: `Nomor Struk: ${receiptNumber || "-"}\nWaktu: ${transactionTime || "-"}\nCatatan: ${notes || "-"}`,
      receipt_url: undefined, // File gambar TIDAK disimpan ke database
      receipt_data: {
        merchant_name: merchantName,
        transaction_date: transactionDate,
        transaction_time: transactionTime,
        receipt_number: receiptNumber,
        items,
        subtotal: items.reduce((s, it) => s + (it.subtotal || 0), 0),
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        grand_total: finalAmount,
        payment_method: paymentMethod,
        suggested_category: categories.find((c) => c.id === selectedCategoryId)
          ?.name,
      },
      input_source: "receipt_ocr",
    });

    onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-[#107c74]" />
              <span>Unggah & Pindai Struk Belanja</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pindai struk fisik dengan AI OCR secara instan tanpa membebani penyimpanan database.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Two Column Layout */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Upload Dropzone (Foto Struk) */}
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
                          setPreviewUrl(null);
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

            {/* Right Column: 4 Main Fields + Collapsed Advanced Details */}
            <div className="lg:col-span-7">
              <form onSubmit={handleConfirmSave} className="space-y-4">
                {/* OCR Success Banner */}
                {extractedData && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                    <span>Data struk berhasil diekstrak otomatis via AI OCR. Silakan periksa kembali.</span>
                  </div>
                )}

                {/* Duplicate warning */}
                {duplicateWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                {/* ========================================================
                    4 FIELD UTAMA (SELALU KELIHATAN)
                    ======================================================== */}
                {/* 1. Nama Toko / Merchant */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Toko / Merchant <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      required
                      placeholder="cth. Indomaret, Alfamart, Starbucks"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                    />
                  </div>
                </div>

                {/* 2 & 3. Tanggal Transaksi & Kategori Pengeluaran */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tanggal Transaksi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kategori Pengeluaran
                    </label>
                    <Select
                      value={selectedCategoryId}
                      onChange={(val) => setSelectedCategoryId(val)}
                      placeholder="Pilih Kategori"
                      size="sm"
                      options={categories
                        .filter((c) => c.type === "expense")
                        .map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                    />
                  </div>
                </div>

                {/* 4. Total Pembayaran (Grand Total) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Pembayaran (Grand Total) <span className="text-rose-500">*</span>
                  </label>
                  <CurrencyInput
                    required
                    value={grandTotal}
                    onChange={(val) => setGrandTotal(val)}
                    placeholder="0"
                  />
                </div>

                {/* ========================================================
                    TOGGLE "+ DETAIL LANJUTAN" (COLLAPSED BY DEFAULT)
                    ======================================================== */}
                <div className="pt-2 pb-5">
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
                      {showAdvanced ? "Sembunyikan Detail Lanjutan" : "+ Detail Lanjutan"}
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

                      {/* Akun Pembayaran & Metode Bayar (DIGABUNG JADI SATU DROPDOWN) */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Akun & Metode Pembayaran
                        </label>
                        <Select
                          value={selectedAccountId}
                          onChange={(accId) => {
                            setSelectedAccountId(accId);
                            const acc = accounts.find((a) => a.id === accId);
                            if (acc) {
                              setPaymentMethod(getAccountMethodLabel(acc.type));
                            }
                          }}
                          size="sm"
                          options={accounts.map((a) => ({
                            value: a.id,
                            label: `${a.name} (${getAccountMethodLabel(a.type)}) — Saldo: ${formatIDR(a.current_balance ?? a.initial_balance)}`,
                          }))}
                        />
                      </div>

                      {/* Catatan Tambahan */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Catatan Tambahan (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="cth. Belanja mingguan keperluan rumah"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74] bg-white"
                        />
                      </div>

                      {/* Daftar Barang Belanja (COLLAPSED BY DEFAULT) */}
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
                    onClick={onClose}
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
        </div>
      </div>
    </div>
  );
}
