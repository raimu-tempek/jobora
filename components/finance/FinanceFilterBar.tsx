"use client";

import { DateFilter, DateFilterRange } from "@/types/finance";
import styles from "./FinanceFilterBar.module.css";
import { Calendar } from "lucide-react";

interface FinanceFilterBarProps {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
}

const RANGES: { key: DateFilterRange; label: string }[] = [
  { key: "this_month", label: "Bulan Ini" },
  { key: "last_month", label: "Bulan Lalu" },
  { key: "last_3_months", label: "3 Bulan Terakhir" },
  { key: "this_year", label: "Tahun Ini" },
  { key: "custom", label: "Kustom" },
];

export function FinanceFilterBar({ filter, onChange }: FinanceFilterBarProps) {
  const handleRangeClick = (range: DateFilterRange) => {
    onChange({ ...filter, range });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filter, range: "custom", startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filter, range: "custom", endDate: e.target.value });
  };

  return (
    <div className={styles.filterContainer} aria-label="Filter Rentang Waktu">
      <div className={styles.pillsGroup}>
        {RANGES.map((r) => {
          const isActive = filter.range === r.key;
          return (
            <button
              key={r.key}
              type="button"
              className={`${styles.pillButton} ${
                isActive ? styles.pillButtonActive : ""
              }`}
              onClick={() => handleRangeClick(r.key)}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {filter.range === "custom" && (
        <div className={styles.customDateContainer}>
          <Calendar size={16} className="text-gray-400" aria-hidden="true" />
          <input
            type="date"
            className={styles.dateInput}
            value={filter.startDate || ""}
            onChange={handleStartDateChange}
            aria-label="Tanggal Mulai"
          />
          <span className={styles.dateSeparator}>s/d</span>
          <input
            type="date"
            className={styles.dateInput}
            value={filter.endDate || ""}
            onChange={handleEndDateChange}
            aria-label="Tanggal Selesai"
          />
        </div>
      )}
    </div>
  );
}
