"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Select } from "@/components/ui/select";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import {
  X,
  Sparkles,
  Upload,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  Lock,
  ImageIcon,
} from "lucide-react";

export interface AddApplicationFormData {
  company: string;
  position: string;
  jobType: string;
  initialStatus: string;
  applyDate: string;
  platform: string;
  customPlatform?: string;
}

export interface AddApplicationModalProps {
  isOpen: boolean;
  /** Controls which tab is opened initially. Default: "manual" */
  initialTab?: "manual" | "ai";
  onClose: () => void;
  onSubmit?: (data: AddApplicationFormData) => void;
  onDelete?: () => void;
  initialData?: AddApplicationFormData | null;
  mode?: "create" | "edit";
}

const DEFAULT_FORM_STATE: AddApplicationFormData = {
  company: "",
  position: "",
  jobType: "Full-time",
  initialStatus: "Submitted",
  applyDate: "24/03/2025",
  platform: "LinkedIn",
  customPlatform: "",
};

export function AddApplicationModal({
  isOpen,
  initialTab = "manual",
  onClose,
  onSubmit,
  onDelete,
  initialData = null,
  mode = "create",
}: AddApplicationModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "ai">(initialTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  useBodyScrollLock(isOpen);

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [formData, setFormData] = useState<AddApplicationFormData>(DEFAULT_FORM_STATE);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const customPlatformInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAiUploadState = useCallback(() => {
    setUploadedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [filePreviewUrl]);

  const handleClose = useCallback(() => {
    resetAiUploadState();
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    setFormData({
      ...DEFAULT_FORM_STATE,
      applyDate: `${d}/${m}/${y}`,
    });
    setActiveTab(initialTab);
    onClose();
  }, [initialTab, onClose, resetAiUploadState]);

  // Sync state during render when modal opens or initialData changes (React recommended pattern)
  if (isOpen && (!prevIsOpen || initialData !== prevInitialData)) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    setUploadedFile(null);
    setFilePreviewUrl(null);
    if (initialData) {
      setFormData(initialData);
      setActiveTab("manual");
    } else {
      const today = new Date();
      const d = String(today.getDate()).padStart(2, "0");
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const y = today.getFullYear();
      setFormData({
        ...DEFAULT_FORM_STATE,
        applyDate: `${d}/${m}/${y}`,
      });
      setActiveTab(initialTab);
    }
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  // Clear file input ref on open
  useEffect(() => {
    if (isOpen && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen]);

  // Autofocus custom platform input when "Lainnya (Others)" is selected
  useEffect(() => {
    if (formData.platform === "Lainnya (Others)") {
      customPlatformInputRef.current?.focus();
    }
  }, [formData.platform]);

  // Close on Escape key
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    handleClose();
  };

  const handleFieldChange = (
    field: keyof AddApplicationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (tab: "manual" | "ai") => {
    if (tab !== activeTab) {
      resetAiUploadState();
      setActiveTab(tab);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setUploadedFile(selected);
      const url = URL.createObjectURL(selected);
      setFilePreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setUploadedFile(dropped);
      const url = URL.createObjectURL(dropped);
      setFilePreviewUrl(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Reusable Form Fields (digunakan di tab manual dan tab AI)
  const renderFormFields = () => (
    <div className="space-y-4">
      {/* 1 & 2. Nama Perusahaan & Posisi Pekerjaan (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="company-name">
            Nama Perusahaan <span className="text-rose-500">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            required
            placeholder="cth. GoTo Financial"
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            value={formData.company}
            onChange={(e) => handleFieldChange("company", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="position-name">
            Posisi Pekerjaan <span className="text-rose-500">*</span>
          </label>
          <input
            id="position-name"
            type="text"
            required
            placeholder="cth. Product Designer"
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
            value={formData.position}
            onChange={(e) => handleFieldChange("position", e.target.value)}
          />
        </div>
      </div>

      {/* 3 & 4. Tipe Pekerjaan & Status Awal (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="job-type">
            Tipe Pekerjaan <span className="text-rose-500">*</span>
          </label>
          <Select
            id="job-type"
            required
            value={formData.jobType}
            onChange={(val) => handleFieldChange("jobType", val)}
            size="sm"
            options={[
              { value: "Full-time", label: "Full-time" },
              { value: "Internship", label: "Internship" },
              { value: "Contract", label: "Contract" },
              { value: "Freelance", label: "Freelance" },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="initial-status">
            {mode === "edit" ? "Status Lamaran" : "Status Awal"} <span className="text-rose-500">*</span>
          </label>
          <Select
            id="initial-status"
            required
            value={formData.initialStatus}
            onChange={(val) => handleFieldChange("initialStatus", val)}
            size="sm"
            options={[
              { value: "Submitted", label: "Submitted" },
              { value: "Test", label: "Technical Test" },
              { value: "Task", label: "Take Home Task" },
              { value: "Interview HR", label: "Interview HR" },
              { value: "Interview User", label: "Interview User" },
              { value: "LGD", label: "LGD" },
              { value: "FGD", label: "FGD" },
              { value: "Offering", label: "Offering Received" },
              { value: "Rejected", label: "Rejected" },
              { value: "Ghosted", label: "Ghosted" },
              { value: "Withdrawn", label: "Withdrawn (Dibatalkan)" },
            ]}
          />
        </div>
      </div>

      {/* 5 & 6. Tanggal Melamar & Platform Lamaran (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="apply-date">
            Tanggal Melamar <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="apply-date"
              type="text"
              required
              placeholder="DD/MM/YYYY"
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74]"
              value={formData.applyDate}
              onChange={(e) => handleFieldChange("applyDate", e.target.value)}
            />
            <Calendar
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="platform-select">
            Platform Lamaran <span className="text-rose-500">*</span>
          </label>
          <Select
            id="platform-select"
            required
            value={formData.platform}
            onChange={(val) => handleFieldChange("platform", val)}
            size="sm"
            options={[
              { value: "LinkedIn", label: "LinkedIn" },
              { value: "Kalibrr", label: "Kalibrr" },
              { value: "JobStreet", label: "JobStreet" },
              { value: "Glints", label: "Glints" },
              { value: "Career Portal", label: "Career Portal" },
              { value: "Lainnya (Others)", label: "Lainnya (Others)" },
            ]}
          />
        </div>
      </div>

      {/* Field Tambahan jika Platform "Lainnya (Others)" */}
      {formData.platform === "Lainnya (Others)" && (
        <div className="p-3 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <label
              className="block text-xs font-semibold text-gray-700"
              htmlFor="custom-platform-input"
            >
              Nama Platform / Sumber <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-semibold bg-[#e6faf7] text-[#107c74] px-1.5 py-0.5 rounded-full">
              Sebutkan Manual
            </span>
          </div>
          <input
            id="custom-platform-input"
            ref={customPlatformInputRef}
            type="text"
            required
            placeholder="Contoh: Glints, Deall, Website Karir, Referensi Teman..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#107c74] bg-white"
            value={formData.customPlatform || ""}
            onChange={(e) => handleFieldChange("customPlatform", e.target.value)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${
          activeTab === "ai" && mode !== "edit" ? "max-w-4xl" : "max-w-xl"
        } shadow-xl border border-[#e2eaf0] overflow-hidden flex flex-col max-h-[90vh] transition-[max-width] duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-gray-900 font-heading flex items-center gap-2">
              {activeTab === "ai" && mode !== "edit" ? (
                <>
                  <Sparkles size={18} className="text-[#107c74]" />
                  <span>Upload Screenshot Lamaran</span>
                </>
              ) : mode === "edit" ? (
                <span>Edit Lamaran</span>
              ) : (
                <span>Tambah Lamaran Baru</span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeTab === "ai" && mode !== "edit"
                ? "Ekstrak otomatis detail posisi dan perusahaan dari screenshot postingan kerja."
                : mode === "edit"
                ? "Perbarui detail posisi, perusahaan, status tahapan, atau platform lamaran pekerjaan."
                : "Catat lamaran pekerjaan secara manual atau unggah screenshot via AI."}
            </p>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
            onClick={handleClose}
            aria-label="Tutup modal"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto min-h-[420px]">
          {/* Segmented Tab Control (hanya saat mode tambah baru) */}
          {mode !== "edit" && (
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "manual"}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === "manual"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("manual")}
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
                aria-selected={activeTab === "ai"}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  activeTab === "ai"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("ai")}
              >
                <Sparkles
                  size={14}
                  className={activeTab === "ai" ? "text-[#107c74]" : "text-gray-400"}
                />
                <span>Upload Screenshot (AI)</span>
                <span className="text-[10px] font-semibold bg-[#e6faf7] text-[#107c74] px-1.5 py-0.5 rounded-full ml-0.5">
                  Beta
                </span>
              </button>
            </div>
          )}

          {/* TAB 1: INPUT MANUAL (atau mode edit) */}
          {(activeTab === "manual" || mode === "edit") && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
              {renderFormFields()}

              {/* Footer Actions */}
              {mode === "edit" ? (
                <div className="pt-3 flex items-center justify-between border-t border-gray-100">
                  <div>
                    {onDelete && (
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-full transition flex items-center gap-1.5 cursor-pointer"
                        onClick={onDelete}
                        aria-label="Delete lamaran"
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
                    onClick={handleClose}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    Simpan Lamaran
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: UPLOAD SCREENSHOT (AI) - 2-COLUMN LAYOUT IDENTIK DENGAN TRANSAKSI */}
          {activeTab === "ai" && mode !== "edit" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
              {/* Left Column: Dropzone & File Preview */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-gray-50/70 border border-[#e2eaf0] rounded-2xl p-4">
                  <span className="text-xs font-bold text-gray-900 font-heading mb-2 flex items-center gap-1.5 block">
                    <Upload size={15} className="text-[#107c74]" />
                    Foto Screenshot
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Dropzone */}
                  {!uploadedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="border-2 border-dashed border-gray-200 hover:border-[#107c74] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition bg-white hover:bg-[#e6faf7]/20 min-h-[160px]"
                    >
                      <ImageIcon size={34} className="text-[#107c74] mb-2" />
                      <p className="font-semibold text-xs text-gray-800">
                        Pilih atau Geser Screenshot
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        PNG, JPG, atau WEBP (maks. 5MB)
                      </p>
                    </div>
                  ) : (
                    /* Preview Card */
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 max-h-48 flex items-center justify-center">
                        {filePreviewUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={filePreviewUrl}
                            alt="Preview Screenshot"
                            className="max-h-48 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={32} />
                            <span className="text-xs mt-1">Preview tidak tersedia</span>
                          </div>
                        )}
                      </div>

                      {/* File Metadata */}
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <p className="font-medium text-gray-800 truncate">{uploadedFile.name}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            {formatFileSize(uploadedFile.size)} • Siap diekstrak via Gemini AI
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetAiUploadState}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition shrink-0"
                          title="Hapus foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
                      >
                        Ganti Gambar
                      </button>
                    </div>
                  )}

                  {/* Privacy Banner */}
                  <div className="mt-3 p-2.5 rounded-xl bg-teal-50/60 border border-[#107c74]/20 text-[#107c74] text-xs flex items-start gap-2">
                    <Lock size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Gambar tidak disimpan ke server database, hanya diproses sekali oleh AI lalu dibuang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Form Inputs */}
              <div className="lg:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {uploadedFile && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                      <span>
                        Screenshot terpilih. Periksa atau lengkapi data lamaran di bawah ini sebelum menyimpan.
                      </span>
                    </div>
                  )}

                  {renderFormFields()}

                  {/* Footer Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition"
                      onClick={handleClose}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] rounded-full transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Simpan Lamaran
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

export default AddApplicationModal;
