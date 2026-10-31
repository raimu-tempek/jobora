"use client";

import React, { useEffect, useState } from "react";
import { Application } from "@/types/application";
import { ApplicationStatusHistory } from "@/types/recruitment";
import { formatDate } from "@/lib/applications/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { fetchStatusHistory } from "@/lib/applications/recruitment-service";

export interface ApplicationDetailModalProps {
  isOpen: boolean;
  application: Application | null;
  userId?: string;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

export function ApplicationDetailModal({
  isOpen,
  application,
  userId,
  onClose,
  onEdit,
  onDelete,
}: ApplicationDetailModalProps) {
  const [history, setHistory] = useState<ApplicationStatusHistory[] | null>(null);

  useEffect(() => {
    if (!isOpen || !application) return;

    let isMounted = true;
    const currentUserId = userId || application.user_id;
    if (currentUserId && application.id) {
      fetchStatusHistory(currentUserId, application.id)
        .then((data) => {
          if (isMounted) {
            setHistory(data);
          }
        })
        .catch(() => {
          if (isMounted) setHistory([]);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, application, userId]);

  if (!isOpen || !application) return null;

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return `${dateStr}, ${timeStr}`;
    } catch {
      return ts;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-detail-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                {application.type || "Full-time"}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{application.platform || "Platform"}</span>
            </div>
            <h2 id="app-detail-title" className="text-xl font-bold text-gray-900 leading-snug">
              {application.company}
            </h2>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {application.position}
            </p>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onClose}
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Status & Applied Date */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Status Saat Ini
              </span>
              <StatusBadge status={application.status} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Tanggal Melamar
              </span>
              <span className="text-xs font-bold text-gray-800">
                {formatDate(application.date)}
              </span>
            </div>
          </div>

          {/* Section: Status Change History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-teal-600">
                history
              </span>
              Riwayat Perubahan Status
            </h3>

            {history === null ? (
              <div className="text-xs text-gray-400 py-2">Memuat riwayat...</div>
            ) : history.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                Status awal dicatat sebagai <strong>{application.status}</strong> sejak tanggal {formatDate(application.date)}. Belum ada riwayat perpindahan status lanjutan.
              </div>
            ) : (
              <div className="space-y-2 border-l-2 border-teal-500/30 pl-3 ml-1.5">
                {history.map((item) => (
                  <div key={item.id} className="text-xs space-y-0.5 relative">
                    <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-teal-600" />
                    <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                      <span>{item.previous_status}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-teal-700">{item.new_status}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 block">
                      {formatTimestamp(item.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
            onClick={() => {
              onClose();
              onDelete(application);
            }}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Hapus Lamaran</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              onClick={onClose}
            >
              Tutup
            </button>

            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              onClick={() => {
                onClose();
                onEdit(application);
              }}
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Lamaran</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
