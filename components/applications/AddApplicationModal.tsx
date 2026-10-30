"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Select } from "@/components/ui/select";
import styles from "./AddApplicationModal.module.css";

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
  initialData = null,
  mode = "create",
}: AddApplicationModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "ai">(initialTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
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

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h2 id="modal-title" className={styles.title}>
                {mode === "edit" ? "Edit Lamaran" : "Tambah Lamaran Baru"}
              </h2>
              {mode !== "edit" && (
                <span className={styles.aiBadge}>
                  <span
                    className={`material-symbols-outlined ${styles.aiBadgeIcon}`}
                    aria-hidden="true"
                  >
                    auto_awesome
                  </span>
                  AI Ready
                </span>
              )}
            </div>
            <p className={styles.subtitle}>
              {mode === "edit"
                ? "Perbarui detail posisi, perusahaan, status tahapan, atau platform lamaran pekerjaan."
                : "Catat lamaran secara manual atau gunakan AI untuk ekstrak otomatis dari screenshot."}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Tutup modal"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </header>

        {/* Content Body */}
        <div className={styles.body}>
          {/* Segmented Tab Control (hanya saat mode tambah baru) */}
          {mode !== "edit" && (
            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "manual"}
                className={`${styles.tab} ${
                  activeTab === "manual" ? styles.tabActive : styles.tabInactive
                }`}
                onClick={() => handleTabChange("manual")}
              >
                <span
                  className={`material-symbols-outlined ${styles.tabIcon}`}
                  aria-hidden="true"
                >
                  edit_note
                </span>
                Input Manual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "ai"}
                className={`${styles.tab} ${
                  activeTab === "ai" ? styles.tabActive : styles.tabInactive
                }`}
                onClick={() => handleTabChange("ai")}
              >
                <span
                  className={`material-symbols-outlined ${styles.tabIcon} ${styles.tabIconAi}`}
                  aria-hidden="true"
                >
                  auto_awesome
                </span>
                Upload Screenshot (AI)
                <span className={styles.betaPill}>Beta</span>
              </button>
            </div>
          )}

          {/* Upload Screenshot (AI) Tab */}
          {activeTab === "ai" && (
            <div className={styles.aiPanel}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              {uploadedFile ? (
                /* File Preview Card */
                <div className={styles.filePreviewCard}>
                  <div className={styles.filePreviewInfo}>
                    <div className={styles.fileIconBox}>
                      <span
                        className={`material-symbols-outlined ${styles.fileIcon}`}
                        aria-hidden="true"
                      >
                        image
                      </span>
                    </div>
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName}>
                        {uploadedFile.name}
                      </span>
                      <span className={styles.fileCaption}>
                        <span
                          className={`material-symbols-outlined ${styles.checkCircleIcon}`}
                          aria-hidden="true"
                        >
                          check_circle
                        </span>
                        {formatFileSize(uploadedFile.size)} • Siap diekstrak via Gemini AI
                      </span>
                    </div>
                  </div>
                  <div className={styles.fileActions}>
                    <button
                      type="button"
                      className={styles.changeImageButton}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Ganti Gambar
                    </button>
                    <button
                      type="button"
                      className={styles.removeFileButton}
                      onClick={resetAiUploadState}
                      title="Hapus file"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Placeholder State ("Pilih File") */
                <div
                  className={styles.dropzone}
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
                >
                  <div className={styles.dropzoneIconBox}>
                    <span
                      className={`material-symbols-outlined ${styles.dropzoneIcon}`}
                      aria-hidden="true"
                    >
                      add_photo_alternate
                    </span>
                  </div>
                  <p className={styles.dropzoneText}>
                    Pilih atau Tarik File Screenshot ke Sini
                  </p>
                  <p className={styles.dropzoneHint}>
                    PNG, JPG, atau WEBP (maks. 5MB) • Ekstraksi otomatis via AI
                  </p>
                </div>
              )}

              {/* Privacy Banner */}
              <div className={styles.privacyBanner}>
                <span
                  className={`material-symbols-outlined ${styles.lockIcon}`}
                  aria-hidden="true"
                >
                  lock
                </span>
                <p className={styles.privacyText}>
                  Gambar tidak disimpan ke server, hanya diproses sekali oleh AI lalu dibuang.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form id="add-application-form" onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              {/* Nama Perusahaan */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="company-name">
                  Nama Perusahaan <span className={styles.required}>*</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  required
                  placeholder="cth. GoTo Financial"
                  className={styles.input}
                  value={formData.company}
                  onChange={(e) => handleFieldChange("company", e.target.value)}
                />
              </div>

              {/* Posisi Pekerjaan */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="position-name">
                  Posisi Pekerjaan <span className={styles.required}>*</span>
                </label>
                <input
                  id="position-name"
                  type="text"
                  required
                  placeholder="cth. Product Designer"
                  className={styles.input}
                  value={formData.position}
                  onChange={(e) => handleFieldChange("position", e.target.value)}
                />
              </div>

              {/* Tipe Pekerjaan */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="job-type">
                  Tipe Pekerjaan <span className={styles.required}>*</span>
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

              {/* Status Awal */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="initial-status">
                  Status Awal <span className={styles.required}>*</span>
                </label>
                <Select
                  id="initial-status"
                  required
                  value={formData.initialStatus}
                  onChange={(val) => handleFieldChange("initialStatus", val)}
                  size="sm"
                  options={[
                    { value: "Submitted", label: "Submitted" },
                    { value: "Test", label: "Test" },
                    { value: "Task", label: "Task" },
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

              {/* Tanggal Melamar */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="apply-date">
                  Tanggal Melamar <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWithIconWrapper}>
                  <input
                    id="apply-date"
                    type="text"
                    required
                    placeholder="DD/MM/YYYY"
                    className={`${styles.input} ${styles.inputWithIcon}`}
                    value={formData.applyDate}
                    onChange={(e) => handleFieldChange("applyDate", e.target.value)}
                  />
                  <span
                    className={`material-symbols-outlined ${styles.inputIcon}`}
                    aria-hidden="true"
                  >
                    calendar_today
                  </span>
                </div>
              </div>

              {/* Platform Lamaran */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="platform-select">
                  Platform Lamaran <span className={styles.required}>*</span>
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

              {/* Extra field when "Lainnya (Others)" is selected */}
              {formData.platform === "Lainnya (Others)" && (
                <div className={styles.customPlatformCard}>
                  <div className={styles.customPlatformHeader}>
                    <label
                      className={`${styles.label} ${styles.customPlatformLabel}`}
                      htmlFor="custom-platform-input"
                    >
                      <span
                        className={`material-symbols-outlined ${styles.customPlatformIcon}`}
                        aria-hidden="true"
                      >
                        edit_note
                      </span>
                      Nama Platform / Sumber <span className={styles.required}>*</span>
                    </label>
                    <span className={styles.mentionManualBadge}>Sebutkan Manual</span>
                  </div>
                  <input
                    id="custom-platform-input"
                    ref={customPlatformInputRef}
                    type="text"
                    required
                    placeholder="Contoh: Glints, Deall, Website Karir, Referensi Teman..."
                    className={styles.input}
                    value={formData.customPlatform || ""}
                    onChange={(e) => handleFieldChange("customPlatform", e.target.value)}
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-application-form"
            className={styles.submitButton}
          >
            <span
              className={`material-symbols-outlined ${styles.submitButtonIcon}`}
              aria-hidden="true"
            >
              check
            </span>
            {mode === "edit" ? "Simpan Perubahan" : "Simpan Lamaran"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddApplicationModal;
