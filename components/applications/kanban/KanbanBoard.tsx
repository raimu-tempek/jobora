"use client";

import React, { useState, useMemo, useRef } from "react";
import { Application } from "@/types/application";
import { RecruitmentEvent } from "@/types/recruitment";
import { formatStatus } from "@/lib/applications/format";
import { getNearestEventForApplication } from "@/lib/applications/recruitment-service";
import { KanbanColumn } from "./KanbanColumn";
import styles from "./Kanban.module.css";

export interface KanbanBoardProps {
  applications: Application[];
  events?: RecruitmentEvent[];
  onStatusChange: (appId: string, newStatus: string) => Promise<boolean>;
  onViewDetail: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

interface ColumnDef {
  id: string;
  status: string;
  title: string;
  badgeColor: string;
  badgeBg: string;
}

const BASE_COLUMNS: ColumnDef[] = [
  {
    id: "col-submitted",
    status: "Submitted",
    title: "Submitted",
    badgeColor: "var(--status-submitted-text)",
    badgeBg: "var(--status-submitted-bg)",
  },
  {
    id: "col-test",
    status: "Test",
    title: "Technical Test",
    badgeColor: "var(--status-test-text)",
    badgeBg: "var(--status-test-bg)",
  },
  {
    id: "col-task",
    status: "Task",
    title: "Take Home Task",
    badgeColor: "var(--status-task-text)",
    badgeBg: "var(--status-task-bg)",
  },
  {
    id: "col-interview-hr",
    status: "Interview HR",
    title: "Interview HR",
    badgeColor: "var(--status-interview-text)",
    badgeBg: "var(--status-interview-bg)",
  },
  {
    id: "col-interview-user",
    status: "Interview User",
    title: "Interview User",
    badgeColor: "var(--status-interview-text)",
    badgeBg: "var(--status-interview-bg)",
  },
  {
    id: "col-offering",
    status: "Offering",
    title: "Offering Received",
    badgeColor: "var(--status-offering-text)",
    badgeBg: "var(--status-offering-bg)",
  },
  {
    id: "col-rejected",
    status: "Rejected",
    title: "Rejected",
    badgeColor: "var(--status-rejected-text)",
    badgeBg: "var(--status-rejected-bg)",
  },
];

export function KanbanBoard({
  applications,
  events = [],
  onStatusChange,
  onViewDetail,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [updatingAppIds, setUpdatingAppIds] = useState<Set<string>>(new Set());
  const draggedAppIdRef = useRef<string | null>(null);

  // Compute all columns dynamically including any custom status in applications
  const columns = useMemo(() => {
    const cols = [...BASE_COLUMNS];
    const knownStatuses = new Set(cols.map((c) => c.status.toLowerCase()));

    // Collect any distinct custom status present in the current dataset
    const extraStatuses: string[] = [];
    for (const app of applications) {
      if (app.status && !knownStatuses.has(app.status.toLowerCase())) {
        if (!extraStatuses.includes(app.status)) {
          extraStatuses.push(app.status);
        }
      }
    }

    extraStatuses.forEach((status, idx) => {
      cols.push({
        id: `col-extra-${idx}`,
        status,
        title: formatStatus(status),
        badgeColor: "var(--color-primary)",
        badgeBg: "var(--color-primary-soft)",
      });
    });

    return cols;
  }, [applications]);

  // Compute nearest event for each application
  const nearestEventsMap = useMemo(() => {
    const map: Record<string, RecruitmentEvent | null> = {};
    for (const app of applications) {
      map[app.id] = getNearestEventForApplication(events, app.id);
    }
    return map;
  }, [applications, events]);

  // Group applications by status
  const groupedApplications = useMemo(() => {
    const map: Record<string, Application[]> = {};
    columns.forEach((c) => {
      map[c.status] = [];
    });

    applications.forEach((app) => {
      const matchCol = columns.find(
        (c) => c.status.toLowerCase() === (app.status || "").toLowerCase()
      );
      if (matchCol) {
        map[matchCol.status].push(app);
      } else {
        // Fallback to Submitted
        map["Submitted"]?.push(app);
      }
    });

    return map;
  }, [applications, columns]);

  const handleDragStart = (
    _e: React.DragEvent<HTMLDivElement>,
    appId: string
  ) => {
    draggedAppIdRef.current = appId;
  };

  const handleDragEnd = () => {
    draggedAppIdRef.current = null;
  };

  const executeStatusChange = async (appId: string, targetStatus: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    if (targetApp.status === targetStatus) {
      return; // No change
    }

    if (updatingAppIds.has(appId)) {
      return; // Already updating
    }

    setUpdatingAppIds((prev) => new Set(prev).add(appId));

    try {
      await onStatusChange(appId, targetStatus);
    } finally {
      setUpdatingAppIds((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetStatus: string
  ) => {
    const appId = e.dataTransfer.getData("text/plain") || draggedAppIdRef.current;
    if (!appId) return;
    executeStatusChange(appId, targetStatus);
  };

  const availableColumns = useMemo(
    () => columns.map((c) => ({ status: c.status, title: c.title })),
    [columns]
  );

  return (
    <div
      className={styles.kanbanContainer}
      role="region"
      aria-label="Kanban Board Lamaran Kerja"
    >
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          id={column.id}
          status={column.status}
          title={column.title}
          badgeColor={column.badgeColor}
          badgeBg={column.badgeBg}
          applications={groupedApplications[column.status] || []}
          nearestEventsMap={nearestEventsMap}
          updatingAppIds={updatingAppIds}
          availableColumns={availableColumns}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveStatus={(app, targetStatus) =>
            executeStatusChange(app.id, targetStatus)
          }
        />
      ))}
    </div>
  );
}
