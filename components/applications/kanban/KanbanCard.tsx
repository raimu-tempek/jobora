"use client";

import React, { useState } from "react";
import { Application } from "@/types/application";
import { formatDate } from "@/lib/applications/format";
import { isFollowUp } from "@/lib/applications/reminders";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import styles from "./Kanban.module.css";

export interface KanbanCardProps {
  app: Application;
  isUpdating?: boolean;
  availableColumns: { status: string; title: string }[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appId: string) => void;
  onDragEnd: () => void;
  onViewDetail: (app: Application) => void;
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
  onViewDetail,
  onEdit,
  onDelete,
  onMoveStatus,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const needsFollowUp = isFollowUp(app);
  const platformIcon = resolvePlatformIcon(app.platform);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isUpdating) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", app.id);
    onDragStart(e, app.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      draggable={!isUpdating}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ""} ${
        isUpdating ? styles.cardUpdating : ""
      }`}
      role="article"
      aria-label={`${app.position || "Posisi"} di ${app.company || "Perusahaan"}`}
      tabIndex={0}
      onClick={() => onViewDetail(app)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onViewDetail(app);
        }
      }}
    >
      {isUpdating && (
        <div className={styles.savingOverlay}>
          <div className={styles.spinner} />
          <span>Menyimpan...</span>
        </div>
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

      {/* 4. Footer: Quick status switcher & action buttons */}
      <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
        <select
          className={styles.moveSelect}
          value={app.status}
          onChange={(e) => onMoveStatus(app, e.target.value)}
          aria-label={`Ubah status ${app.company}`}
        >
          {availableColumns.map((col) => (
            <option key={col.status} value={col.status}>
              → {col.title}
            </option>
          ))}
        </select>

        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.actionBtn}
            title="Lihat Detail"
            aria-label={`Lihat detail ${app.company}`}
            onClick={() => onViewDetail(app)}
          >
            <span
              className={`material-symbols-outlined ${styles.actionBtnIcon}`}
              aria-hidden="true"
            >
              visibility
            </span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            title="Edit Lamaran"
            aria-label={`Edit ${app.company}`}
            onClick={() => onEdit(app)}
          >
            <span
              className={`material-symbols-outlined ${styles.actionBtnIcon}`}
              aria-hidden="true"
            >
              edit
            </span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            title="Hapus Lamaran"
            aria-label={`Hapus ${app.company}`}
            onClick={() => onDelete(app)}
          >
            <span
              className={`material-symbols-outlined ${styles.actionBtnIcon}`}
              aria-hidden="true"
            >
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
