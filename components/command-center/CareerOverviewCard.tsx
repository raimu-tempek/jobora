"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Application } from "@/types/application";
import { RecruitmentEvent } from "@/types/recruitment";
import { isTestTaskGroup, isInterviewGroup } from "@/lib/applications/format";
import { Briefcase, ArrowRight, Video, Calendar, Clock } from "lucide-react";
import styles from "./CommandCenter.module.css";

export interface CareerOverviewCardProps {
  applications: Application[];
  events: RecruitmentEvent[];
}

export function CareerOverviewCard({
  applications,
  events,
}: CareerOverviewCardProps) {
  const [currentTime] = useState(() => Date.now());

  // Compute stage breakdown
  let submittedCount = 0;
  let testTaskCount = 0;
  let interviewCount = 0;
  let offeringCount = 0;
  let rejectedCount = 0;

  for (const app of applications) {
    if (app.status === "Submitted") {
      submittedCount++;
    } else if (isTestTaskGroup(app.status)) {
      testTaskCount++;
    } else if (isInterviewGroup(app.status)) {
      interviewCount++;
    } else if (app.status === "Offering" || app.status === "Offering Received") {
      offeringCount++;
    } else if (app.status === "Rejected") {
      rejectedCount++;
    }
  }

  // Filter top 2 upcoming active events
  const upcomingEvents = events
    .filter((e) => !e.is_completed && new Date(e.start_time).getTime() >= currentTime - 3600000)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 2);

  const appsById = React.useMemo(() => {
    const map: Record<string, Application> = {};
    applications.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [applications]);

  const formatEventDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return `${day} ${months[d.getMonth()]} • ${time}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.sectionCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>
            <Briefcase size={18} className="text-teal-700" />
            <span>Karier & Lamaran</span>
          </h3>
          <p className={styles.cardSubtitle}>
            Progres pencarian kerja dan tahapan rekrutmen aktif
          </p>
        </div>

        <Link href="/applications" className={styles.linkBtn}>
          <span>Buka Job Tracker</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stage Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Submitted</span>
          <span className="text-lg font-bold text-teal-900 mt-0.5">{submittedCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Test & Task</span>
          <span className="text-lg font-bold text-amber-900 mt-0.5">{testTaskCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Interview</span>
          <span className="text-lg font-bold text-purple-900 mt-0.5">{interviewCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Offering</span>
          <span className="text-lg font-bold text-emerald-900 mt-0.5">{offeringCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Rejected</span>
          <span className="text-lg font-bold text-rose-900 mt-0.5">{rejectedCount}</span>
        </div>
      </div>

      {/* Upcoming Recruitment Events */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-teal-700" />
            <span>Agenda & Interview Terdekat</span>
          </span>
          <Link
            href="/applications?view=calendar"
            className="text-teal-700 font-semibold hover:underline"
          >
            Lihat Kalender
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={22} className="text-gray-400" />
            <p className={styles.emptyStateTitle}>Tidak ada jadwal interview dalam waktu dekat</p>
            <p className={styles.emptyStateText}>
              Jadwalkan agenda interview atau deadline rekrutmen via Kalender.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((evt) => {
              const linkedApp = evt.application_id
                ? appsById[evt.application_id]
                : null;

              return (
                <div
                  key={evt.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 truncate">
                        {evt.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {evt.event_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-[11px] mt-1">
                      {linkedApp && (
                        <span className="font-semibold text-gray-700">
                          {linkedApp.company}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatEventDate(evt.start_time)}
                      </span>
                    </div>
                  </div>

                  {evt.location && evt.location.startsWith("http") && (
                    <a
                      href={evt.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-[11px] hover:bg-teal-700 transition"
                    >
                      <Video size={12} />
                      <span>Masuk</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Footnotes */}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-2 flex-wrap">
        <Link
          href="/applications?view=kanban"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          🍱 Buka Kanban Board
        </Link>
        <Link
          href="/applications?view=calendar"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          📅 Kalender Rekrutmen
        </Link>
      </div>
    </div>
  );
}
