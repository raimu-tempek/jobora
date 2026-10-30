"use client";

import React, { useMemo } from "react";
import { Application } from "@/types/application";
import { RecruitmentEvent, ApplicationStatusHistory } from "@/types/recruitment";
import { FinancialTransaction } from "@/types/finance";
import { formatDateIndo } from "@/lib/finance/format";
import {
  Activity,
  Briefcase,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import styles from "./CommandCenter.module.css";

export interface RecentActivityFeedProps {
  applications: Application[];
  events: RecruitmentEvent[];
  history: ApplicationStatusHistory[];
  transactions: FinancialTransaction[];
}

interface UnifiedActivityItem {
  id: string;
  source: "application" | "status_change" | "event" | "finance";
  title: string;
  description: string;
  timestamp: string; // ISO string
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export function RecentActivityFeed({
  applications,
  events,
  history,
  transactions,
}: RecentActivityFeedProps) {
  const activities = useMemo(() => {
    const list: UnifiedActivityItem[] = [];

    // 1. Status changes
    for (const h of history) {
      const app = applications.find((a) => a.id === h.application_id);
      list.push({
        id: `hist-${h.id}`,
        source: "status_change",
        title: app ? app.company : "Lamaran Kerja",
        description: `Status diubah dari ${h.previous_status} → ${h.new_status}`,
        timestamp: h.created_at,
        icon: <Activity size={15} />,
        iconBg: "#f3e8ff",
        iconColor: "#7e22ce",
      });
    }

    // 2. Applications submitted (use created_at or date)
    for (const a of applications.slice(0, 5)) {
      const ts = a.created_at || `${a.date}T09:00:00.000Z`;
      list.push({
        id: `app-${a.id}`,
        source: "application",
        title: a.company,
        description: `Melamar posisi ${a.position} (${a.type})`,
        timestamp: ts,
        icon: <Briefcase size={15} />,
        iconBg: "var(--color-primary-soft)",
        iconColor: "var(--color-primary)",
      });
    }

    // 3. Recruitment events scheduled
    for (const e of events.slice(0, 5)) {
      list.push({
        id: `evt-${e.id}`,
        source: "event",
        title: e.title,
        description: `${e.event_type} • ${e.is_completed ? "Selesai dilaksanakan" : "Dijadwalkan"}`,
        timestamp: e.created_at || e.start_time,
        icon: e.is_completed ? <CheckCircle2 size={15} /> : <Calendar size={15} />,
        iconBg: e.is_completed ? "#dcfce7" : "#fef3c7",
        iconColor: e.is_completed ? "#15803d" : "#b45309",
      });
    }

    // 4. Financial transactions
    for (const t of transactions.slice(0, 5)) {
      const isInc = t.type === "income";
      list.push({
        id: `tx-${t.id}`,
        source: "finance",
        title: t.title,
        description: `${isInc ? "Pemasukan" : "Pengeluaran"} tercatat`,
        timestamp: t.created_at || `${t.date}T10:00:00.000Z`,
        icon: isInc ? <TrendingUp size={15} /> : <TrendingDown size={15} />,
        iconBg: isInc ? "#dcfce7" : "#fee2e2",
        iconColor: isInc ? "#15803d" : "#b91c1c",
      });
    }

    // Sort chronologically descending
    list.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return list.slice(0, 7);
  }, [applications, events, history, transactions]);

  const formatActivityTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return "Baru saja";
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;

      const datePart = isoString.split("T")[0];
      return formatDateIndo(datePart);
    } catch {
      return "";
    }
  };

  return (
    <div className={styles.sectionCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>
            <Activity size={18} className="text-teal-700" />
            <span>Aktivitas Terbaru</span>
          </h3>
          <p className={styles.cardSubtitle}>
            Catatan kronologis lamaran, jadwal, dan transaksi aktual
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className={styles.emptyState}>
          <Activity size={22} className="text-gray-400" />
          <p className={styles.emptyStateTitle}>Belum ada aktivitas tercatat</p>
          <p className={styles.emptyStateText}>
            Aktivitas terbaru dari seluruh modul akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className={styles.activityList}>
          {activities.map((item) => (
            <div key={item.id} className={styles.activityItem}>
              <div
                className={styles.activityIconBox}
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
              >
                {item.icon}
              </div>

              <div className={styles.activityContent}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className={styles.activityTitle}>{item.title}</h4>
                  <span className={styles.activityTime}>
                    {formatActivityTime(item.timestamp)}
                  </span>
                </div>
                <p className={styles.activityMeta}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
