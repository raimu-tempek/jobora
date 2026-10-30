"use client";

import { useMemo, useState } from "react";
import {
  RingChart,
  Ring,
  RingCenter,
  type RingData,
} from "@/components/ui/ring-chart";
import type { BreakdownItem } from "./BreakdownBarList";
import styles from "./StatusBreakdownRing.module.css";

export interface StatusBreakdownRingProps {
  items: BreakdownItem[];
  total?: number;
  conversionRate?: string;
  className?: string;
}

/**
 * Direct HEX colors for each application status conforming to Jobora Design System:
 * - Submitted: #107c74 (Jobora primary teal)
 * - Test / Task: #ea580c (orange)
 * - Interview: #8b5cf6 (purple)
 * - Offering: #10b981 (emerald green)
 * - Rejected: #dc2626 (error red)
 */
const STATUS_HEX_COLORS: Record<string, string> = {
  submitted: "#107c74",
  "test / task": "#ea580c",
  test: "#ea580c",
  task: "#ea580c",
  interview: "#8b5cf6",
  offering: "#10b981",
  rejected: "#dc2626",
};

function getStatusHex(label: string): string {
  const norm = label.toLowerCase();
  for (const [key, hex] of Object.entries(STATUS_HEX_COLORS)) {
    if (norm.includes(key)) return hex;
  }
  return "#107c74";
}

export function StatusBreakdownRing({
  items = [],
  total,
  conversionRate,
  className,
}: StatusBreakdownRingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort items from largest value to smallest value descending
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (b.value || 0) - (a.value || 0));
  }, [items]);

  // Derive total applications count from items or prop
  const totalCount = useMemo(() => {
    if (typeof total === "number" && total > 0) return total;
    return sortedItems.reduce((acc, it) => acc + (it.value || 0), 0);
  }, [sortedItems, total]);

  // Construct RingData array with direct HEX colors
  const ringData: RingData[] = useMemo(() => {
    return sortedItems.map((item) => {
      const hex = getStatusHex(item.label);
      return {
        label: item.label,
        value: item.value,
        maxValue: Math.max(totalCount, 1),
        color: hex,
      };
    });
  }, [sortedItems, totalCount]);

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* 1. Ring Chart (Apple Activity multi-ring style: outermost ring = largest value) */}
      <div className={styles.chartWrapper}>
        <RingChart
          data={ringData}
          size={220}
          strokeWidth={9}
          ringGap={4}
          baseInnerRadius={38}
          padding={12}
          ringOrder="outside-in"
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
        >
          {/* 5 concentric status rings with rounded caps */}
          {ringData.map((ring, index) => (
            <Ring
              key={ring.label}
              index={index}
              color={ring.color}
              lineCap="round"
              showGlow={true}
            />
          ))}

          {/* Center content: total count & label, dynamic on hover */}
          <RingCenter defaultLabel="Total">
            {({ value, label }) => (
              <div style={{ textAlign: "center", pointerEvents: "none" }}>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#132a30",
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#627d84",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
            )}
          </RingCenter>
        </RingChart>
      </div>

      {/* 2. Interactive Status Legend List (sorted from largest to smallest) */}
      <div className={styles.legendList} role="list" aria-label="Status Breakdown Legend">
        {sortedItems.map((item, index) => {
          const hex = getStatusHex(item.label);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.label}
              className={`${styles.legendItem} ${isHovered ? styles.legendItemHovered : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="listitem"
            >
              <div className={styles.legendLeft}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
                <span className={styles.legendLabel}>{item.label}</span>
              </div>

              <div className={styles.legendRight}>
                <span className={styles.legendCount}>{item.value}</span>
                <span className={styles.legendPercentage}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Conversion Rate Footer */}
      {conversionRate && (
        <div className={styles.footer}>
          <div className={styles.conversionRate}>
            <span className={styles.conversionLabel}>Tingkat Konversi</span>
            <strong className={styles.conversionValue}>{conversionRate}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusBreakdownRing;
