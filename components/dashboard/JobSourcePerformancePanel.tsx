"use client";

import { useMemo, useState } from "react";
// Scoped Tailwind entry point for Bklit chart rendering
import "@/app/tailwind.css";

import {
  PieChart,
  PieSlice,
  PieCenter,
  type PieData,
} from "@bklitui/ui/charts";
import { Application } from "@/types/application";
import { computeJobSourcePerformance } from "@/lib/applications/dashboard-stats";
import { Globe, Layers } from "lucide-react";

export interface JobSourcePerformancePanelProps {
  applications: Application[];
}

export function JobSourcePerformancePanel({
  applications,
}: JobSourcePerformancePanelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { items, totalApplications } = useMemo(() => {
    return computeJobSourcePerformance(applications);
  }, [applications]);

  // Construct PieData array for Bklit UI PieChart
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
            <span className="w-7 h-7 rounded-lg bg-[#e6faf7] text-[#107c74] flex items-center justify-center">
              <Globe size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Job Source Performance
              </h3>
              <p className="text-[13px] text-gray-500">
                Performa dan distribusi lamaran berdasarkan platform sumber lowongan
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Total Lamaran
            </span>
            <span className="text-base font-bold font-heading text-[#107c74]">
              {totalApplications} Lamaran
            </span>
          </div>
        </div>

        {/* Content: Donut Chart & Legend or Empty State */}
        {totalApplications === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <Layers size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">Belum Ada Data Lamaran</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
              Kirim lamaran kerja baru untuk mulai melacak efektivitas platform sumber lowongan Anda.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
            {/* Bklit UI Donut Chart */}
            <div className="relative shrink-0 flex items-center justify-center mx-auto sm:mx-0">
              <PieChart
                data={pieData}
                innerRadius={65}
                size={200}
                padAngle={0.03}
                cornerRadius={4}
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
              >
                {pieData.map((d, i) => (
                  <PieSlice
                    key={d.label || i}
                    index={i}
                    color={d.color}
                    showGlow={false}
                    hoverEffect="translate"
                    hoverOffset={8}
                  />
                ))}

                <PieCenter defaultLabel="Total Lamaran">
                  {({ value, label, isHovered, data }) => (
                    <div className="text-center select-none pointer-events-none px-2">
                      <div
                        className="font-bold text-2xl font-heading transition-colors"
                        style={{ color: isHovered && data?.color ? data.color : "#111827" }}
                      >
                        {value.toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5 truncate max-w-[110px] mx-auto">
                        {label || "Total Lamaran"}
                      </div>
                    </div>
                  )}
                </PieCenter>
              </PieChart>
            </div>

            {/* Clear Legend with counts and percentages (No internal scrolling, fully visible) */}
            <div className="w-full sm:flex-1 sm:min-w-0 flex flex-col gap-2">
              {items.map((it, idx) => (
                <div
                  key={it.key}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[13px] ${
                    hoveredIndex === idx
                      ? "bg-gray-50 border-gray-300 shadow-2xs"
                      : "bg-white border-gray-100 hover:border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: it.color }}
                    />
                    <span className="font-semibold truncate">
                      {it.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-gray-900">
                      {it.count}
                    </span>
                    <span className="text-xs text-gray-400 font-medium min-w-[36px] text-right">
                      ({it.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>* Berdasarkan platform sumber lowongan aktual</span>
        <span className="font-semibold text-gray-600">
          {items.length} Sumber Lowongan
        </span>
      </div>
    </div>
  );
}

export default JobSourcePerformancePanel;
