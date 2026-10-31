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
      aria-label={`${app.position} di ${app.company}`}
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

      {/* Header: Company & Position (Prioritas Utama) */}
      <div className={styles.cardHeader}>
        <div className="min-w-0 flex-1">
          <h4 className={styles.companyTitle} title={app.company}>
            {app.company}
          </h4>
          <p className={styles.positionTitle} title={app.position}>
            {app.position}
          </p>
        </div>
        <div className="shrink-0 scale-90 origin-top-right">
          <StatusBadge status={app.status} />
        </div>
      </div>

      {/* Meta Row: Tanggal Melamar & Indikator Follow-up (Prioritas Utama) */}
      <div className={styles.metaRow}>
        <span className={styles.dateText}>
          {needsFollowUp && (
            <span
              className={styles.followUpDot}
              title="Perlu follow-up (lebih dari 7 hari tanpa respon)"
            />
          )}
          <span className="material-symbols-outlined text-[12px] opacity-70" aria-hidden="true">
            calendar_today
          </span>
          {formatDate(app.date)}
        </span>

        {app.type && (
          <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
            {app.type}
          </span>
        )}
      </div>

      {/* Footer Actions & Direct Status Switcher */}
      <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
        {/* Keyboard and touch accessible move dropdown */}
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

        {/* Action icons */}
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.actionBtn}
            title="Lihat Detail"
            aria-label={`Lihat detail ${app.company}`}
            onClick={() => onViewDetail(app)}
          >
            <span className={`material-symbols-outlined ${styles.actionBtnIcon}`} aria-hidden="true">
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
            <span className={`material-symbols-outlined ${styles.actionBtnIcon}`} aria-hidden="true">
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
            <span className={`material-symbols-outlined ${styles.actionBtnIcon}`} aria-hidden="true">
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
