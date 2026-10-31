"use client";

import { AreaSparkline } from "@/components/ui/sparkline";
import { DashboardTopStats } from "@/lib/applications/dashboard-stats";
import styles from "./TopStatsRow.module.css";

interface TopStatsRowProps {
  stats: DashboardTopStats;
}

export function TopStatsRow({ stats }: TopStatsRowProps) {
  return (
    <div className={styles.statsBentoGrid} role="region" aria-label="Ringkasan Metrik Utama">
      {/* 1. Hero Anchor Metric: Pipeline Aktif (Span 4) */}
      <div className={`${styles.bentoCard} ${styles.heroCard}`}>
        <div>
          <div className={styles.heroLabel}>
            <span className="w-2 h-2 rounded-full bg-[#107c74] animate-pulse" />
            <span>Pipeline Berjalan</span>
          </div>
          <div className={styles.heroValue}>
            {stats.activePipeline.value.toLocaleString("id-ID")}
          </div>
          <p className={styles.heroSubtext}>
            {stats.activePipeline.subtext || "Lamaran dalam seleksi aktif"}
          </p>
        </div>

        <div className={styles.sparklineContainer}>
          <AreaSparkline
            data={stats.activePipeline.sparkline}
            dataKey="value"
            height={28}
            color="#107c74"
            strokeWidth={2.2}
            fill="gradient"
            curve="monotone"
            className="w-full"
          />
        </div>
      </div>

      {/* 2. Secondary Metric: Tingkat Respons (Span 3) */}
      <div className={`${styles.bentoCard} ${styles.rateCard}`}>
        <div>
          <span className={styles.cardLabel}>Tingkat Respons</span>
          <div className={`${styles.cardValue} text-[#107c74]`}>
            {stats.callbackRate.percentage}%
          </div>
          <p className={styles.cardSubtext}>{stats.callbackRate.subtext}</p>
        </div>

        <div className={styles.sparklineContainer}>
          <AreaSparkline
            data={stats.callbackRate.sparkline}
            dataKey="value"
            height={26}
            color="#107c74"
            strokeWidth={2}
            fill="gradient"
            curve="monotone"
            className="w-full"
          />
        </div>
      </div>

      {/* 3. Secondary Metric: Tingkat Interview (Span 3) */}
      <div className={`${styles.bentoCard} ${styles.rateCard}`}>
        <div>
          <span className={styles.cardLabel}>Tingkat Interview</span>
          <div className={`${styles.cardValue} text-[#8b5cf6]`}>
            {stats.interviewRate.percentage}%
          </div>
          <p className={styles.cardSubtext}>{stats.interviewRate.subtext}</p>
        </div>

        <div className={styles.sparklineContainer}>
          <AreaSparkline
            data={stats.interviewRate.sparkline}
            dataKey="value"
            height={26}
            color="#8b5cf6"
            strokeWidth={2}
            fill="gradient"
            curve="monotone"
            className="w-full"
          />
        </div>
      </div>

      {/* 4. Celebratory Metric: Penawaran (Offer) (Span 2) */}
      <div className={`${styles.bentoCard} ${styles.offerCard}`}>
        <div>
          <span className={`${styles.cardLabel} text-[#10b981]`}>
            Penawaran (Offer)
          </span>
          <div className={styles.offerValue}>
            {stats.offers.value.toLocaleString("id-ID")}
          </div>
          <p className={styles.cardSubtext}>{stats.offers.subtext}</p>
        </div>

        <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
          <span>Target Tercapai</span>
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
        </div>
      </div>
    </div>
  );
}
