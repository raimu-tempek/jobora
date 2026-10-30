"use client";

import React from "react";
import { RecruitmentEvent } from "@/types/recruitment";
import { Application } from "@/types/application";
import styles from "./Calendar.module.css";

export interface EventDetailModalProps {
  isOpen: boolean;
  event: RecruitmentEvent | null;
  applications: Application[];
  onClose: () => void;
  onEdit: (event: RecruitmentEvent) => void;
  onDelete: (event: RecruitmentEvent) => void;
  onToggleComplete: (event: RecruitmentEvent) => void;
  onOpenApplicationDetail?: (app: Application) => void;
}

export function EventDetailModal({
  isOpen,
  event,
  applications,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onOpenApplicationDetail,
}: EventDetailModalProps) {
  if (!isOpen || !event) return null;

  const linkedApp = event.application_id
    ? applications.find((a) => a.id === event.application_id)
    : null;

  const formatDateTimeRange = (start: string, end?: string | null, isAllDay?: boolean) => {
    try {
      const s = new Date(start);
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const dateStr = `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;

      if (isAllDay) {
        return `${dateStr} (Sepanjang hari)`;
      }

      const startTimeStr = `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;

      if (end) {
        const e = new Date(end);
        const endTimeStr = `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
        return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
      }

      return `${dateStr}, ${startTimeStr}`;
    } catch {
      return start;
    }
  };

  const isUrl = (text?: string | null) => {
    if (!text) return false;
    return text.startsWith("http://") || text.startsWith("https://");
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-teal-600 text-[22px]`}
              aria-hidden="true"
            >
              event
            </span>
            <h3 id="event-detail-title" className={styles.modalTitle}>
              Detail Jadwal
            </h3>
          </div>
          <button
            type="button"
            className={styles.navBtn}
            onClick={onClose}
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Status banner */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {event.event_type}
            </span>

            {event.is_completed ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Selesai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Mendatang
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-snug">
              {event.title}
            </h2>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-2.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="material-symbols-outlined text-gray-500 text-[18px]">
              calendar_month
            </span>
            <div>
              <span className="font-semibold block text-gray-900">Waktu Pelaksanaan</span>
              <span>{formatDateTimeRange(event.start_time, event.end_time, event.is_all_day)}</span>
            </div>
          </div>

          {/* Linked Application */}
          {linkedApp && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-100">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-teal-700 text-[18px]">
                  business_center
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                    Lamaran Terkait
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {linkedApp.company}
                  </span>
                  <span className="text-xs text-gray-600 block">
                    {linkedApp.position}
                  </span>
                </div>
              </div>

              {onOpenApplicationDetail && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApplicationDetail(linkedApp);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-50 transition-colors shadow-xs"
                >
                  Lihat Lamaran →
                </button>
              )}
            </div>
          )}

          {/* Location / Meeting link */}
          {event.location && (
            <div className="flex items-start gap-2.5 text-xs text-gray-700 p-2.5 rounded-xl border border-gray-100">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">
                {isUrl(event.location) ? "videocam" : "location_on"}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-semibold block text-gray-900">
                  {isUrl(event.location) ? "Tautan Pertemuan" : "Lokasi"}
                </span>
                {isUrl(event.location) ? (
                  <a
                    href={event.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 font-semibold underline truncate block hover:text-teal-900"
                  >
                    {event.location}
                  </a>
                ) : (
                  <span>{event.location}</span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div className="flex items-start gap-2.5 text-xs text-gray-700 p-2.5 rounded-xl border border-gray-100">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">
                description
              </span>
              <div>
                <span className="font-semibold block text-gray-900">Catatan</span>
                <p className="whitespace-pre-wrap text-gray-600 mt-0.5">
                  {event.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                event.is_completed
                  ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
              }`}
              onClick={() => onToggleComplete(event)}
            >
              {event.is_completed ? "Tandai Belum Selesai" : "✓ Tandai Selesai"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 text-xs font-semibold"
              onClick={() => onEdit(event)}
              title="Edit Event"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>

            <button
              type="button"
              className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-semibold"
              onClick={() => onDelete(event)}
              title="Hapus Event"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
