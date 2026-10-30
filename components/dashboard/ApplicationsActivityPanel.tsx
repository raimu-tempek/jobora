"use client";

import { useState, useMemo } from "react";
// Scoped Tailwind entry point for Bklit chart rendering
import "@/app/tailwind.css";

import {
  ComposedChart,
  Line,
  Grid,
  XAxis,
  YAxis,
  ChartTooltip,
  curveMonotoneX,
} from "@/components/ui/composed-chart";
import { Application } from "@/types/application";
import {
  ActivityPeriodFilter,
  computeActivitySeries,
} from "@/lib/applications/dashboard-stats";
import { TrendingUp, Calendar } from "lucide-react";

interface ApplicationsActivityPanelProps {
  applications: Application[];
}

const PERIOD_OPTIONS: { id: ActivityPeriodFilter; label: string }[] = [
  { id: "30_days", label: "30 Hari Terakhir" },
  { id: "12_months", label: "12 Bulan Terakhir" },
  { id: "this_year", label: "Tahun Ini" },
  { id: "last_year", label: "Tahun Lalu" },
  { id: "all_time", label: "Semua Waktu" },
];

export function ApplicationsActivityPanel({
  applications,
}: ApplicationsActivityPanelProps) {
  const [period, setPeriod] = useState<ActivityPeriodFilter>("30_days");

  const chartData = useMemo(() => {
    return computeActivitySeries(applications, period);
  }, [applications, period]);

  // Aggregate summary for active period
  const totalPeriodApps = useMemo(
    () => chartData.reduce((acc, it) => acc + (it.applications || 0), 0),
    [chartData]
  );
  const totalPeriodResponses = useMemo(
    () => chartData.reduce((acc, it) => acc + (it.responses || 0), 0),
    [chartData]
  );
  const totalPeriodCallbacks = useMemo(
    () => chartData.reduce((acc, it) => acc + (it.callbacks || 0), 0),
    [chartData]
  );

  return (
    <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs mb-6">
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#e6faf7] text-[#107c74] flex items-center justify-center">
              <TrendingUp size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Aktivitas Lamaran & Respons
              </h2>
              <p className="text-[13px] text-gray-500">
                Aktivitas pengiriman lamaran, respons perusahaan, dan panggilan interview
              </p>
            </div>
          </div>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-[13px] overflow-x-auto max-w-full">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPeriod(opt.id)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                period === opt.id
                  ? "bg-white text-[#107c74] shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Series Legend & Summary Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-[13px]">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#107c74] ring-2 ring-[#e6faf7]" />
            <span className="font-semibold text-gray-700">Lamaran Dikirim</span>
            <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs">
              {totalPeriodApps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] ring-2 ring-[#fef3c7]" />
            <span className="font-semibold text-gray-700">Respons & Penolakan</span>
            <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs">
              {totalPeriodResponses}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] ring-2 ring-[#d1fae5]" />
            <span className="font-semibold text-gray-700">Panggilan Wawancara</span>
            <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs">
              {totalPeriodCallbacks}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar size={13} />
          <span>Berdasarkan tanggal riwayat aplikasi</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full relative min-h-[280px]">
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-xs text-gray-400">
            Belum ada aktivitas lamaran pada rentang waktu ini.
          </div>
        ) : (
          <div className="h-[290px] w-full">
            <ComposedChart
              data={chartData}
              xDataKey="date"
              className="w-full h-full"
              margin={{ top: 20, right: 20, bottom: 30, left: 24 }}
            >
              <Grid horizontal vertical={false} />
              <XAxis numTicks={Math.min(8, chartData.length)} />
              <YAxis />
              <Line
                dataKey="applications"
                stroke="#107c74"
                strokeWidth={2.5}
                curve={curveMonotoneX}
              />
              <Line
                dataKey="responses"
                stroke="#f59e0b"
                strokeWidth={2.5}
                curve={curveMonotoneX}
              />
              <Line
                dataKey="callbacks"
                stroke="#10b981"
                strokeWidth={2.5}
                curve={curveMonotoneX}
              />
              <ChartTooltip
                rows={(point) => [
                  {
                    label: "Lamaran Dikirim",
                    value: (point.applications as number) || 0,
                    color: "#107c74",
                  },
                  {
                    label: "Respons & Penolakan",
                    value: (point.responses as number) || 0,
                    color: "#f59e0b",
                  },
                  {
                    label: "Panggilan Wawancara",
                    value: (point.callbacks as number) || 0,
                    color: "#10b981",
                  },
                ]}
              />
            </ComposedChart>
          </div>
        )}
      </div>
    </div>
  );
}
