import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Globe, Building2, HelpCircle, MoreHorizontal } from "lucide-react";
import styles from "./BreakdownBarList.module.css";

const PLATFORM_ICON_MAP: Record<string, LucideIcon> = {
  language: Globe,
  public: Globe,
  domain: Building2,
  help_outline: HelpCircle,
  more_horiz: MoreHorizontal,
};

export interface BreakdownItem {
  label: string;
  value: number;
  percentage: number;
  /** CSS color value for bar fill — use var(--status-*-text) */
  color: string;
  /** Optional icon name or Lucide icon */
  icon?: string | LucideIcon;
}

export interface BreakdownBarListProps {
  items: BreakdownItem[];
  /** 8px for Status Breakdown, 6px for Applications by Platform */
  barHeight: 8 | 6;
  /**
   * Optional footer slot rendered below the list.
   * Status Breakdown passes a "Tingkat Konversi" summary row here.
   * Applications by Platform leaves this empty (InsightCallout is Out of Scope v1
   * — see docs/ARCHITECTURE-Jobora.md "Dashboard (Tahap 5)" section, PRD "Proposal
   * Belum Disetujui" — and should not be built until explicitly approved).
   * TODO: wire InsightCallout here once PRD scope decision is made.
   */
  footer?: ReactNode;
}

export function BreakdownBarList({
  items,
  barHeight,
  footer,
}: BreakdownBarListProps) {
  return (
    <div className={styles.root}>
      <ul className={styles.list} role="list">
        {items.map((item) => {
          const ResolvedIcon: LucideIcon | null =
            typeof item.icon === "string"
              ? PLATFORM_ICON_MAP[item.icon] || Globe
              : item.icon || null;

          return (
            <li key={item.label} className={styles.item}>
              {/* Row: label + value */}
              <div className={styles.row}>
                <span className={styles.labelGroup}>
                  {ResolvedIcon && (
                    <ResolvedIcon
                      size={16}
                      strokeWidth={2.5}
                      className={styles.itemIcon}
                      aria-hidden="true"
                    />
                  )}
                  <span className={styles.label}>{item.label}</span>
                </span>
              <span className={styles.meta}>
                <span className={styles.value}>{item.value}</span>
                <span className={styles.percentage}>
                  {item.percentage.toFixed(0)}%
                </span>
              </span>
            </div>

            {/* Progress bar */}
            <div
              className={styles.track}
              style={{ height: `${barHeight}px` }}
              role="progressbar"
              aria-valuenow={item.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.label}: ${item.percentage.toFixed(0)}%`}
            >
              <div
                className={styles.fill}
                style={{
                  width: `${Math.min(100, item.percentage)}%`,
                  height: `${barHeight}px`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </li>
        );
      })}
      </ul>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}

export default BreakdownBarList;
