"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceSubnav } from "@/components/finance/FinanceSubnav";
import {
  FinancialAccount,
  FinancialCategory,
  ReceiptScanResult,
  ReceiptItem,
} from "@/types/finance";
import {
  getAccounts,
  getCategories,
  createTransaction,
  checkForDuplicateTransaction,
} from "@/lib/finance/service";
import { formatIDR, formatThousand } from "@/lib/finance/format";
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
} from "lucide-react";

interface ReceiptScannerClientProps {
  userId: string;
  userName?: string;
}

export function ReceiptScannerClient({
  userId,
  userName,
}: ReceiptScannerClientProps) {
  const router = useRouter();

  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);

  // Upload & OCR states
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptScanResult | null>(
    null
  );

  // Editable Review Form state
  const [merchantName, setMerchantName] = useState("");
  const [transactionDate, setTransactionDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [transactionTime, setTransactionTime] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [grandTotal, setGrandTotal] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [notes, setNotes] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      const accs = getAccounts(userId);
      const cats = getCategories(userId);
      setAccounts(accs);
      setCategories(cats);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
      const defExp = cats.find((c) => c.type === "expense");
      if (defExp) setSelectedCategoryId(defExp.id);
    }
  }, [userId]);

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

      // Populate review form with extracted details
      setMerchantName(data.merchant_name || "");
      if (data.transaction_date) {
        setTransactionDate(data.transaction_date);
      }
      setTransactionTime(data.transaction_time || "");
      setReceiptNumber(data.receipt_number || "");
      setItems(data.items || []);
      setTax(String(data.tax || 0));
      setDiscount(String(data.discount || 0));
      setGrandTotal(String(data.grand_total || ""));
      setPaymentMethod(data.payment_method || "Tunai");

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
            `Peringatan: Transaksi dengan nominal ${formatIDR(
              dup.amount
            )} pada tanggal ${dup.date} sudah pernah dicatat ("${dup.title}").`
          );
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (err: unknown) {
      console.error("OCR process error:", err);
      setOcrError(
        err instanceof Error
          ? err.message
          : "Gagal memproses struk dengan OCR. Silakan input manual di form review."
      );
      // Even on failure, allow user to fill in manual details with image attached!
      setExtractedData({
        merchant_name: "",
        items: [],
        grand_total: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Item Management in Review Form
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { name: "Barang Baru", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof ReceiptItem,
    val: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };
      if (field === "quantity" || field === "unit_price") {
        item.subtotal = Math.round(
          (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
        );
      }
      updated[index] = item;

      // Recalculate grand total suggestion
      const sumItems = updated.reduce((s, it) => s + (it.subtotal || 0), 0);
      const taxNum = Number(tax) || 0;
      const discNum = Number(discount) || 0;
      setGrandTotal(String(sumItems + taxNum - discNum));

      return updated;
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

    createTransaction(userId, {
      title,
      type: "expense",
      amount: finalAmount,
      date: transactionDate,
      category_id: selectedCategoryId || undefined,
      account_id: selectedAccountId,
      payment_method: paymentMethod,
      description: `Nomor Struk: ${receiptNumber || "-"}\nWaktu: ${transactionTime || "-"}\nCatatan: ${notes || "-"}`,
      receipt_url: previewUrl || undefined,
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

    alert("Transaksi struk berhasil disimpan ke catatan keuangan Anda!");
    router.push("/finance/transactions");
  };

  return (
    <AppShell title="Scan Receipt (Struk-Ku)" userName={userName}>
      <FinanceSubnav />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] leading-[36px] font-bold font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <span>Struk-Ku — Pemindai Struk OCR</span>
        </h1>
        <p className="text-sm leading-5 text-gray-500 mt-1">
          Upload foto struk belanja Anda. AI akan membaca toko, tanggal, daftar barang, dan nominal pembayaran secara otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Preview Area */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 font-heading mb-3 flex items-center gap-2">
              <Upload size={16} className="text-[#107c74]" />
              Upload Foto Struk
            </h2>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#107c74] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-gray-50/50 hover:bg-[#e6faf7]/20 min-h-[220px]"
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
              <ScanLine size={40} className="text-[#107c74] mb-2" />
              <p className="font-semibold text-sm text-gray-800">
                Tarik & Lepas Foto Struk ke Sini
              </p>
              <p className="text-xs text-gray-400 mt-1">
                atau klik untuk memilih file (JPG, PNG, WEBP)
              </p>
            </div>

            {/* Preview & Action Buttons */}
            {previewUrl && (
              <div className="mt-4 space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 max-h-72 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview Struk"
                    className="max-h-72 object-contain rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessOCR}
                    className="flex-1 py-2.5 px-4.5 rounded-full font-semibold text-sm bg-[#107c74] text-white hover:bg-[#0d6861] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sedang Mengekstrak Data Struk...
                      </>
                    ) : (
                      <>
                        <ScanLine size={16} />
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
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                    title="Ganti Foto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* OCR Error / Feedback */}
            {ocrError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold text-xs">Perhatian</p>
                  <p className="text-xs mt-0.5">{ocrError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editable Review Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 font-heading">
                  Review & Konfirmasi Struk
                </h2>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Periksa dan sesuaikan data sebelum disimpan ke pencatatan keuangan.
                </p>
              </div>
              {extractedData && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={14} /> OCR Terbaca
                </span>
              )}
            </div>

            {/* Duplicate warning */}
            {duplicateWarning && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleConfirmSave} className="space-y-4 text-xs">
              {/* Merchant / Store */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74] font-medium"
                  />
                </div>
              </div>

              {/* Date & Time & Receipt Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tanggal Transaksi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Waktu / Jam
                  </label>
                  <input
                    type="time"
                    value={transactionTime}
                    onChange={(e) => setTransactionTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    No. Struk / Invoice
                  </label>
                  <input
                    type="text"
                    placeholder="cth. INV-202610-01"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                  />
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 text-xs">
                    Rincian Barang Belanjaan
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[#107c74] hover:underline font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus size={13} /> Tambah Barang
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-gray-400 text-[11px] py-2 text-center">
                    Belum ada rincian barang. Klik &quot;Tambah Barang&quot; atau biarkan OCR mendeteksi.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-gray-200"
                      >
                        <input
                          type="text"
                          placeholder="Nama Barang"
                          value={item.name}
                          onChange={(e) =>
                            handleUpdateItem(idx, "name", e.target.value)
                          }
                          className="col-span-5 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(idx, "quantity", e.target.value)
                          }
                          className="col-span-2 px-2 py-1 border border-gray-200 rounded text-xs text-center"
                        />
                        <div className="col-span-4 relative flex items-center border border-gray-200 rounded overflow-hidden">
                          <span className="px-1.5 py-1 text-[10px] font-bold text-gray-400 bg-gray-50 border-r border-gray-200 select-none">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={item.unit_price ? formatThousand(item.unit_price) : ""}
                            onChange={(e) =>
                              handleUpdateItem(
                                idx,
                                "unit_price",
                                e.target.value.replace(/\D/g, "")
                                  ? parseInt(e.target.value.replace(/\D/g, ""), 10)
                                  : 0
                              )
                            }
                            className="w-full px-2 py-1 text-xs text-right focus:outline-none font-medium"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="col-span-1 text-gray-400 hover:text-rose-600 flex justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tax, Discount & Grand Total */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
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
                  <label className="block font-semibold text-gray-700 mb-1">
                    Diskon / Promo (IDR)
                  </label>
                  <CurrencyInput
                    value={discount}
                    onChange={(val) => setDiscount(val)}
                    placeholder="0"
                    showTerbilang={false}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Total Pembayaran (Grand Total) <span className="text-rose-500">*</span>
                  </label>
                  <CurrencyInput
                    required
                    value={grandTotal}
                    onChange={(val) => setGrandTotal(val)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Account, Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Akun Pembayaran <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    required
                    value={selectedAccountId}
                    onChange={(val) => setSelectedAccountId(val)}
                    placeholder="Pilih Akun"
                    options={accounts.map((a) => ({
                      value: a.id,
                      label: `${a.name} (${formatIDR(a.current_balance ?? a.initial_balance)})`,
                    }))}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Kategori Pengeluaran
                  </label>
                  <Select
                    value={selectedCategoryId}
                    onChange={(val) => setSelectedCategoryId(val)}
                    placeholder="Pilih Kategori"
                    options={categories
                      .filter((c) => c.type === "expense")
                      .map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Metode Bayar
                  </label>
                  <Select
                    value={paymentMethod}
                    onChange={(val) => setPaymentMethod(val)}
                    options={[
                      { value: "Tunai", label: "Tunai / Cash" },
                      { value: "QRIS", label: "QRIS" },
                      { value: "Transfer Bank", label: "Transfer Bank" },
                      { value: "Kartu Debit", label: "Kartu Debit" },
                      { value: "Kartu Kredit", label: "Kartu Kredit" },
                      { value: "E-Wallet", label: "E-Wallet (GoPay / OVO)" },
                    ]}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="cth. Belanja mingguan keperluan rumah"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/finance/transactions")}
                  className="px-4 py-2 font-medium text-sm text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-sm text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Konfirmasi & Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
