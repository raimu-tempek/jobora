"use client";

import styles from "./FilterPills.module.css";

export interface FilterItem {
  label: string;
  count: number;
}

export interface FilterPillsProps {
  items: FilterItem[];
  active: string;
  onChange: (label: string) => void;
}

export function FilterPills({ items, active, onChange }: FilterPillsProps) {
  return (
    <div className={styles.scrollContainer} role="tablist" aria-label="Filter status lamaran">
      <div className={styles.pillList}>
        {items.map((item) => {
          const isActive = item.label.toLowerCase() === active.toLowerCase();
          return (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.pill} ${
                isActive ? styles.pillActive : styles.pillInactive
              }`}
              onClick={() => onChange(item.label)}
            >
              <span className={styles.label}>{item.label}</span>
              <span
                className={`${styles.badge} ${
                  isActive ? styles.badgeActive : styles.badgeInactive
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterPills;
