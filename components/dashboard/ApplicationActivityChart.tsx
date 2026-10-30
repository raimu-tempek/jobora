"use client";

import { useMemo, useState } from "react";
// Scoped Tailwind entry point exclusively for Bklit chart rendering
import "@/app/tailwind.css";

import { Calendar, CalendarDays, Zap } from "lucide-react";

import {
  AreaChart,
  Area,
  Grid,
  XAxis,
  YAxis,
  ChartTooltip,
} from "@/components/ui/area-chart";
import type { Application } from "@/types/application";
import {
  computeDailyActivityData,
  computeWeeklyActivityData,
  computeMonthlyActivityData,
} from "@/lib/applications/chart";
import styles from "./ApplicationActivityChart.module.css";

export type ActivityCategoryMode = "harian" | "mingguan" | "bulanan" | "tahunan";

export interface ActivityDataPoint {
  month: string;
  label?: string;
  count: number;
  date?: string | Date;
  dateRangeText?: string;
}

export interface ApplicationActivityChartProps {
  applications?: Application[];
  data?: ActivityDataPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
  onImportClick?: () => void;
}

export function ApplicationActivityChart({
  applications = [],
  data = [],
  title = "Application Activity",
  subtitle: customSubtitle,
  className,
  onImportClick,
}: ApplicationActivityChartProps) {
  // Category toggle: "harian" vs "mingguan" vs "bulanan" (default) vs "tahunan"
  const [rangeMode, setRangeMode] = useState<ActivityCategoryMode>("bulanan");

  // Only render subtitle if explicitly provided
  const subtitle = customSubtitle;

  // 1. Build dataset based on selected category (harian, mingguan, bulanan, tahunan)
  const chartPoints = useMemo<ActivityDataPoint[]>(() => {
    if (applications && applications.length > 0) {
      if (rangeMode === "harian") {
        return computeDailyActivityData(applications, 30);
      }
      if (rangeMode === "mingguan") {
        return computeWeeklyActivityData(applications, 10);
      }
      if (rangeMode === "bulanan") {
        return computeMonthlyActivityData(applications, 6);
      }
      return computeMonthlyActivityData(applications, 12);
    }

    if (data && data.length > 0) {
      const limit =
        rangeMode === "harian"
          ? 30
          : rangeMode === "mingguan"
          ? 10
          : rangeMode === "bulanan"
          ? 6
          : 12;
      return data.slice(-limit).map((d) => ({
        month: d.month,
        label: d.label || d.month,
        count: d.count,
        date: d.date instanceof Date ? d.date : new Date(d.date || 0),
        dateRangeText: d.dateRangeText || d.month,
      }));
    }

    return [];
  }, [applications, data, rangeMode]);

  // 2. Ensure at least 2 points for valid time scale domain
  const safeChartPoints = useMemo(() => {
    if (chartPoints.length === 0) return [];
    if (chartPoints.length === 1) {
      const single = chartPoints[0];
      const d =
        single.date instanceof Date
          ? single.date
          : new Date(single.date || 0);
      const prevDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const prevLabel = `${prevDate.getMonth() + 1}/${prevDate.getFullYear()}`;
      return [
        {
          month: prevLabel,
          label: prevLabel,
          count: 0,
          date: prevDate,
          dateRangeText: prevLabel,
        },
        single,
      ];
    }
    return chartPoints;
  }, [chartPoints]);

  const totalApplications = useMemo(() => {
    return chartPoints.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  }, [chartPoints]);

  const hasData =
    safeChartPoints.length > 0 &&
    (totalApplications > 0 || (applications && applications.length > 0));

  return (
    <div className={`${styles.card} ${className || ""}`}>
      {/* Card Header Chrome */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>

        {/* Category Segmented Control: Harian vs Mingguan vs Bulanan vs Tahunan */}
        <div
          className={styles.toggleGroup}
          role="group"
          aria-label="Filter kategori rentang aktivitas lamaran"
        >
          <button
            type="button"
            className={`${styles.toggleButton} ${
              rangeMode === "harian"
                ? styles.toggleButtonActive
                : styles.toggleButtonInactive
            }`}
            onClick={() => setRangeMode("harian")}
            aria-pressed={rangeMode === "harian"}
          >
            Harian
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${
              rangeMode === "mingguan"
                ? styles.toggleButtonActive
                : styles.toggleButtonInactive
            }`}
            onClick={() => setRangeMode("mingguan")}
            aria-pressed={rangeMode === "mingguan"}
          >
            Mingguan
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${
              rangeMode === "bulanan"
                ? styles.toggleButtonActive
                : styles.toggleButtonInactive
            }`}
            onClick={() => setRangeMode("bulanan")}
            aria-pressed={rangeMode === "bulanan"}
          >
            Bulanan
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${
              rangeMode === "tahunan"
                ? styles.toggleButtonActive
                : styles.toggleButtonInactive
            }`}
            onClick={() => setRangeMode("tahunan")}
            aria-pressed={rangeMode === "tahunan"}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Area Chart Canvas Container */}
      <div className={`${styles.chartContainer} ${styles.chartScope}`}>
        {hasData ? (
          <div>
            <AreaChart
              data={safeChartPoints as unknown as Record<string, unknown>[]}
              xDataKey="date"
              aspectRatio="1.9 / 1"
              margin={{ top: 24, right: 36, bottom: 36, left: 54 }}
              animationDuration={800}
            >
              {/* Horizontal Grid Lines with direct HEX stroke */}
              <Grid
                horizontal={true}
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="4,4"
              />

              {/* X-Axis: labels ("Mei", "Jun" or "17 Agu", etc.) with ample breathing space */}
              <XAxis
                tickMode="data"
                numTicks={
                  rangeMode === "harian" ? 6 : rangeMode === "mingguan" ? 7 : 6
                }
                labels={safeChartPoints.map(
                  (d) => (d.label || d.month) as string
                )}
              />

              {/* Y-Axis: integer count of applications with ample left margin */}
              <YAxis
                orientation="left"
                numTicks={5}
                formatLargeNumbers={false}
                formatValue={(v) => `${v}`}
              />

              {/* Composable Area with direct HEX gradient and stroke */}
              <Area
                dataKey="count"
                fill="#107c74"
                stroke="#107c74"
                strokeWidth={2.5}
                fillOpacity={0.25}
                gradientToOpacity={0.02}
                fadeEdges={false}
                showLine={true}
                showHighlight={true}
              />

              {/* Interactive Tooltip with direct HEX styling */}
              <ChartTooltip
                showCrosshair={true}
                indicatorColor="#107c74"
                backgroundColor="#132a30"
                panelStyle={{
                  backgroundColor: "#132a30",
                  borderColor: "#23454f",
                  border: "1px solid #23454f",
                  borderRadius: "8px",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                content={({ point }) => {
                  const label = (point.dateRangeText ||
                    point.month ||
                    point.label) as string;
                  const val = Number(point.count ?? 0);

                  return (
                    <div
                      style={{
                        padding: "8px 12px",
                        minWidth: "140px",
                        color: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "11px",
                          marginBottom: "6px",
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#107c74",
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#e2e8f0",
                              fontWeight: 500,
                            }}
                          >
                            Lamaran
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#ffffff",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </AreaChart>

            {/* Footer with summary & legend */}
            <div className={styles.chartFooter}>
              <div className={styles.summaryText}>
                <Calendar
                  size={16}
                  color="#107c74"
                  strokeWidth={2.5}
                />
                <span>
                  Total{" "}
                  <span className={styles.summaryCount}>
                    {totalApplications} lamaran
                  </span>{" "}
                  terkirim ({rangeMode === "harian" ? "Harian" : rangeMode === "mingguan" ? "Mingguan" : rangeMode === "bulanan" ? "Bulanan" : "Tahunan"})
                </span>
              </div>

              {/* Area Legend */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#627d84",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: "#107c74",
                    display: "inline-block",
                  }}
                />
                <span>Aktivitas Lamaran</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <CalendarDays
              size={36}
              color="#107c74"
              strokeWidth={2}
              style={{ opacity: 0.8 }}
            />
            <p className={styles.emptyStateTitle}>
              Belum ada data aktivitas lamaran
            </p>
            <span className={styles.emptyStateDesc}>
              Tambahkan atau import data lamaran untuk mulai melihat grafik tren
              aktivitasmu.
            </span>
            {onImportClick && (
              <button
                type="button"
                className={styles.emptyStateButton}
                onClick={onImportClick}
              >
                <Zap
                  size={16}
                  strokeWidth={2.5}
                />
                Muat Data Contoh / Import
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationActivityChart;
