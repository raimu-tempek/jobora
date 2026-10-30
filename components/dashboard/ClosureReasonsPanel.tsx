"use client";

import { useMemo, useState } from "react";
// Scoped Tailwind entry point for Bklit chart rendering
import "@/app/tailwind.css";

import {
  PieChart,
  PieSlice,
  PieCenter,
  type PieData,
} from "@/components/ui/pie-chart";
import { Application } from "@/types/application";
import { computeClosureReasons } from "@/lib/applications/dashboard-stats";
import { CheckCircle2, XCircle } from "lucide-react";

interface ClosureReasonsPanelProps {
  applications: Application[];
}

export function ClosureReasonsPanel({
  applications,
}: ClosureReasonsPanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { items, totalClosed } = useMemo(() => {
    return computeClosureReasons(applications);
  }, [applications]);

  // Construct PieData array for Bklit PieChart
  const pieData: PieData[] = useMemo(() => {
    return items.map((it) => ({
      label: it.label,
      value: it.count,
      color: it.color,
    }));
  }, [items]);

  return (
    <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Alasan Penutupan Lamaran
              </h3>
              <p className="text-[13px] text-gray-500">
                Alasan penutupan proses rekrutmen lamaran
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Total Ditutup
            </span>
            <span className="text-base font-bold font-heading text-rose-600">
              {totalClosed} Lamaran
            </span>
          </div>
        </div>

        {/* Content: Donut Chart & Legend or Empty State */}
        {totalClosed === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
            <p className="font-semibold text-gray-700">Belum Ada Lamaran Ditutup</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
              Semua lamaran yang tercatat saat ini masih aktif dalam pipeline proses seleksi.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
            {/* Bklit UI Pie / Donut Chart */}
            <div className="relative shrink-0 flex items-center justify-center">
              <PieChart
                data={pieData}
                innerRadius={65}
                size={200}
                padAngle={0.03}
                cornerRadius={4}
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
              >
                {pieData.map((d, index) => (
                  <PieSlice
                    key={d.label}
                    index={index}
                    color={d.color}
                    showGlow={false}
                    hoverEffect="translate"
                    hoverOffset={8}
                  />
                ))}
                <PieCenter defaultLabel="Ditutup">
                  {({ value, label, isHovered, data }) => (
                    <div className="text-center select-none pointer-events-none">
                      <div
                        className="font-bold text-2xl font-heading transition-colors"
                        style={{ color: isHovered && data.color ? data.color : "#111827" }}
                      >
                        {value.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                        {label || "Ditutup"}
                      </div>
                    </div>
                  )}
                </PieCenter>
              </PieChart>
            </div>

            {/* Clear Legend with counts and percentages */}
            <div className="space-y-3 w-full sm:w-auto sm:min-w-[170px]">
              {items.map((it, idx) => (
                <div
                  key={it.key}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    hoveredIndex === idx
                      ? "bg-gray-50 border-gray-300 shadow-2xs"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: it.color }}
                    />
                    <span className="text-[13.5px] font-semibold text-gray-800">
                      {it.label}
                    </span>
                  </div>
                  <div className="text-right text-[13px]">
                    <span className="font-bold text-gray-900 block">
                      {it.count}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {it.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>* Kategori penolakan, ghosting, dan pengunduran diri</span>
        <span className="font-semibold text-gray-600">Alasan Penutupan</span>
      </div>
    </div>
  );
}
