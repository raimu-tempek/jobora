"use client";

import React, { useState, useRef, useEffect } from "react";
import { Application } from "@/types/application";
import { formatDate, formatStatus, isStatusActive } from "@/lib/applications/format";
import { isFollowUp } from "@/lib/applications/reminders";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import styles from "./Kanban.module.css";

export interface KanbanCardProps {
  app: Application;
  isUpdating?: boolean;
  availableColumns: { status: string; title: string }[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appId: string) => void;
  onDragEnd: () => void;
  onViewDetail?: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onMoveStatus: (app: Application, targetStatus: string) => void;
}

function resolvePlatformIcon(platform?: string): string {
  const norm = (platform || "").toLowerCase();
  if (norm.includes("linkedin")) return "share";
  if (norm.includes("kalibrr")) return "public";
  if (norm.includes("jobstreet")) return "work_history";
  if (norm.includes("glints")) return "handshake";
  if (norm.includes("career portal") || norm.includes("portal")) return "domain";
  return "public";
}

export function KanbanCard({
  app,
  isUpdating,
  availableColumns,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onMoveStatus,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dragOccurredRef = useRef(false);
  const needsFollowUp = isFollowUp(app);
  const platformIcon = resolvePlatformIcon(app.platform);

  // Close popup or menu on Escape
  useEffect(() => {
    if (!isStatusPickerOpen && !isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsStatusPickerOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStatusPickerOpen, isMenuOpen]);

  const handleCardClick = () => {
    if (dragOccurredRef.current || isUpdating) return;
    setIsStatusPickerOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isUpdating || isStatusPickerOpen || isMenuOpen) {
      e.preventDefault();
      return;
    }
    dragOccurredRef.current = true;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", app.id);
    onDragStart(e, app.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
    setTimeout(() => {
      dragOccurredRef.current = false;
    }, 150);
  };

  return (
    <div
      draggable={!isUpdating && !isStatusPickerOpen && !isMenuOpen}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ""} ${
        isUpdating ? styles.cardUpdating : ""
      }`}
      role="article"
      aria-label={`${app.position || "Posisi"} di ${app.company || "Perusahaan"}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        } else if (e.key === "Escape") {
          setIsStatusPickerOpen(false);
          setIsMenuOpen(false);
        }
      }}
    >
      {isUpdating && (
        <div className={styles.savingOverlay}>
          <div className={styles.spinner} />
          <span>Menyimpan...</span>
        </div>
      )}

      {/* Quick Status Picker Popup */}
      {isStatusPickerOpen && (
        <>
          <div
            className={styles.pickerBackdrop}
            onClick={(e) => {
              e.stopPropagation();
              setIsStatusPickerOpen(false);
            }}
          />
          <div
            className={styles.statusPickerPopup}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Pilih status lamaran"
          >
            <div className={styles.statusPickerHeader}>
              <span className={styles.statusPickerTitle}>Pilih Status</span>
              <button
                type="button"
                className={styles.statusPickerCloseBtn}
                title="Tutup"
                aria-label="Tutup pilihan status"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStatusPickerOpen(false);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  close
                </span>
              </button>
            </div>

            <div className={styles.statusPickerList} role="listbox">
              {availableColumns.map((col) => {
                const active = isStatusActive(col.status, app.status);
                return (
                  <button
                    key={col.status}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`${styles.statusOptionItem} ${
                      active ? styles.statusOptionActive : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!active) {
                        onMoveStatus(app, col.status);
                      }
                      setIsStatusPickerOpen(false);
                    }}
                  >
                    <span className={styles.statusOptionText}>{col.title}</span>
                    {active && (
                      <span
                        className={`material-symbols-outlined ${styles.statusActiveCheck}`}
                        aria-hidden="true"
                      >
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 1. Header: Company & Position (Multi-line wrap, max 2 lines with line-clamp) */}
      <div className={styles.cardHeader}>
        <h4 className={`${styles.companyTitle} line-clamp-2`} title={app.company}>
          {app.company || "Tanpa Perusahaan"}
        </h4>
        <p className={`${styles.positionTitle} line-clamp-2`} title={app.position}>
          {app.position || "Tanpa Posisi"}
        </p>
      </div>

      {/* 2. Badges Row: Status Badge & Job Type Badge */}
      <div className={styles.badgesRow}>
        <div className={styles.statusBadgeWrapper}>
          <StatusBadge status={app.status} />
        </div>
        {app.type && (
          <span className={styles.typeBadge} title={`Tipe: ${app.type}`}>
            {app.type}
          </span>
        )}
      </div>

      {/* 3. Meta Row: Applied Date, Follow-up indicator, Platform */}
      <div className={styles.metaRow}>
        <span className={styles.dateText}>
          {needsFollowUp && (
            <span
              className={styles.followUpDot}
              title="Perlu follow-up (lebih dari 7 hari tanpa respon)"
            />
          )}
          <span
            className={`material-symbols-outlined ${styles.calendarIcon}`}
            aria-hidden="true"
          >
            calendar_today
          </span>
          <span>{formatDate(app.date)}</span>
        </span>

        {app.platform && (
          <span className={styles.platformBadge} title={app.platform}>
            <span
              className={`material-symbols-outlined ${styles.platformIcon}`}
              aria-hidden="true"
            >
              {platformIcon}
            </span>
            <span>{app.platform}</span>
          </span>
        )}
      </div>

      {/* 4. Footer: Quick status switcher & action menu (...) */}
      <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.footerStatusBtn}
          title="Klik untuk ubah status"
          aria-label={`Ubah status ${app.company}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsStatusPickerOpen((prev) => !prev);
            setIsMenuOpen(false);
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 12, color: "var(--color-primary, #107c74)" }}
            aria-hidden="true"
          >
            swap_horiz
          </span>
          <span className={styles.footerStatusText}>{formatStatus(app.status)}</span>
        </button>

        <div className={styles.moreMenuContainer}>
          <button
            type="button"
            className={`${styles.actionBtn} ${isMenuOpen ? styles.actionBtnActive : ""}`}
            title="Menu opsi lamaran"
            aria-label={`Menu opsi untuk ${app.company}`}
            aria-expanded={isMenuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
              setIsStatusPickerOpen(false);
            }}
          >
            <span
              className={`material-symbols-outlined ${styles.actionBtnIcon}`}
              aria-hidden="true"
            >
              more_horiz
            </span>
          </button>

          {isMenuOpen && (
            <>
              <div
                className={styles.menuBackdrop}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <div
                className={styles.actionMenuDropdown}
                onClick={(e) => e.stopPropagation()}
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className={styles.actionMenuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onEdit(app);
                  }}
                >
                  <span
                    className={`material-symbols-outlined ${styles.actionMenuIcon}`}
                    aria-hidden="true"
                  >
                    edit
                  </span>
                  <span>Edit Detail</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDelete(app);
                  }}
                >
                  <span
                    className={`material-symbols-outlined ${styles.actionMenuIcon}`}
                    aria-hidden="true"
                  >
                    delete
                  </span>
                  <span>Hapus</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
