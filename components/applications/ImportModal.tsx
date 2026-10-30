"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import readXlsxFile from "read-excel-file/browser";
import {
  Upload,
  X,
  Sparkles,
  FolderOpen,
  BarChart3,
  UploadCloud,
  Zap,
} from "lucide-react";
import {
  importApplications,
  seedSampleApplications,
  type ImportApplicationInput,
} from "@/lib/applications/actions";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import styles from "./ImportModal.module.css";

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  useBodyScrollLock(isOpen);
  const [activeTab, setActiveTab] = useState<"seed" | "file">("seed");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [parsedRows, setParsedRows] = useState<ImportApplicationInput[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await seedSampleApplications();
      if (res.success) {
        onSuccess(`Berhasil memuat ${res.count || 18} data lamaran contoh!`);
        onClose();
      } else {
        setError(res.error || "Gagal memuat data contoh.");
      }
    } catch {
      setError("Terjadi kesalahan sistem saat memuat data contoh.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseCSV = (text: string): ImportApplicationInput[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const colMap: Record<string, number> = {};
    header.forEach((h, idx) => {
      if (h.includes("comp") || h.includes("perusahaan")) colMap.company = idx;
      else if (h.includes("pos") || h.includes("role") || h.includes("jabatan")) colMap.position = idx;
      else if (h.includes("type") || h.includes("tipe")) colMap.type = idx;
      else if (h.includes("status")) colMap.status = idx;
      else if (h.includes("plat") || h.includes("sumber")) colMap.platform = idx;
      else if (h.includes("date") || h.includes("tanggal")) colMap.date = idx;
    });

    if (colMap.company === undefined) colMap.company = 0;
    if (colMap.position === undefined) colMap.position = 1;
    if (colMap.type === undefined) colMap.type = 2;
    if (colMap.date === undefined) colMap.date = 3;
    if (colMap.status === undefined) colMap.status = 4;
    if (colMap.platform === undefined) colMap.platform = 5;

    const rows: ImportApplicationInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cells: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          cells.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current.trim());

      const company = cells[colMap.company]?.replace(/^"|"$/g, "");
      const position = cells[colMap.position]?.replace(/^"|"$/g, "");
      const type = cells[colMap.type]?.replace(/^"|"$/g, "") || "Full-time";
      const date = cells[colMap.date]?.replace(/^"|"$/g, "");
      const status = cells[colMap.status]?.replace(/^"|"$/g, "") || "Submitted";
      const platform = cells[colMap.platform]?.replace(/^"|"$/g, "") || "LinkedIn";

      if (company && position) {
        rows.push({ company, position, type, date, status, platform });
      }
    }

    return rows;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    // 1. Excel (.xlsx / .xls) parser
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      try {
        const excelRows = (await readXlsxFile(file)) as unknown as Array<Array<unknown>>;
        if (excelRows.length < 2) {
          setError("File Excel kosong atau tidak memiliki baris data.");
          return;
        }

        const header = excelRows[0].map((h: unknown) => String(h || "").trim().toLowerCase());
        const colMap: Record<string, number> = {};
        header.forEach((h: string, idx: number) => {
          if (h.includes("comp") || h.includes("perusahaan")) colMap.company = idx;
          else if (h.includes("pos") || h.includes("role") || h.includes("jabatan")) colMap.position = idx;
          else if (h.includes("type") || h.includes("tipe")) colMap.type = idx;
          else if (h.includes("status")) colMap.status = idx;
          else if (h.includes("plat") || h.includes("sumber")) colMap.platform = idx;
          else if (h.includes("date") || h.includes("tanggal")) colMap.date = idx;
        });

        if (colMap.company === undefined) colMap.company = 0;
        if (colMap.position === undefined) colMap.position = 1;
        if (colMap.type === undefined) colMap.type = 2;
        if (colMap.date === undefined) colMap.date = 3;
        if (colMap.status === undefined) colMap.status = 4;
        if (colMap.platform === undefined) colMap.platform = 5;

        const items: ImportApplicationInput[] = [];
        for (let i = 1; i < excelRows.length; i++) {
          const row = excelRows[i];
          if (!row || row.length === 0) continue;
          const company = String(row[colMap.company] || "").trim();
          const position = String(row[colMap.position] || "").trim();
          const type = String(row[colMap.type] || "").trim() || "Full-time";

          const rawDate = row[colMap.date];
          let dateStr: string | undefined = undefined;
          if (rawDate instanceof Date) {
            dateStr = rawDate.toISOString().split("T")[0];
          } else if (rawDate) {
            dateStr = String(rawDate).trim();
          }

          const status = String(row[colMap.status] || "").trim() || "Submitted";
          const platform = String(row[colMap.platform] || "").trim() || "LinkedIn";

          if (company && position) {
            items.push({ company, position, type, date: dateStr, status, platform });
          }
        }

        setParsedRows(items);
      } catch {
        setError("Gagal membaca file Excel (.xlsx). Pastikan format file valid.");
      }
      return;
    }

    // 2. JSON & CSV parser
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          const rawItems = Array.isArray(json) ? json : json.applications || [];
          const valid = rawItems
            .filter((item: Record<string, unknown>) => item.company && item.position)
            .map((item: Record<string, unknown>) => ({
              company: String(item.company),
              position: String(item.position),
              type: String(item.type || "Full-time"),
              status: String(item.status || "Submitted"),
              platform: String(item.platform || "LinkedIn"),
              date: item.date ? String(item.date) : undefined,
            }));
          setParsedRows(valid);
        } else {
          // Assume CSV
          const rows = parseCSV(content);
          setParsedRows(rows);
        }
      } catch {
        setError(
          "Format file tidak valid. Pastikan format CSV, XLSX, atau JSON sesuai template."
        );
      }
    };
    reader.readAsText(file);
  };

  const handleImportFile = async () => {
    if (parsedRows.length === 0) {
      setError("Tidak ada data lamaran valid yang dapat diimpor.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await importApplications(parsedRows);
      if (res.success) {
        onSuccess(`Berhasil mengimpor ${res.count || parsedRows.length} lamaran!`);
        onClose();
      } else {
        setError(res.error || "Gagal mengimpor file.");
      }
    } catch {
      setError("Terjadi kesalahan sistem saat mengimpor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "company,position,type,date,status,platform\n" +
      "Tokopedia,Senior Frontend Engineer,Full-time,2026-06-15,Interview HR,LinkedIn\n" +
      "GoTo Financial,Backend Engineer (Go),Full-time,2026-07-02,Offering,LinkedIn\n" +
      "Traveloka,Product Manager,Full-time,2026-08-10,Rejected,Website Perusahaan\n" +
      "Shopee,Software Engineer,Full-time,2026-09-01,Test,Glints\n" +
      "Blibli,UI/UX Designer,Full-time,2026-09-20,Interview User,JobStreet\n" +
      "Tiket.com,Frontend Engineer,Remote,2026-10-12,Offering,LinkedIn";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Template_Lamaran_Jobora.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <Upload
                size={22}
                color="#107c74"
                strokeWidth={2.5}
              />
              <h2 className={styles.title}>Import Data Lamaran</h2>
            </div>
            <p className={styles.subtitle}>
              Bisa langsung muat data contoh, atau unggah file Excel (.xlsx), CSV, atau JSON.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "seed" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("seed")}
          >
            <Sparkles size={16} strokeWidth={2.5} />
            Data Contoh (Instan)
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "file" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("file")}
          >
            <FolderOpen size={16} strokeWidth={2.5} />
            Upload Excel (.xlsx) / CSV
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--color-error-bg)",
                color: "var(--color-error)",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          {activeTab === "seed" ? (
            <div className={styles.seedCard}>
              <div className={styles.seedIconRow}>
                <BarChart3
                  size={24}
                  strokeWidth={2.5}
                  color="#107c74"
                  className={styles.seedIcon}
                />
                <div>
                  <h4 className={styles.seedTitle}>18 Data Lamaran Lengkap</h4>
                  <p className={styles.seedDesc}>
                    Langsung mengisi grafik aktivitas bulanan (6 bulan terakhir), KPI, dan
                    statistik status & platform secara realistis.
                  </p>
                </div>
              </div>

              <ul className={styles.seedList}>
                <li>📅 Rentang tanggal: Mei – Oktober 2026 (6 bulan berkelanjutan)</li>
                <li>🏢 Perusahaan: Tokopedia, GoTo, Traveloka, Shopee, Blibli, Grab, dll.</li>
                <li>📊 Tahap: Submitted, Test, Task, Interview HR/User, Offering, Rejected</li>
                <li>🌐 Platform: LinkedIn, JobStreet, Glints, Kalibrr, Website Perusahaan</li>
              </ul>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, application/json"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <div
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud
                  size={36}
                  strokeWidth={2}
                  color="#107c74"
                  className={styles.dropzoneIcon}
                />
                <p className={styles.dropzoneText}>
                  {fileName ? fileName : "Klik untuk memilih file Excel (.xlsx) atau CSV"}
                </p>
                <p className={styles.dropzoneHint}>
                  Format yang didukung: .xlsx, .csv, atau .json
                </p>
              </div>

              <button
                type="button"
                className={styles.templateLink}
                onClick={handleDownloadTemplate}
              >
                📥 Unduh Template CSV / Excel Contoh
              </button>

              {parsedRows.length > 0 && (
                <div className={styles.previewBox}>
                  <p className={styles.previewSummary}>
                    ✓ Terdeteksi {parsedRows.length} lamaran siap diimpor:
                  </p>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Perusahaan</th>
                        <th>Posisi</th>
                        <th>Status</th>
                        <th>Platform</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 3).map((r, i) => (
                        <tr key={i}>
                          <td>{r.company}</td>
                          <td>{r.position}</td>
                          <td>{r.status}</td>
                          <td>{r.platform}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </button>

          {activeTab === "seed" ? (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSeed}
              disabled={isLoading}
            >
              <Zap size={16} strokeWidth={2.5} />
              {isLoading ? "Memuat..." : "Muat Data Contoh"}
            </button>
          ) : (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleImportFile}
              disabled={isLoading || parsedRows.length === 0}
            >
              <Upload size={16} strokeWidth={2.5} />
              {isLoading ? "Mengimpor..." : `Import ${parsedRows.length} Lamaran`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
