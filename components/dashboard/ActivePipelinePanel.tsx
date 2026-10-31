"use client";

import { useMemo } from "react";
import { Application } from "@/types/application";
import { computeActivePipelineStatus } from "@/lib/applications/dashboard-stats";
import { GitBranch, Layers } from "lucide-react";

interface ActivePipelinePanelProps {
  applications: Application[];
}

export function ActivePipelinePanel({
  applications,
}: ActivePipelinePanelProps) {
  const { items, totalActive } = useMemo(() => {
    return computeActivePipelineStatus(applications);
  }, [applications]);

  return (
    <div className="bg-white border border-[#e2eaf0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#e6faf7] text-[#107c74] flex items-center justify-center">
              <GitBranch size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Status Pipeline Aktif
              </h3>
              <p className="text-[13px] text-gray-500">
                Distribusi tahapan rekrutmen lamaran yang masih berjalan
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Total Aktif
            </span>
            <span className="text-base font-bold font-heading text-[#107c74]">
              {totalActive} Lamaran
            </span>
          </div>
        </div>

        {/* Stages List with Horizontal Progress Bars */}
        {totalActive === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#e6faf7] flex items-center justify-center mb-3">
              <Layers size={22} className="text-[#107c74]" />
            </div>
            <p className="text-sm font-bold text-gray-800 font-heading">Tidak Ada Lamaran Aktif</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
              Semua lamaran Anda telah selesai atau belum dimulai. Tambah lamaran baru untuk mengisi pipeline seleksi.
            </p>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {items.map((stage) => (
              <div key={stage.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-semibold text-gray-800">
                      {stage.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-bold text-gray-900">
                      {stage.count}
                    </span>
                    <span className="text-xs text-gray-400 font-medium w-10 text-right">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>* Status ditutup (Rejected / Ghosted / Withdrawn) dikecualikan</span>
        <span className="font-semibold text-gray-600">6 Tahap Rekrutmen</span>
      </div>
    </div>
  );
}
