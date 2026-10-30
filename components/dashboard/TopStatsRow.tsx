"use client";

import { useMemo } from "react";
import { AreaSparkline } from "@/components/ui/sparkline";
import { DashboardTopStats } from "@/lib/applications/dashboard-stats";
import {
  Send,
  PhoneCall,
  Users,
  Hourglass,
  Award,
  CalendarDays,
} from "lucide-react";

interface TopStatsRowProps {
  stats: DashboardTopStats;
}

export function TopStatsRow({ stats }: TopStatsRowProps) {
  const cards = useMemo(() => [
    {
      id: "total",
      label: "Total Lamaran",
      value: stats.totalApplications.value.toLocaleString("id-ID"),
      subtext: stats.totalApplications.subtext,
      sparkline: stats.totalApplications.sparkline,
      color: "#107c74",
      bgColor: "#e6faf7",
      icon: Send,
    },
    {
      id: "callback",
      label: "Tingkat Respons",
      value: `${stats.callbackRate.percentage}%`,
      subtext: stats.callbackRate.subtext,
      sparkline: stats.callbackRate.sparkline,
      color: "#2563eb",
      bgColor: "#eff6ff",
      icon: PhoneCall,
    },
    {
      id: "interview",
      label: "Tingkat Interview",
      value: `${stats.interviewRate.percentage}%`,
      subtext: stats.interviewRate.subtext,
      sparkline: stats.interviewRate.sparkline,
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
      icon: Users,
    },
    {
      id: "active",
      label: "Pipeline Aktif",
      value: stats.activePipeline.value.toLocaleString("id-ID"),
      subtext: stats.activePipeline.subtext,
      sparkline: stats.activePipeline.sparkline,
      color: "#d97706",
      bgColor: "#fffbeb",
      icon: Hourglass,
    },
    {
      id: "offers",
      label: "Penawaran (Offer)",
      value: stats.offers.value.toLocaleString("id-ID"),
      subtext: stats.offers.subtext,
      sparkline: stats.offers.sparkline,
      color: "#10b981",
      bgColor: "#ecfdf5",
      icon: Award,
    },
    {
      id: "this_week",
      label: "Minggu Ini",
      value: stats.thisWeek.value.toLocaleString("id-ID"),
      subtext: stats.thisWeek.subtext,
      sparkline: stats.thisWeek.sparkline,
      color: "#0891b2",
      bgColor: "#ecfeff",
      icon: CalendarDays,
    },
  ], [stats]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-[#e2eaf0] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-gray-300 transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                  {card.label}
                </span>
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bgColor, color: card.color }}
                >
                  <Icon size={13} strokeWidth={2.4} />
                </span>
              </div>
              <div className="text-[26px] leading-8 font-bold font-heading text-gray-900 tracking-tight">
                {card.value}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-50">
              <div className="h-7 w-full mb-1 flex items-center">
                <AreaSparkline
                  data={card.sparkline}
                  dataKey="value"
                  height={26}
                  color={card.color}
                  strokeWidth={2}
                  fill="gradient"
                  curve="monotone"
                  className="w-full"
                />
              </div>
              <div className="text-xs text-gray-500 font-normal truncate">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
