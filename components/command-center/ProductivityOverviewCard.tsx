"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { RecruitmentEvent } from "@/types/recruitment";
import { Application } from "@/types/application";
import { getFollowUps } from "@/lib/applications/reminders";
import {
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import styles from "./CommandCenter.module.css";

export interface ProductivityOverviewCardProps {
  events: RecruitmentEvent[];
  applications: Application[];
}

export function ProductivityOverviewCard({
  events,
  applications,
}: ProductivityOverviewCardProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Events today
  const todayEvents = useMemo(
    () =>
      events.filter(
        (e) => !e.is_completed && e.start_time.split("T")[0] === todayStr
      ),
    [events, todayStr]
  );

  // Deadlines in next 7 days
  const upcomingDeadlines = useMemo(() => {
    const now = Date.now();
    const next7Days = now + 7 * 24 * 60 * 60 * 1000;
    return events.filter((e) => {
      if (e.is_completed) return false;
      const isDeadline =
        e.event_type.toLowerCase().includes("deadline") ||
        e.title.toLowerCase().includes("deadline");
      const eventTime = new Date(e.start_time).getTime();
      return isDeadline && eventTime >= now - 3600000 && eventTime <= next7Days;
    });
  }, [events]);

  // Follow-up reminders
  const followUpApps = useMemo(() => getFollowUps(applications), [applications]);

  const appsById = useMemo(() => {
    const map: Record<string, Application> = {};
    applications.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [applications]);

  return (
    <div className={styles.sectionCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>
            <CalendarDays size={18} className="text-purple-700" />
            <span>Produktivitas & Jadwal</span>
          </h3>
          <p className={styles.cardSubtitle}>
            Agenda aktif, tenggat waktu assessment, dan komitmen jadwal Anda
          </p>
        </div>

        <Link href="/applications?view=calendar" className={styles.linkBtn}>
          <span>Buka Kalender</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 3 Productivity Badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
            Hari Ini
          </span>
          <span className="text-lg font-bold text-purple-900 mt-0.5">
            {todayEvents.length}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
            Deadline
          </span>
          <span className="text-lg font-bold text-rose-900 mt-0.5">
            {upcomingDeadlines.length}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            Follow-up
          </span>
          <span className="text-lg font-bold text-amber-900 mt-0.5">
            {followUpApps.length}
          </span>
        </div>
      </div>

      {/* Action items list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>Komitmen & Tindak Lanjut</span>
          <span className="text-gray-400 font-normal text-[11px]">
            Real-time tracking
          </span>
        </div>

        {todayEvents.length === 0 &&
        upcomingDeadlines.length === 0 &&
        followUpApps.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={22} className="text-emerald-500" />
            <p className={styles.emptyStateTitle}>Semua jadwal dan komitmen terkendali</p>
            <p className={styles.emptyStateText}>
              Tidak ada deadline mendesak atau tindak lanjut yang tertunda hari ini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Today's Events */}
            {todayEvents.map((e) => (
              <div
                key={e.id}
                className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <div>
                    <span className="font-bold text-gray-900">{e.title}</span>
                    <span className="text-[11px] text-gray-600 block">
                      Hari ini • {e.is_all_day ? "Sepanjang hari" : e.start_time.split("T")[1]?.slice(0, 5)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/applications?view=calendar"
                  className="text-purple-700 font-semibold text-[11px] hover:underline"
                >
                  Detail →
                </Link>
              </div>
            ))}

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.map((d) => (
              <div
                key={d.id}
                className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-rose-900">{d.title}</span>
                    <span className="text-[11px] text-rose-700 block">
                      Deadline: {d.start_time.split("T")[0]}
                    </span>
                  </div>
                </div>
                <Link
                  href="/applications?view=calendar"
                  className="text-rose-700 font-semibold text-[11px] hover:underline"
                >
                  Buka →
                </Link>
              </div>
            ))}

            {/* Follow-up reminder items */}
            {followUpApps.slice(0, 2).map((app) => (
              <div
                key={app.id}
                className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900">
                      Follow-up: {app.company}
                    </span>
                    <span className="text-[11px] text-amber-700 block">
                      {app.position} • Belum ada update {">"} 7 hari
                    </span>
                  </div>
                </div>
                <Link
                  href="/applications"
                  className="text-amber-700 font-semibold text-[11px] hover:underline"
                >
                  Cek →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note about Task Management in Phase 2 */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span>Modul Tugas & Goals: Tersedia pada Fase 2</span>
        <Link
          href="/applications?view=calendar"
          className="text-teal-700 font-semibold hover:underline"
        >
          Lihat Kalender Lengkap →
        </Link>
      </div>
    </div>
  );
}
