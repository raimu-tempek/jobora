"use client";

import React, { useState } from "react";
import { Application } from "@/types/application";
import { KanbanCard } from "./KanbanCard";
import styles from "./Kanban.module.css";

export interface KanbanColumnProps {
  id: string;
  status: string;
  title: string;
  badgeColor: string;
  badgeBg: string;
  applications: Application[];
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
      {/* Column Header: Title & Radar Dot Centered Horizontally */}
      <div className={styles.columnHeader}>
        <div
          className={styles.columnTitleGroup}
          style={{ "--indicator-color": badgeColor } as React.CSSProperties}
        >
          <div className={styles.radarWrapper} aria-hidden="true">
            <span className={styles.radarWave} />
            <span
              className={styles.statusDot}
              style={{ backgroundColor: badgeColor }}
            />
          </div>
          <h3 className={styles.columnTitle} title={title}>
            {title}
          </h3>
        </div>

        <span
          className={styles.columnCount}
          aria-label={`${applications.length} lamaran`}
        >
          {applications.length}
        </span>
      </div>

      {/* Cards list: 2-column grid inside all columns */}
      <div className={styles.cardList}>
        {applications.length === 0 ? (
          <div className={styles.emptyState}>
            <span
              className={`material-symbols-outlined ${styles.emptyIcon}`}
              aria-hidden="true"
            >
              inbox
            </span>
            <span>Belum ada lamaran</span>
          </div>
        ) : (
          applications.map((app) => (
            <KanbanCard
              key={app.id}
              app={app}
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
