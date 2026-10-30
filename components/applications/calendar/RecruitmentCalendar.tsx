"use client";

import React, { useState, useMemo } from "react";
import { RecruitmentEvent, RecruitmentEventType } from "@/types/recruitment";
import { Application } from "@/types/application";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarListView } from "./CalendarListView";
import { EventModal } from "./EventModal";
import { EventDetailModal } from "./EventDetailModal";
import styles from "./Calendar.module.css";

export interface RecruitmentCalendarProps {
  events: RecruitmentEvent[];
  applications: Application[];
  onSaveEvent: (eventData: {
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
  onDeleteEvent: (eventId: string) => Promise<boolean>;
  onToggleComplete: (eventId: string) => Promise<boolean>;
  onOpenApplicationDetail?: (app: Application) => void;
}

const INDONESIAN_MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const EVENT_TYPES = [
  "Semua Jenis",
  "HR Interview",
  "User Interview",
  "Technical Interview",
  "Assessment Deadline",
  "Application Deadline",
  "Follow-up Reminder",
  "Other Recruitment Events",
];

export function RecruitmentCalendar({
  events,
  applications,
  onSaveEvent,
  onDeleteEvent,
  onToggleComplete,
  onOpenApplicationDetail,
}: RecruitmentCalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [typeFilter, setTypeFilter] = useState("Semua Jenis");
  const [completionFilter, setCompletionFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RecruitmentEvent | null>(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState<string | undefined>(undefined);
  const [detailEvent, setDetailEvent] = useState<RecruitmentEvent | null>(null);

  // Period header title calculation
  const periodTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = INDONESIAN_MONTH_NAMES[currentDate.getMonth()];

    if (viewMode === "month") {
      return `${month} ${year}`;
    }

    if (viewMode === "week") {
      const dayOfWeek = currentDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mMonth = INDONESIAN_MONTH_NAMES[monday.getMonth()].slice(0, 3);
      const sMonth = INDONESIAN_MONTH_NAMES[sunday.getMonth()].slice(0, 3);

      return `${monday.getDate()} ${mMonth} - ${sunday.getDate()} ${sMonth} ${year}`;
    }

    return "Agenda Rekrutmen";
  }, [currentDate, viewMode]);

  // Navigate back/forward
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(prev.getMonth() - 1);
      } else if (viewMode === "week") {
        next.setDate(prev.getDate() - 7);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(prev.getMonth() + 1);
      } else if (viewMode === "week") {
        next.setDate(prev.getDate() + 7);
      }
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by type
    if (typeFilter !== "Semua Jenis") {
      result = result.filter((e) => e.event_type === typeFilter);
    }

    // Filter by completion
    if (completionFilter === "active") {
      result = result.filter((e) => !e.is_completed);
    } else if (completionFilter === "completed") {
      result = result.filter((e) => e.is_completed);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesNotes = e.notes?.toLowerCase().includes(q) || false;
        const matchesLocation = e.location?.toLowerCase().includes(q) || false;
        const linkedApp = applications.find((a) => a.id === e.application_id);
        const matchesApp =
          linkedApp?.company.toLowerCase().includes(q) ||
          linkedApp?.position.toLowerCase().includes(q) ||
          false;
        return matchesTitle || matchesNotes || matchesLocation || matchesApp;
      });
    }

    return result;
  }, [events, typeFilter, completionFilter, searchQuery, applications]);

  // Handlers for click interactions
  const handleDateClick = (dateStr: string) => {
    setEditingEvent(null);
    setDefaultDateForModal(dateStr);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: RecruitmentEvent) => {
    setDetailEvent(event);
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setDefaultDateForModal(new Date().toISOString().split("T")[0]);
    setIsEventModalOpen(true);
  };

  const handleEditFromDetail = (event: RecruitmentEvent) => {
    setDetailEvent(null);
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteFromDetail = async (event: RecruitmentEvent) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus jadwal "${event.title}"?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setDetailEvent(null);
    await onDeleteEvent(event.id);
  };

  const handleToggleFromDetail = async (event: RecruitmentEvent) => {
    await onToggleComplete(event.id);
    setDetailEvent((prev) =>
      prev && prev.id === event.id
        ? { ...prev, is_completed: !prev.is_completed }
        : prev
    );
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Top Bar: Period title, Today, Navigation, View toggle, Add button */}
      <div className={styles.topBar}>
        <div className={styles.navGroup}>
          <h2 className={styles.periodTitle}>{periodTitle}</h2>

          <button
            type="button"
            className={styles.todayBtn}
            onClick={handleToday}
          >
            Hari Ini
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrev}
              title="Sebelumnya"
              aria-label="Periode sebelumnya"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNext}
              title="Selanjutnya"
              aria-label="Periode selanjutnya"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className={styles.viewToggleGroup} role="tablist" aria-label="Tampilan kalender">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "month"}
              className={`${styles.viewToggleBtn} ${
                viewMode === "month" ? styles.viewToggleBtnActive : ""
              }`}
              onClick={() => setViewMode("month")}
            >
              Bulan
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "week"}
              className={`${styles.viewToggleBtn} ${
                viewMode === "week" ? styles.viewToggleBtnActive : ""
              }`}
              onClick={() => setViewMode("week")}
            >
              Minggu
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              className={`${styles.viewToggleBtn} ${
                viewMode === "list" ? styles.viewToggleBtnActive : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              Daftar Event
            </button>
          </div>

          {/* Add Event Button */}
          <button
            type="button"
            className={styles.addEventBtn}
            onClick={handleOpenAddModal}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterRow}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400 text-[18px]">
            filter_list
          </span>
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter jenis agenda"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <select
          className={styles.filterSelect}
          value={completionFilter}
          onChange={(e) =>
            setCompletionFilter(e.target.value as "all" | "active" | "completed")
          }
          aria-label="Filter status agenda"
        >
          <option value="all">Semua Status</option>
          <option value="active">Belum Selesai</option>
          <option value="completed">Sudah Selesai</option>
        </select>

        <div className="relative ml-auto">
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari agenda, posisi, perusahaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "month" && (
        <CalendarMonthView
          currentDate={currentDate}
          events={filteredEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {viewMode === "week" && (
        <CalendarWeekView
          currentDate={currentDate}
          events={filteredEvents}
          applications={applications}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {viewMode === "list" && (
        <CalendarListView
          events={filteredEvents}
          applications={applications}
          onEventClick={handleEventClick}
          onToggleComplete={(evt) => onToggleComplete(evt.id)}
        />
      )}

      {/* Create / Edit Modal */}
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          event={editingEvent}
          defaultDate={defaultDateForModal}
          applications={applications}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSubmit={onSaveEvent}
        />
      )}

      {/* Detail Modal */}
      {detailEvent && (
        <EventDetailModal
          isOpen={Boolean(detailEvent)}
          event={detailEvent}
          applications={applications}
          onClose={() => setDetailEvent(null)}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteFromDetail}
          onToggleComplete={handleToggleFromDetail}
          onOpenApplicationDetail={onOpenApplicationDetail}
        />
      )}
    </div>
  );
}
