import { ReactNode } from "react";
import styles from "./FinanceKpiCard.module.css";
import { formatIDR } from "@/lib/finance/format";

interface FinanceKpiCardProps {
  label: string;
  amount: number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  variant?: "positive" | "negative" | "neutral" | "default";
  subtitle?: string;
}

export function FinanceKpiCard({
  label,
  amount,
  icon,
  iconBgColor = "var(--color-primary-soft)",
  iconColor = "var(--color-primary)",
  variant = "default",
  subtitle,
}: FinanceKpiCardProps) {
  const valueColorClass =
    variant === "positive"
      ? styles.positive
      : variant === "negative"
      ? styles.negative
      : variant === "neutral"
      ? styles.neutral
      : "";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div
          className={styles.iconWrapper}
          style={{ backgroundColor: iconBgColor, color: iconColor }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <div className={styles.valueContainer}>
        <span className={`${styles.value} ${valueColorClass}`}>
          {formatIDR(amount)}
        </span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}
