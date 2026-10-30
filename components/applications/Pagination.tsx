"use client";

import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.container}>
      <span className={styles.infoText}>
        Menampilkan {start}-{end} dari {totalItems} lamaran
      </span>

      <div className={styles.controls} role="navigation" aria-label="Navigasi halaman">
        {/* Previous page button */}
        <button
          type="button"
          className={styles.chevronButton}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman sebelumnya"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            chevron_left
          </span>
        </button>

        {/* Numbered page buttons */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              className={`${styles.pageButton} ${
                isActive ? styles.pageButtonActive : styles.pageButtonInactive
              }`}
              onClick={() => onPageChange(p)}
              aria-current={isActive ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next page button */}
        <button
          type="button"
          className={styles.chevronButton}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman selanjutnya"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
