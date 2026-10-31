import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { Inbox, ArrowRight } from "lucide-react";
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
          <Inbox
            size={36}
            strokeWidth={2}
            className={styles.emptyIcon}
            aria-hidden="true"
          />
          <p className={styles.emptyText}>Belum ada lamaran tercatat.</p>
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
                  Tahap
                </th>
                <th className={`${styles.th} ${styles.thRight}`} scope="col">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={idx} className={styles.row}>
                  <td className={`${styles.td} ${styles.tdCompany}`}>
                    {app.company}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footer}>
        <Link href="/applications" className={styles.viewAllLink}>
          Lihat Semua di Job Journey
          <ArrowRight
            size={16}
            strokeWidth={2.5}
            className={styles.linkIcon}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}

export default RecentApplicationsTable;
