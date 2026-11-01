"use client";

import { useState } from "react";
import {
  Briefcase,
  GripVertical,
  X,
  Building2,
  RotateCcw,
} from "lucide-react";

type KanbanStatus = "submitted" | "interview" | "offering";

interface KanbanCard {
  id: string;
  company: string;
  role: string;
  platform: string;
  dateOrNote: string;
  status: KanbanStatus;
  statusLabel: string;
  statusBadgeColor: string;
  salary?: string;
  isUrgent?: boolean;
  notes?: string;
}

const INITIAL_CARDS: KanbanCard[] = [
  {
    id: "card-1",
    company: "Blibli.com",
    role: "Frontend Engineer",
    platform: "LinkedIn",
    dateOrNote: "2 hari lalu",
    status: "submitted",
    statusLabel: "Submitted",
    statusBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    notes: "Aplikasi dikirim via Easy Apply. Menunggu konfirmasi tim talent acquisition.",
  },
  {
    id: "card-2",
    company: "Tiket.com",
    role: "Software Engineer",
    platform: "JobStreet",
    dateOrNote: "Kemarin",
    status: "submitted",
    statusLabel: "Submitted",
    statusBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    notes: "Portofolio dan resume terbaru sudah dilampirkan.",
  },
  {
    id: "card-3",
    company: "Google Indonesia",
    role: "Senior Frontend Lead",
    platform: "Glints",
    dateOrNote: "Besok 14:00 WIB",
    status: "interview",
    statusLabel: "Interview HR",
    statusBadgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    isUrgent: true,
    notes: "Sesi User Interview via Google Meet. Topik: System Design & React performance.",
  },
  {
    id: "card-4",
    company: "Traveloka",
    role: "Full Stack Engineer",
    platform: "JobStreet",
    dateOrNote: "User Interview • 4 Nov",
    status: "interview",
    statusLabel: "Technical Test",
    statusBadgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    notes: "Take-home test selesai dengan nilai optimal. Lanjut sesi diskusi arsitektur.",
  },
  {
    id: "card-5",
    company: "Tokopedia (GoTo)",
    role: "Product Engineer",
    platform: "LinkedIn",
    dateOrNote: "Offering Received",
    status: "offering",
    statusLabel: "Offering",
    statusBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    salary: "Rp 28.000.000 / bln",
    notes: "Paket kompensasi termasuk asuransi keluarga, laptop kerja, dan bonus tahunan.",
  },
];

