"use client";

import React from "react";
import { formatIDRCompact } from "@/lib/finance/format";
import { Briefcase, Calendar, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import styles from "./CommandCenter.module.css";

export interface CommandCenterKpisProps {
  activeJobsCount: number;
  upcomingEventsCount: number;
  totalBalance: number;
  netCashFlow: number;
}

export function CommandCenterKpis({
  activeJobsCount,
  upcomingEventsCount,
  totalBalance,
  netCashFlow,
}: CommandCenterKpisProps) {
  const isSurplus = netCashFlow >= 0;

  return (
    <section className={styles.kpiGrid} aria-label="Ringkasan Eksekutif Command Center">
      {/* 1. Lamaran Aktif */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiTop}>
          <span className={styles.kpiLabel}>Lamaran Aktif</span>
          <div
            className={styles.kpiIconBox}
            style={{ backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)" }}
          >
            <Briefcase size={18} strokeWidth={2.5} />
          </div>
        </div>
        <p className={styles.kpiValue}>{activeJobsCount}</p>
        <p className={styles.kpiSubtitle}>
          <span>Dalam tahapan seleksi</span>
        </p>
      </div>

      {/* 2. Agenda Rekrutmen Mendatang */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiTop}>
          <span className={styles.kpiLabel}>Agenda & Deadline</span>
          <div
            className={styles.kpiIconBox}
            style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}
          >
            <Calendar size={18} strokeWidth={2.5} />
          </div>
        </div>
        <p className={styles.kpiValue}>{upcomingEventsCount}</p>
        <p className={styles.kpiSubtitle}>
          <span>Interview & deadline 7 hari</span>
        </p>
      </div>

      {/* 3. Saldo Gabungan Akun */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiTop}>
          <span className={styles.kpiLabel}>Saldo Keuangan</span>
          <div
            className={styles.kpiIconBox}
            style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
          >
            <Wallet size={18} strokeWidth={2.5} />
          </div>
        </div>
        <p className={styles.kpiValue}>{formatIDRCompact(totalBalance)}</p>
        <p className={styles.kpiSubtitle}>
          <span>Total seluruh akun aktif</span>
        </p>
      </div>

      {/* 4. Arus Kas Bersih Bulan Ini */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiTop}>
          <span className={styles.kpiLabel}>Arus Kas Bersih</span>
          <div
            className={styles.kpiIconBox}
            style={{
              backgroundColor: isSurplus ? "#dcfce7" : "#fee2e2",
              color: isSurplus ? "#15803d" : "#b91c1c",
            }}
          >
            {isSurplus ? (
              <TrendingUp size={18} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={18} strokeWidth={2.5} />
            )}
          </div>
        </div>
        <p
          className={styles.kpiValue}
          style={{ color: isSurplus ? "#15803d" : "#b91c1c" }}
        >
          {formatIDRCompact(netCashFlow)}
        </p>
        <p className={styles.kpiSubtitle}>
          <span>{isSurplus ? "Surplus bulan ini" : "Defisit bulan ini"}</span>
        </p>
      </div>
    </section>
  );
}
