"use client";

import React, { useState } from "react";
import { RecruitmentEvent, RecruitmentEventType } from "@/types/recruitment";
import { Application } from "@/types/application";
import { validateEventTimes } from "@/lib/applications/recruitment-service";
import styles from "./Calendar.module.css";

export interface EventModalProps {
  isOpen: boolean;
  event?: RecruitmentEvent | null;
  defaultDate?: string; // YYYY-MM-DD
  applications: Application[];
  onClose: () => void;
  onSubmit: (eventData: {
    id?: string;
    application_id?: string | null;
    title: string;
    event_type: RecruitmentEventType | string;
    start_time: string;
    end_time?: string | null;
    is_all_day?: boolean;
    location?: string | null;
    notes?: string | null;
    is_completed?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

const EVENT_TYPES: RecruitmentEventType[] = [
  "HR Interview",
  "User Interview",
  "Technical Interview",
  "Assessment Deadline",
  "Application Deadline",
  "Follow-up Reminder",
  "Other Recruitment Events",
];

interface EventModalFormProps {
  event?: RecruitmentEvent | null;
  defaultDate?: string;
  applications: Application[];
  onClose: () => void;
  onSubmit: EventModalProps["onSubmit"];
}

function EventModalForm({
  event,
  defaultDate,
  applications,
  onClose,
  onSubmit,
}: EventModalFormProps) {
  // Compute initial dates & times from event or defaultDate
  const initialStartDate = React.useMemo(() => {
    if (event?.start_time) {
      const d = new Date(event.start_time);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return defaultDate || new Date().toISOString().split("T")[0];
  }, [event, defaultDate]);

  const initialStartTime = React.useMemo(() => {
    if (event?.start_time) {
      const d = new Date(event.start_time);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "09:00";
  }, [event]);

  const initialEndDate = React.useMemo(() => {
    if (event?.end_time) {
      const d = new Date(event.end_time);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return defaultDate || new Date().toISOString().split("T")[0];
  }, [event, defaultDate]);

  const initialEndTime = React.useMemo(() => {
    if (event?.end_time) {
      const d = new Date(event.end_time);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "10:00";
  }, [event]);

  const [title, setTitle] = useState(event?.title || "");
  const [eventType, setEventType] = useState<RecruitmentEventType>(
    (event?.event_type as RecruitmentEventType) || "HR Interview"
  );
  const [applicationId, setApplicationId] = useState<string>(
    event?.application_id || ""
  );
  const [startDate, setStartDate] = useState(initialStartDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [isAllDay, setIsAllDay] = useState(Boolean(event?.is_all_day));
  const [location, setLocation] = useState(event?.location || "");
  const [notes, setNotes] = useState(event?.notes || "");
  const [isCompleted, setIsCompleted] = useState(Boolean(event?.is_completed));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Judul agenda wajib diisi.");
      return;
    }

    if (!startDate) {
      setErrorMessage("Tanggal mulai wajib diisi.");
      return;
    }

    // Build ISO strings
    const startIso = isAllDay
      ? `${startDate}T00:00:00.000Z`
      : new Date(`${startDate}T${startTime || "00:00"}:00`).toISOString();

    let endIso: string | null = null;
    if (!isAllDay && endDate && endTime) {
      endIso = new Date(`${endDate}T${endTime}:00`).toISOString();
    } else if (isAllDay && endDate) {
      endIso = `${endDate}T23:59:59.999Z`;
    }

    const validation = validateEventTimes(startIso, endIso);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Rentang waktu tidak valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        id: event?.id,
        application_id: applicationId ? applicationId : null,
        title: title.trim(),
        event_type: eventType,
        start_time: startIso,
        end_time: endIso,
        is_all_day: isAllDay,
        location: location.trim() || null,
        notes: notes.trim() || null,
        is_completed: isCompleted,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan jadwal.");
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.modalBody}>
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        {/* Title */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Judul Agenda <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="cth. Interview User dengan Head of Product"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Event Type & Related Application */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Jenis Event</label>
            <select
              className={styles.formSelect}
              value={eventType}
              onChange={(e) =>
                setEventType(e.target.value as RecruitmentEventType)
              }
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Lamaran Terkait</label>
            <select
              className={styles.formSelect}
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            >
              <option value="">-- Tidak Terkait Lamaran --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} - {app.position}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* All Day Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="all-day-checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className={styles.checkbox}
          />
          <label
            htmlFor="all-day-checkbox"
            className="text-xs font-semibold text-gray-700 cursor-pointer"
          >
            Acara sepanjang hari (All day)
          </label>
        </div>

        {/* Date & Time Range */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tanggal Mulai</label>
            <input
              type="date"
              className={styles.formInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {!isAllDay && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Waktu Mulai</label>
              <input
                type="time"
                className={styles.formInput}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          )}
        </div>

        {!isAllDay && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tanggal Selesai (Opsional)</label>
              <input
                type="date"
                className={styles.formInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Waktu Selesai (Opsional)</label>
              <input
                type="time"
                className={styles.formInput}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Location / Meeting link */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Lokasi / Tautan Meeting</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="cth. https://meet.google.com/xyz atau Kantor Tokopedia Tower Lt. 12"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Catatan Tambahan</label>
          <textarea
            className={styles.formTextarea}
            rows={3}
            placeholder="cth. Siapkan presentasi portofolio proyek design system"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Completed state if editing */}
        {event && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <input
              type="checkbox"
              id="completed-checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className={styles.checkbox}
            />
            <label
              htmlFor="completed-checkbox"
              className="text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Tandai sudah selesai dilaksanakan
            </label>
          </div>
        )}
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
          {isSubmitting ? "Menyimpan..." : event ? "Simpan Perubahan" : "Simpan Jadwal"}
        </button>
      </div>
    </form>
  );
}

export function EventModal({
  isOpen,
  event,
  defaultDate,
  applications,
  onClose,
  onSubmit,
}: EventModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 id="event-modal-title" className={styles.modalTitle}>
            {event ? "Edit Jadwal Rekrutmen" : "Tambah Jadwal Rekrutmen"}
          </h3>
          <button
            type="button"
            className={styles.navBtn}
            onClick={onClose}
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <EventModalForm
          key={event?.id || defaultDate || "new-event"}
          event={event}
          defaultDate={defaultDate}
          applications={applications}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
