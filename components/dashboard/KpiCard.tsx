import { useMemo } from "react";
import styles from "./KpiCard.module.css";
import { LineSparkline, BarSparkline } from "@/components/ui/sparkline";
import type { LucideIcon } from "lucide-react";
import { Send, Hourglass, Users, Award } from "lucide-react";

export type KpiCardColor = "primary" | "amber" | "purple" | "emerald";

const DEFAULT_ICON_MAP: Record<string, LucideIcon> = {
  send: Send,
  applied: Send,
  hourglass_top: Hourglass,
  hourglass: Hourglass,
  active: Hourglass,
  group: Users,
  interview: Users,
  verified: Award,
  offer: Award,
};

export interface KpiCardProps {
  label: string;
  value: number;
  caption: string;
  /** Lucide icon component or icon identifier string */
  icon: LucideIcon | string;
  color: KpiCardColor;
  sparklineData?: { value: number }[];
  /** Direct HEX color for sparkline (bukan CSS variable) */
  sparklineColor?: string;
  variant?: "line" | "bar";
  changeText?: string;
}

export function KpiCard({
  label,
  value,
  caption,
  icon,
  color,
  sparklineData,
  sparklineColor,
  variant = "line",
  changeText,
}: KpiCardProps) {
  const ResolvedIcon = useMemo(() => {
    if (typeof icon === "string") {
      return DEFAULT_ICON_MAP[icon.toLowerCase()] || Send;
    }
    return icon;
  }, [icon]);

  // Direct HEX fallback colors matching Jobora palette
  const resolvedColor =
    sparklineColor ??
    (color === "primary"
      ? "#107c74"
      : color === "amber"
      ? "#d97706"
      : color === "purple"
      ? "#8b5cf6"
      : "#10b981");

  // Calculate percentage change comparing latest period vs previous period
  const change = useMemo(() => {
    if (changeText) {
      const isUp = changeText.startsWith("↑") || changeText.startsWith("+");
      const isDown = changeText.startsWith("↓") || changeText.startsWith("-");
      return {
        text: changeText,
        direction: isUp ? ("up" as const) : isDown ? ("down" as const) : ("flat" as const),
      };
    }

    if (!sparklineData || sparklineData.length < 2) return null;
    const current = sparklineData[sparklineData.length - 1]?.value ?? 0;
    const previous = sparklineData[sparklineData.length - 2]?.value ?? 0;

    if (previous === 0) {
      if (current === 0) return { text: "0.0%", direction: "flat" as const };
      return { text: "↑100%", direction: "up" as const };
    }

    const diff = current - previous;
    const pct = (diff / previous) * 100;
    if (pct > 0) {
      const formatted = Number.isInteger(pct) ? pct.toString() : pct.toFixed(1);
      return { text: `↑${formatted}%`, direction: "up" as const };
    }
    if (pct < 0) {
      const abs = Math.abs(pct);
      const formatted = Number.isInteger(abs) ? abs.toString() : abs.toFixed(1);
      return { text: `↓${formatted}%`, direction: "down" as const };
    }
    return { text: "0.0%", direction: "flat" as const };
  }, [changeText, sparklineData]);

  // Pure HEX styles for change badge (green for up, red for down, neutral slate for flat)
  const badgeStyle = useMemo(() => {
    if (!change) return null;
    if (change.direction === "up") {
      return {
        color: "#10b981", // Emerald green HEX
        backgroundColor: "#ecfdf5", // Soft green HEX
        borderColor: "rgba(16, 185, 129, 0.25)",
      };
    }
    if (change.direction === "down") {
      return {
        color: "#ef4444", // Red HEX
        backgroundColor: "#fef2f2", // Soft red HEX
        borderColor: "rgba(239, 68, 68, 0.25)",
      };
    }
    return {
      color: "#64748b", // Slate HEX
      backgroundColor: "#f8fafc", // Soft slate HEX
      borderColor: "#e2e8f0",
    };
  }, [change]);

  return (
    <div className={styles.card}>
      {/* Top row: label + percentage badge + icon box */}
      <div className={styles.header}>
        <div className={styles.labelGroup}>
          <span className={styles.label}>{label}</span>
          {change && badgeStyle && (
            <span
              className={styles.changeBadge}
              style={{
                color: badgeStyle.color,
                backgroundColor: badgeStyle.backgroundColor,
                borderColor: badgeStyle.borderColor,
              }}
              title="Perubahan dibanding periode sebelumnya"
            >
              {change.text}
            </span>
          )}
        </div>

        <div className={`${styles.iconBox} ${styles[`iconBox_${color}`]}`}>
          <ResolvedIcon
            size={20}
            strokeWidth={2.5}
            className={styles.icon}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Stat number */}
      <p className={styles.value} aria-label={`${label}: ${value}`}>
        {value.toLocaleString("id-ID")}
      </p>

      {/* Sparkline trend below main stat number */}
      {sparklineData && sparklineData.length > 0 && (
        <div className={styles.sparklineContainer}>
          {variant === "bar" ? (
            <BarSparkline
              data={sparklineData}
              dataKey="value"
              color={resolvedColor}
              height={26}
              barGap={3}
              barRadius={2}
            />
          ) : (
            <LineSparkline
              data={sparklineData}
              dataKey="value"
              color={resolvedColor}
              height={26}
              curve="monotone"
              strokeWidth={2}
              endDot={true}
              crosshair="dashed"
              dot={true}
            />
          )}
        </div>
      )}

      {/* Caption */}
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}

export default KpiCard;
