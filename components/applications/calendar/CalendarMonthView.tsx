"use client";

import React from "react";
import { RecruitmentEvent } from "@/types/recruitment";
import styles from "./Calendar.module.css";

export interface CalendarMonthViewProps {
  currentDate: Date;
  events: RecruitmentEvent[];
  onDateClick: (dateStr: string) => void;
  onEventClick: (event: RecruitmentEvent) => void;
}

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function getEventTypeClass(type: string): string {
  const norm = (type || "").toLowerCase();
  if (norm.includes("interview") || norm.includes("wawancara")) {
    return styles.eventInterview;
  }
  if (norm.includes("deadline") || norm.includes("assessment") || norm.includes("task")) {
    return styles.eventDeadline;
  }
  if (norm.includes("follow-up") || norm.includes("reminder")) {
    return styles.eventFollowUp;
  }
  return styles.eventOther;
}

export function CalendarMonthView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: CalendarMonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toISOString().split("T")[0];

  // 1st day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat
  // We want Monday = 0 ... Sunday = 6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Calendar start: Monday before or on firstDayOfMonth
  const calendarStart = new Date(year, month, 1 - startDayOfWeek);

  // Generate 35 or 42 days grid
  const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];
  const current = new Date(calendarStart);

  while (
    days.length < 35 ||
    (days.length < 42 && current <= lastDayOfMonth) ||
    current.getDay() !== 1 // Ensure finishing on Sunday
  ) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    days.push({
      date: new Date(current),
      dateStr,
      isCurrentMonth: current.getMonth() === month,
    });

    current.setDate(current.getDate() + 1);

    if (days.length >= 42) break;
  }

  // Pre-index events by YYYY-MM-DD
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, RecruitmentEvent[]> = {};
    for (const evt of events) {
      if (!evt.start_time) continue;
      const d = evt.start_time.split("T")[0];
      if (!map[d]) {
        map[d] = [];
      }
      map[d].push(evt);
    }
    return map;
  }, [events]);

  return (
    <div className={styles.monthGrid} role="grid" aria-label="Kalender Bulanan">
      {/* Day of Week Headers */}
      {DAY_NAMES.map((name) => (
        <div key={name} className={styles.dayHeader}>
          {name}
        </div>
      ))}

      {/* Grid cells */}
      {days.map(({ date, dateStr, isCurrentMonth }) => {
        const isToday = dateStr === todayStr;
        const dayEvents = eventsByDate[dateStr] || [];

        return (
          <div
            key={dateStr}
            className={`${styles.dateCell} ${
              !isCurrentMonth ? styles.dateCellMuted : ""
            } ${isToday ? styles.dateCellToday : ""}`}
            onClick={() => onDateClick(dateStr)}
            role="gridcell"
            aria-label={`${dateStr}, ${dayEvents.length} event`}
          >
            <div className={styles.dateNumberRow}>
              <span
                className={`${styles.dateNumber} ${
                  isToday ? styles.dateNumberToday : ""
                }`}
              >
                {date.getDate()}
              </span>
              <span
                className={`material-symbols-outlined ${styles.addDateIcon}`}
                title="Tambah jadwal pada tanggal ini"
              >
                add
              </span>
            </div>

            <div className={styles.eventListInCell}>
              {dayEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className={`${styles.eventPill} ${getEventTypeClass(
                    evt.event_type
                  )} ${evt.is_completed ? styles.eventCompleted : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(evt);
                  }}
                  title={`${evt.event_type}: ${evt.title}`}
                >
                  <span className="truncate">
                    {evt.is_completed ? "✓ " : ""}
                    {evt.title}
                  </span>
                </div>
              ))}

              {dayEvents.length > 3 && (
                <div className="text-[10px] font-semibold text-gray-500 pl-1">
                  +{dayEvents.length - 3} lainnya
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
