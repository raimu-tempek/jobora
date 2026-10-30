"use client";

import React, { useState } from "react";
import { Application } from "@/types/application";
import { RecruitmentEvent } from "@/types/recruitment";
import { formatDate } from "@/lib/applications/format";
import { isFollowUp } from "@/lib/applications/reminders";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import styles from "./Kanban.module.css";

export interface KanbanCardProps {
  app: Application;
  nearestEvent?: RecruitmentEvent | null;
  isUpdating?: boolean;
  availableColumns: { status: string; title: string }[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appId: string) => void;
  onDragEnd: () => void;
  onViewDetail: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onMoveStatus: (app: Application, targetStatus: string) => void;
}

function resolvePlatformIcon(platform: string): string {
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
  nearestEvent,
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

  const formatEventSummary = (evt: RecruitmentEvent) => {
    try {
      const d = new Date(evt.start_time);
      const timeStr = evt.is_all_day
        ? "Sepanjang hari"
        : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const dateStr = `${day} ${months[d.getMonth()]}`;
      return `${evt.event_type} • ${dateStr} ${timeStr}`;
    } catch {
      return evt.title;
    }
  };

  const isDeadlineEvent =
    nearestEvent?.event_type.toLowerCase().includes("deadline") || false;

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

      {/* Header: Company & Position */}
      <div className={styles.cardHeader}>
        <div>
          <h4 className={styles.companyTitle}>{app.company}</h4>
          <p className={styles.positionTitle}>{app.position}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Meta tags */}
      <div className={styles.metaRow}>
        <span className={styles.typeBadge}>{app.type}</span>
        <span className={styles.platformBadge}>
          <span className={`material-symbols-outlined ${styles.platformIcon}`} aria-hidden="true">
            {platformIcon}
          </span>
          {app.platform || "Tidak dicatat"}
        </span>
        {needsFollowUp && (
          <span className={styles.followUpBadge} title="Belum ada progres lebih dari 7 hari">
            <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
              schedule
            </span>
            Follow-up
          </span>
        )}
      </div>

      {/* Nearest Event / Recruitment schedule if exists */}
      {nearestEvent && (
        <div
          className={`${styles.scheduleBox} ${
            isDeadlineEvent ? styles.scheduleBoxDeadline : ""
          }`}
          title={nearestEvent.title}
        >
          <span
            className={`material-symbols-outlined ${styles.scheduleIcon}`}
            aria-hidden="true"
          >
            {isDeadlineEvent ? "warning" : "event"}
          </span>
          <span className={styles.scheduleText}>
            {formatEventSummary(nearestEvent)}
          </span>
        </div>
      )}

      {/* Date Applied */}
      <div className={styles.dateRow}>
        <span className={styles.dateText}>
          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
            calendar_today
          </span>
          {formatDate(app.date)}
        </span>

        {/* Keyboard accessible column changer */}
        <select
          className={styles.moveSelect}
          value={app.status}
          onChange={(e) => onMoveStatus(app, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Ubah status ${app.company}`}
        >
          {availableColumns.map((col) => (
            <option key={col.status} value={col.status}>
              → {col.title}
            </option>
          ))}
        </select>
      </div>

      {/* Footer Actions */}
      <div className={styles.cardFooter}>
        <button
          type="button"
          className={styles.actionBtn}
          title="Lihat Detail & Riwayat Status"
          aria-label={`Lihat detail ${app.company}`}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(app);
          }}
        >
          <span className={`material-symbols-outlined ${styles.actionBtnIcon}`} aria-hidden="true">
            visibility
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className={styles.actionBtn}
            title="Edit Lamaran"
            aria-label={`Edit ${app.company}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(app);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete(app);
            }}
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
