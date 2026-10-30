import { Clock } from "lucide-react";
import styles from "./FollowUpReminderBanner.module.css";

export interface FollowUpReminderBannerProps {
  count: number;
  /** href for "Lihat detail →" link. Default: /applications */
  href?: string;
}

export function FollowUpReminderBanner({
  count,
  href = "/applications",
}: FollowUpReminderBannerProps) {
  if (count <= 0) return null;

  return (
    <div className={styles.banner} role="alert">
      <Clock
        size={22}
        strokeWidth={2.5}
        className={styles.icon}
        aria-hidden="true"
      />

      <div className={styles.body}>
        <span className={styles.title}>Tindak Lanjut Diperlukan</span>
        <span className={styles.description}>
          Kamu punya{" "}
          <strong className={styles.count}>{count}</strong>{" "}
          lamaran yang belum di-update lebih dari 7 hari
        </span>
      </div>

      <a href={href} className={styles.link}>
        Lihat detail →
      </a>
    </div>
  );
}

export default FollowUpReminderBanner;
