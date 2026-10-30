"use client";

import React from "react";
import { RecruitmentEvent } from "@/types/recruitment";
import { Application } from "@/types/application";
import styles from "./Calendar.module.css";

export interface CalendarWeekViewProps {
  currentDate: Date;
  events: RecruitmentEvent[];
  applications: Application[];
  onDateClick: (dateStr: string) => void;
  onEventClick: (event: RecruitmentEvent) => void;
}

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function CalendarWeekView({
  currentDate,
  events,
  applications,
  onDateClick,
  onEventClick,
}: CalendarWeekViewProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate Monday of the current week
  const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;
    return {
      date: d,
      dateStr,
      dayName: DAY_NAMES[i],
    };
  });

  const appsById = React.useMemo(() => {
    const map: Record<string, Application> = {};
    applications.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [applications]);

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

  const formatEventTime = (evt: RecruitmentEvent) => {
    if (evt.is_all_day) return "Sepanjang hari";
    try {
      const d = new Date(evt.start_time);
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      if (evt.end_time) {
        const e = new Date(evt.end_time);
        const endStr = `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
        return `${timeStr} - ${endStr}`;
      }
      return timeStr;
    } catch {
      return "";
    }
  };

  return (
    <div className={styles.weekContainer} role="region" aria-label="Kalender Mingguan">
      {weekDays.map(({ date, dateStr, dayName }) => {
        const isToday = dateStr === todayStr;
        const dayEvents = eventsByDate[dateStr] || [];

        return (
          <div
            key={dateStr}
            className={`${styles.weekCol} ${isToday ? "bg-teal-50/20" : ""}`}
            onClick={() => onDateClick(dateStr)}
          >
            {/* Week Header */}
            <div className={styles.weekColHeader}>
              <div className={styles.weekDayName}>{dayName}</div>
              <div
                className={`${styles.weekDayNum} ${
                  isToday ? "text-teal-700 font-extrabold" : ""
                }`}
              >
                {date.getDate()}
              </div>
            </div>

            {/* Events in Column */}
            <div className={styles.weekColBody}>
              {dayEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-gray-400">
                  <span className="text-[11px]">Tidak ada jadwal</span>
                </div>
              ) : (
                dayEvents.map((evt) => {
                  const linkedApp = evt.application_id
                    ? appsById[evt.application_id]
                    : null;

                  return (
                    <div
                      key={evt.id}
                      className={styles.weekEventCard}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evt);
                      }}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                        <span>{formatEventTime(evt)}</span>
                        {evt.is_completed && (
                          <span className="text-emerald-600 font-bold">✓</span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-bold leading-tight ${
                          evt.is_completed
                            ? "line-through text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {evt.title}
                      </span>

                      {linkedApp && (
                        <div className="text-[11px] font-semibold text-teal-800 truncate">
                          {linkedApp.company}
                        </div>
                      )}

                      <div className="mt-1">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {evt.event_type}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
