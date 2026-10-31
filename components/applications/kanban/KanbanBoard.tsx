"use client";

import React, { useState, useMemo, useRef } from "react";
import { Application } from "@/types/application";
import { formatStatus } from "@/lib/applications/format";
import { KanbanColumn } from "./KanbanColumn";
import styles from "./Kanban.module.css";

export interface KanbanBoardProps {
  applications: Application[];
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

/**
 * Robust status matcher ensuring all applications find the correct Kanban column
 */
function findMatchingColumn(appStatus: string, columns: ColumnDef[]): ColumnDef | undefined {
  const norm = (appStatus || "").trim().toLowerCase();

  // 1. Direct status key match
  const direct = columns.find((c) => c.status.toLowerCase() === norm);
  if (direct) return direct;

  // 2. Direct title match (e.g. "Offering Received" matches title of Offering)
  const byTitle = columns.find((c) => c.title.toLowerCase() === norm);
  if (byTitle) return byTitle;

  // 3. Synonym / grouping matching
  if (norm === "offering received" || norm.includes("offer")) {
    return columns.find((c) => c.status.toLowerCase() === "offering");
  }
  if (norm.includes("reject") || norm.includes("tolak")) {
    return columns.find((c) => c.status.toLowerCase() === "rejected");
  }
  if (norm === "interview" || norm.includes("interview hr") || norm.includes("hr interview") || norm.includes("lgd") || norm.includes("fgd")) {
    return columns.find((c) => c.status.toLowerCase() === "interview hr");
  }
  if (norm.includes("interview user") || norm.includes("user interview") || norm.includes("final")) {
    return columns.find((c) => c.status.toLowerCase() === "interview user");
  }
  if (norm === "test & task" || norm.includes("assessment") || norm.includes("test")) {
    return columns.find((c) => c.status.toLowerCase() === "test");
  }
  if (norm.includes("task") || norm.includes("tugas")) {
    return columns.find((c) => c.status.toLowerCase() === "task");
  }
  if (norm.includes("submit") || norm.includes("applied") || !norm) {
    return columns.find((c) => c.status.toLowerCase() === "submitted");
  }

  return undefined;
}

export function KanbanBoard({
  applications,
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
        const matched = findMatchingColumn(app.status, cols);
        if (!matched && !extraStatuses.includes(app.status)) {
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

  // Group applications by status using robust column matcher
  const groupedApplications = useMemo(() => {
    const map: Record<string, Application[]> = {};
    columns.forEach((c) => {
      map[c.status] = [];
    });

    applications.forEach((app) => {
      const matchCol = findMatchingColumn(app.status, columns);
      if (matchCol && map[matchCol.status]) {
        map[matchCol.status].push(app);
      } else {
        // Fallback to Submitted so no card is ever lost
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

  const handleDrop = async (
    _e: React.DragEvent<HTMLDivElement>,
    targetStatus: string
  ) => {
    const appId = draggedAppIdRef.current;
    if (!appId) return;

    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    if (targetApp.status.toLowerCase() === targetStatus.toLowerCase()) {
      return;
    }

    // Set updating state
    setUpdatingAppIds((prev) => new Set(prev).add(appId));

    try {
      await onStatusChange(appId, targetStatus);
    } finally {
      setUpdatingAppIds((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
      draggedAppIdRef.current = null;
    }
  };

  const handleMoveStatus = async (
    app: Application,
    targetStatus: string
  ) => {
    if (app.status.toLowerCase() === targetStatus.toLowerCase()) return;

    setUpdatingAppIds((prev) => new Set(prev).add(app.id));
    try {
      await onStatusChange(app.id, targetStatus);
    } finally {
      setUpdatingAppIds((prev) => {
        const next = new Set(prev);
        next.delete(app.id);
        return next;
      });
    }
  };

  const availableColumns = useMemo(
    () => columns.map((c) => ({ status: c.status, title: c.title })),
    [columns]
  );

  return (
    <div
      className={styles.kanbanContainer}
      role="region"
      aria-label="Kanban Pelacakan Lamaran Kerja"
    >
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          id={col.id}
          status={col.status}
          title={col.title}
          badgeColor={col.badgeColor}
          badgeBg={col.badgeBg}
          applications={groupedApplications[col.status] || []}
          updatingAppIds={updatingAppIds}
          availableColumns={availableColumns}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveStatus={handleMoveStatus}
        />
      ))}
    </div>
  );
}
