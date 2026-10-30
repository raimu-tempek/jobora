"use client";

import React from "react";
import { RecruitmentEvent } from "@/types/recruitment";
import { Application } from "@/types/application";
import styles from "./Calendar.module.css";

export interface CalendarListViewProps {
  events: RecruitmentEvent[];
  applications: Application[];
  onEventClick: (event: RecruitmentEvent) => void;
  onToggleComplete: (event: RecruitmentEvent) => void;
}

export function CalendarListView({
  events,
  applications,
  onEventClick,
  onToggleComplete,
}: CalendarListViewProps) {
  const appsById = React.useMemo(() => {
    const map: Record<string, Application> = {};
    applications.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [applications]);

  // Group events by: Hari Ini, Besok, Minggu Ini, Akan Datang, Selesai
  const groups = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const todayEvents: RecruitmentEvent[] = [];
    const tomorrowEvents: RecruitmentEvent[] = [];
    const thisWeekEvents: RecruitmentEvent[] = [];
    const upcomingEvents: RecruitmentEvent[] = [];
    const completedEvents: RecruitmentEvent[] = [];

    // Sort chronologically
    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    for (const evt of sorted) {
      if (evt.is_completed) {
        completedEvents.push(evt);
        continue;
      }

      const evtDate = new Date(evt.start_time);
      evtDate.setHours(0, 0, 0, 0);

      if (evtDate.getTime() === today.getTime()) {
        todayEvents.push(evt);
      } else if (evtDate.getTime() === tomorrow.getTime()) {
        tomorrowEvents.push(evt);
      } else if (evtDate > tomorrow && evtDate <= sevenDaysLater) {
        thisWeekEvents.push(evt);
      } else {
        upcomingEvents.push(evt);
      }
    }

    return [
      { title: "Hari Ini", list: todayEvents, icon: "today", badgeClass: "bg-red-50 text-red-700 border-red-200" },
      { title: "Besok", list: tomorrowEvents, icon: "event", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
      { title: "Minggu Ini", list: thisWeekEvents, icon: "date_range", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" },
      { title: "Akan Datang", list: upcomingEvents, icon: "schedule", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
      { title: "Selesai Dilaksanakan", list: completedEvents, icon: "task_alt", badgeClass: "bg-gray-100 text-gray-600 border-gray-200" },
    ].filter((g) => g.list.length > 0);
  }, [events]);

  const formatEventDate = (isoString: string, isAllDay: boolean) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      if (isAllDay) return `${dateStr} • Sepanjang hari`;
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return `${dateStr} • ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
          event_busy
        </span>
        <h4 className="text-sm font-bold text-gray-800">
          Belum Ada Jadwal Rekrutmen
        </h4>
        <p className="text-xs text-gray-500 max-w-sm mt-1">
          Jadwalkan jadwal interview, deadline assessment, atau reminder lamaran kerjamu sekarang.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer} role="feed" aria-label="Daftar Agenda Rekrutmen">
      {groups.map((group) => (
        <div key={group.title} className={styles.listGroup}>
          <h4 className={styles.listGroupHeader}>
            <span className="material-symbols-outlined text-[16px]">
              {group.icon}
            </span>
            <span>{group.title}</span>
            <span className="text-[11px] font-semibold text-gray-400">
              ({group.list.length})
            </span>
          </h4>

          {group.list.map((evt) => {
            const linkedApp = evt.application_id
              ? appsById[evt.application_id]
              : null;

            return (
              <div
                key={evt.id}
                className={styles.listItem}
                onClick={() => onEventClick(evt)}
              >
                <div className={styles.listItemLeft}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={evt.is_completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleComplete(evt);
                    }}
                    title="Tandai selesai"
                  />

                  <div className={styles.listItemMeta}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`${styles.listItemTitle} ${
                          evt.is_completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {evt.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {evt.event_type}
                      </span>
                    </div>

                    <div className={styles.listItemSubtitle}>
                      {linkedApp && (
                        <span className="font-semibold text-gray-800">
                          {linkedApp.company} ({linkedApp.position})
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatEventDate(evt.start_time, evt.is_all_day)}</span>
                      {evt.location && (
                        <>
                          <span>•</span>
                          <span className="text-gray-500 truncate max-w-xs">
                            {evt.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
