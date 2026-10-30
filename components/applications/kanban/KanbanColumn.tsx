"use client";

import React, { useState } from "react";
import { Application } from "@/types/application";
import { RecruitmentEvent } from "@/types/recruitment";
import { KanbanCard } from "./KanbanCard";
import styles from "./Kanban.module.css";

export interface KanbanColumnProps {
  id: string;
  status: string;
  title: string;
  badgeColor: string;
  badgeBg: string;
  applications: Application[];
  nearestEventsMap: Record<string, RecruitmentEvent | null>;
  updatingAppIds: Set<string>;
  availableColumns: { status: string; title: string }[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appId: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => void;
  onViewDetail: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onMoveStatus: (app: Application, targetStatus: string) => void;
}

export function KanbanColumn({
  status,
  title,
  badgeColor,
  applications,
  nearestEventsMap,
  updatingAppIds,
  availableColumns,
  onDragStart,
  onDragEnd,
  onDrop,
  onViewDetail,
  onEdit,
  onDelete,
  onMoveStatus,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOver) {
      setIsOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent flickering when hovering over children
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, status);
  };

  return (
    <div
      className={`${styles.column} ${isOver ? styles.columnDragOver : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label={`Kolom ${title}`}
    >
      {/* Column Header */}
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleGroup}>
          <span
            className={styles.statusDot}
            style={{ backgroundColor: badgeColor }}
            aria-hidden="true"
          />
          <h3 className={styles.columnTitle}>{title}</h3>
        </div>
        <span className={styles.columnCount} aria-label={`${applications.length} lamaran`}>
          {applications.length}
        </span>
      </div>

      {/* Cards list */}
      <div className={styles.cardList}>
        {applications.length === 0 ? (
          <div className={styles.emptyState}>
            <span
              className={`material-symbols-outlined ${styles.emptyIcon}`}
              aria-hidden="true"
            >
              inbox
            </span>
            <p className={styles.emptyText}>Tidak ada lamaran</p>
            <p className={styles.emptyHint}>Tarik kartu ke kolom ini</p>
          </div>
        ) : (
          applications.map((app) => (
            <KanbanCard
              key={app.id}
              app={app}
              nearestEvent={nearestEventsMap[app.id]}
              isUpdating={updatingAppIds.has(app.id)}
              availableColumns={availableColumns}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveStatus={onMoveStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