export function InteractiveKanbanPreview() {
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedCardId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: KanbanStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const moveCardToStatus = (cardId: string, newStatus: KanbanStatus) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          let newStatusLabel = "Submitted";
          let newBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";

          if (newStatus === "interview") {
            newStatusLabel = "Interview HR";
            newBadgeColor = "bg-purple-50 text-purple-700 border-purple-200";
          } else if (newStatus === "offering") {
            newStatusLabel = "Offering";
            newBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
          }

          const updated = {
            ...card,
            status: newStatus,
            statusLabel: newStatusLabel,
            statusBadgeColor: newBadgeColor,
          };

          if (selectedCard && selectedCard.id === cardId) {
            setSelectedCard(updated);
          }
          return updated;
        }
        return card;
      })
    );
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
    if (cardId) {
      moveCardToStatus(cardId, targetStatus);
    }
    setDraggedCardId(null);
    setDragOverColumn(null);
  };

  const handleReset = () => {
    setCards(INITIAL_CARDS);
    setSelectedCard(null);
  };

  // Group cards by status
  const submittedCards = cards.filter((c) => c.status === "submitted");
  const interviewCards = cards.filter((c) => c.status === "interview");
  const offeringCards = cards.filter((c) => c.status === "offering");

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xl shadow-slate-900/[0.04] space-y-4 relative">
      {/* Visual Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-teal-50 text-[#107c74]">
            <Briefcase size={18} />
          </span>
          <div>
            <div className="text-sm font-bold text-slate-900">Pipeline Rekrutmen Aktif</div>
            <div className="text-xs text-slate-500">
              {cards.length} Perusahaan dalam pemantauan interaktif
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
            title="Kembalikan posisi kartu ke awal"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <span className="text-xs font-semibold text-[#107c74] bg-[#e6faf7] px-2.5 py-1 rounded-full">
            Callback: 75%
          </span>
        </div>
      </div>

      {/* Interactive Instruction Banner */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-teal-50/70 border border-teal-200/60 text-xs text-[#107c74] font-medium select-none">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-[#107c74] text-white shrink-0">
            <GripVertical size={13} />
          </span>
          <span className="text-[11px] sm:text-xs">
            <strong>Coba sendiri!</strong> Drag kartu lamaran ke kolom lain untuk mengubah statusnya.
          </span>
        </div>
        <span className="hidden md:inline-block text-[10px] bg-white px-2 py-0.5 rounded-full border border-teal-200/80 font-bold text-[#107c74]">
          Simulasi Langsung
        </span>
      </div>

      {/* 3 Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 select-none">
        {/* Column 1: Submitted */}
        <div
          onDragOver={(e) => handleDragOver(e, "submitted")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "submitted")}
          className={`rounded-xl p-3 space-y-2.5 border transition-all duration-200 min-h-[220px] ${
            dragOverColumn === "submitted"
              ? "bg-teal-50/60 border-[#107c74] ring-2 ring-[#107c74]/20"
              : "bg-slate-50/90 border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Submitted</span>
            <span className="text-[11px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full tabular-nums">
              {submittedCards.length}
            </span>
          </div>

          <div className="space-y-2">
            {submittedCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                onClick={() => setSelectedCard(card)}
                className="group p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs space-y-1 hover:border-[#107c74]/70 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all relative"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#107c74] transition-colors">
                    {card.company}
                  </div>
                  <GripVertical
                    size={12}
                    className="text-slate-300 group-hover:text-slate-500 shrink-0"
                  />
                </div>
                <div className="text-[11px] text-slate-500">{card.role}</div>
                <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
                  <span>{card.platform}</span>
                  <span>{card.dateOrNote}</span>
                </div>
              </div>
            ))}

            {submittedCards.length === 0 && (
              <div className="py-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                Tarik kartu ke sini
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Interview */}
        <div
          onDragOver={(e) => handleDragOver(e, "interview")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "interview")}
          className={`rounded-xl p-3 space-y-2.5 border transition-all duration-200 min-h-[220px] ${
            dragOverColumn === "interview"
              ? "bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20"
              : "bg-purple-50/50 border-purple-100"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-900">
            <span>Interview</span>
            <span className="text-[11px] bg-purple-200/80 text-purple-800 px-1.5 py-0.2 rounded-full tabular-nums">
              {interviewCards.length}
            </span>
          </div>

          <div className="space-y-2">
            {interviewCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                onClick={() => setSelectedCard(card)}
                className="group p-2.5 rounded-lg bg-white border border-purple-200 shadow-2xs space-y-1 hover:border-purple-400 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all relative"
              >
                {card.isUrgent && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                )}
                <div className="flex items-center justify-between pr-3">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {card.company}
                  </div>
                  <GripVertical
                    size={12}
                    className="text-slate-300 group-hover:text-purple-400 shrink-0"
                  />
                </div>
                <div className="text-[11px] text-purple-700 font-medium">{card.role}</div>
                <div className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded mt-1 inline-block font-semibold">
                  {card.dateOrNote}
                </div>
              </div>
            ))}

            {interviewCards.length === 0 && (
              <div className="py-6 text-center text-[11px] text-purple-400 border border-dashed border-purple-200 rounded-lg">
                Tarik kartu ke sini
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Offering */}
        <div
          onDragOver={(e) => handleDragOver(e, "offering")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "offering")}
          className={`rounded-xl p-3 space-y-2.5 border transition-all duration-200 min-h-[220px] ${
            dragOverColumn === "offering"
              ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-emerald-50/50 border-emerald-100"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Offering</span>
            <span className="text-[11px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded-full tabular-nums">
              {offeringCards.length}
            </span>
          </div>

          <div className="space-y-2">
            {offeringCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                onClick={() => setSelectedCard(card)}
                className="group p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs space-y-1 hover:border-emerald-400 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all relative"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {card.company}
                  </div>
                  <GripVertical
                    size={12}
                    className="text-slate-300 group-hover:text-emerald-500 shrink-0"
                  />
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  {card.statusLabel || "Offering Received"}
                </div>
                {card.salary ? (
                  <div className="text-[10px] font-bold text-slate-700 pt-0.5 tabular-nums">
                    {card.salary}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    {card.platform} • {card.dateOrNote}
                  </div>
                )}
              </div>
            ))}

            {offeringCards.length === 0 && (
              <div className="py-6 text-center text-[11px] text-emerald-400 border border-dashed border-emerald-200 rounded-lg">
                Tarik kartu ke sini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#107c74]" />
          <span>Klik kartu untuk melihat detail & simulasi status</span>
        </span>
        <span className="font-semibold text-slate-700">100% Bebas Ribet</span>
      </div>

      {/* Detail Modal / Quick Move Popup for Clicked Card */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-[#107c74] font-semibold mb-1">
                  <Building2 size={13} />
                  <span>{selectedCard.platform}</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {selectedCard.company}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedCard.role}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Tutup detail"
              >
                <X size={16} />
              </button>
            </div>

            {/* Note & Info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Status Saat Ini:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${selectedCard.statusBadgeColor}`}
                >
                  {selectedCard.status.toUpperCase()}
                </span>
              </div>
              {selectedCard.notes && (
                <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60 leading-relaxed">
                  {selectedCard.notes}
                </p>
              )}
            </div>

            {/* Quick Move Status Buttons (Particularly friendly for touch / mobile!) */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                Ubah Status Simulasi:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => moveCardToStatus(selectedCard.id, "submitted")}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCard.status === "submitted"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Submitted
                </button>
                <button
                  type="button"
                  onClick={() => moveCardToStatus(selectedCard.id, "interview")}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCard.status === "interview"
                      ? "bg-purple-700 text-white border-purple-700"
                      : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  Interview
                </button>
                <button
                  type="button"
                  onClick={() => moveCardToStatus(selectedCard.id, "offering")}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCard.status === "offering"
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  Offering
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
