import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { Briefcase, ArrowRight, Plus } from "lucide-react";
import styles from "./RecentApplicationsTable.module.css";

export interface ApplicationRow {
  company: string;
  position: string;
  /** DB enum value passed straight through to StatusBadge */
  status: string;
  /** Formatted date string, e.g. "12 Jan 2025" */
  date: string;
}

export interface RecentApplicationsTableProps {
  /**
   * Maximum 5 rows shown. Caller is responsible for slicing.
   * If the array is empty an empty-state message is shown.
   */
  applications: ApplicationRow[];
}

export function RecentApplicationsTable({
  applications,
}: RecentApplicationsTableProps) {
  return (
    <div className={styles.wrapper}>
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Briefcase
              size={24}
              strokeWidth={2.2}
              className="text-[#107c74]"
              aria-hidden="true"
            />
          </div>
          <h4 className={styles.emptyTitle}>Belum Ada Lamaran Tercatat</h4>
          <p className={styles.emptyText}>
            Mulai catat lamaran pekerjaan yang telah Anda kirimkan untuk memantau perkembangan proses seleksi secara terstruktur.
          </p>
          <Link href="/applications" className={styles.emptyCta}>
            <Plus size={14} strokeWidth={2.5} />
            <span>Kirim Lamaran Pertama</span>
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.th} scope="col">
                  Perusahaan
                </th>
                <th className={styles.th} scope="col">
                  Posisi
                </th>
                <th className={styles.th} scope="col">
                  Tahap Seleksi
                </th>
                <th className={`${styles.th} ${styles.thRight}`} scope="col">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => {
                const initial = (app.company || "P").charAt(0).toUpperCase();
                return (
                  <tr key={idx} className={styles.row}>
                    <td className={`${styles.td} ${styles.tdCompany}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={styles.companyInitial}>
                          {initial}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {app.company}
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdPosition}`}>
                      {app.position}
                    </td>
                    <td className={styles.td}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td className={`${styles.td} ${styles.tdDate}`}>
                      {app.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {applications.length > 0 && (
        <div className={styles.footer}>
          <Link href="/applications" className={styles.viewAllLink}>
            <span>Lihat Semua Lamaran di Job Tracker</span>
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className={styles.linkIcon}
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
    </div>
  );
}

export default RecentApplicationsTable;
