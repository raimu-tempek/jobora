"use client";

import { Select } from "@/components/ui/select";
import styles from "./TableToolbar.module.css";

export interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onExport?: () => void;
}

export function TableToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onExport,
}: TableToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.leftControls}>
        {/* Search input */}
        <div className={styles.searchWrapper}>
          <span
            className={`material-symbols-outlined ${styles.searchIcon}`}
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            placeholder="Cari perusahaan, posisi..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status filter dropdown */}
        <div className="min-w-[155px]">
          <Select
            value={statusFilter}
            onChange={(val) => onStatusFilterChange(val)}
            aria-label="Filter status"
            size="sm"
            options={[
              { value: "Semua Status", label: "Semua Status" },
              { value: "Submitted", label: "Submitted" },
              { value: "Test & Task", label: "Test & Task" },
              { value: "Interview HR", label: "Interview HR" },
              { value: "Interview User", label: "Interview User" },
              { value: "Offering", label: "Offering" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />
        </div>

        {/* Sort dropdown */}
        <div className="min-w-[165px]">
          <Select
            value={sortBy}
            onChange={(val) => onSortByChange(val)}
            aria-label="Urutkan"
            size="sm"
            options={[
              { value: "Terbaru", label: "Terbaru" },
              { value: "Terlama", label: "Terlama" },
              { value: "Perusahaan (A-Z)", label: "Perusahaan (A-Z)" },
            ]}
          />
        </div>
      </div>

      {/* Right controls: export button */}
      <div className={styles.rightControls}>
        <button
          type="button"
          className={styles.exportButton}
          title="Export CSV / Excel"
          aria-label="Export data"
          onClick={onExport}
        >
          <span
            className={`material-symbols-outlined ${styles.exportIcon}`}
            aria-hidden="true"
          >
            download
          </span>
        </button>
      </div>
    </div>
  );
}

export default TableToolbar;
