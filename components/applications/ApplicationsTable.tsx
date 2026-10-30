"use client";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import styles from "./ApplicationsTable.module.css";

export interface ApplicationItem {
  id?: string;
  company: string;
  companyMeta?: string;
  position: string;
  jobType: string;
  platform: string;
  platformIcon?: string;
  applyDate: string;
  rawDate?: string;
  status: string;
  needsFollowUp?: boolean;
}

export interface ApplicationsTableProps {
  applications: ApplicationItem[];
  onViewDetail?: (app: ApplicationItem) => void;
  onEdit?: (app: ApplicationItem) => void;
  onDelete?: (app: ApplicationItem) => void;
}

function resolvePlatformIcon(platform: string): string {
  const normalized = platform.toLowerCase();
  if (normalized.includes("linkedin")) return "share";
  if (normalized.includes("kalibrr")) return "public";
  if (normalized.includes("jobstreet")) return "work_history";
  if (normalized.includes("glints")) return "handshake";
  if (normalized.includes("career portal") || normalized.includes("portal")) return "domain";
  return "public";
}

export function ApplicationsTable({
  applications,
  onViewDetail,
  onEdit,
  onDelete,
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyState}>
          <span
            className={`material-symbols-outlined ${styles.emptyIcon}`}
            aria-hidden="true"
          >
            search_off
          </span>
          <p className={styles.emptyTitle}>Tidak ada lamaran ditemukan</p>
          <p className={styles.emptySubtitle}>
            Coba sesuaikan kata kunci pencarian atau filter status yang dipilih.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={`${styles.th} ${styles.thCompany}`} scope="col">
              Perusahaan
            </th>
            <th className={styles.th} scope="col">
              Posisi
            </th>
            <th className={styles.th} scope="col">
              Tipe
            </th>
            <th className={styles.th} scope="col">
              Platform
            </th>
            <th className={styles.th} scope="col">
              Tanggal Melamar
            </th>
            <th className={styles.th} scope="col">
              Status Progres
            </th>
            <th className={`${styles.th} ${styles.thAction}`} scope="col">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => {
            const iconName = app.platformIcon || resolvePlatformIcon(app.platform);

            return (
              <tr key={app.id || `${app.company}-${index}`} className={styles.row}>
                {/* Perusahaan */}
                <td className={`${styles.td} ${styles.tdCompany}`}>
                  <div className={styles.companyCell}>
                    <div className={styles.companyNameRow}>
                      <span className={styles.companyName}>{app.company}</span>
                      {app.needsFollowUp && (
                        <span className={styles.followUpBadge}>
                          <span className={styles.followUpDot} aria-hidden="true" />
                          Follow-up
                        </span>
                      )}
                    </div>
                    {app.companyMeta && (
                      <span className={styles.companyMeta}>{app.companyMeta}</span>
                    )}
                  </div>
                </td>

                {/* Posisi */}
                <td className={`${styles.td} ${styles.tdPosition}`}>
                  <span className={styles.positionText}>{app.position}</span>
                </td>

                {/* Tipe (neutral soft-teal badge per DESIGN_SYSTEM-Jobora.md) */}
                <td className={styles.td}>
                  <span className={styles.jobTypeBadge}>{app.jobType}</span>
                </td>

                {/* Platform */}
                <td className={styles.td}>
                  <div className={styles.platformCell}>
                    <span
                      className={`material-symbols-outlined ${styles.platformIcon}`}
                      aria-hidden="true"
                    >
                      {iconName}
                    </span>
                    <span className={styles.platformName}>{app.platform}</span>
                  </div>
                </td>

                {/* Tanggal Melamar */}
                <td className={`${styles.td} ${styles.tdDate}`}>
                  <span className={styles.dateText}>{app.applyDate}</span>
                </td>

                {/* Status Progres */}
                <td className={styles.td}>
                  <StatusBadge status={app.status} />
                </td>

                {/* Aksi */}
                <td className={`${styles.td} ${styles.tdAction}`}>
                  <div className={styles.actionButtonGroup}>
                    {onViewDetail && (
                      <button
                        type="button"
                        className={styles.actionButton}
                        title="Lihat Detail"
                        aria-label={`Lihat detail ${app.company}`}
                        onClick={() => onViewDetail(app)}
                      >
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          visibility
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.editButton}`}
                      title="Edit Lamaran"
                      aria-label={`Edit ${app.company}`}
                      onClick={() => onEdit?.(app)}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Hapus Lamaran"
                      aria-label={`Hapus ${app.company}`}
                      onClick={() => onDelete?.(app)}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationsTable;
