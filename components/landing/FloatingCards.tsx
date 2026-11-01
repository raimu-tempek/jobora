"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  TrendingUp,
  Clock,
  ArrowUpRight,
  Video,
} from "lucide-react";

export function FloatingCareerCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : {
              opacity: 1,
              y: [0, -8, 0],
            }
      }
      transition={{
        opacity: { duration: 0.6, delay: 0.4 },
        y: {
          duration: 4.5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      }}
      className="hidden lg:flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 text-xs w-64 select-none -rotate-1 hover:rotate-0 transition-transform duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>Jadwal Interview</span>
        </div>
        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/80 px-2 py-0.5 rounded-full font-bold">
          Besok
        </span>
      </div>

      <div className="pt-1">
        <div className="font-bold text-slate-900 text-sm">Google Indonesia</div>
        <div className="text-slate-500 text-[11px]">Senior Frontend Engineer</div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-slate-600 text-[11px]">
        <Clock size={13} className="text-purple-600 shrink-0" />
        <span>14:00 - 15:00 WIB</span>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1 text-slate-500">
          <Video size={12} className="text-emerald-600" />
          <span>Meet</span>
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingFinanceCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : {
              opacity: 1,
              y: [0, 8, 0],
            }
      }
      transition={{
        opacity: { duration: 0.6, delay: 0.5 },
        y: {
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      }}
      className="hidden lg:flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 text-xs w-64 select-none rotate-1 hover:rotate-0 transition-transform duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500">Surplus Bulanan</span>
        <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
          <TrendingUp size={13} />
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-lg font-extrabold text-slate-900 tabular-nums">
          +Rp 9.250.000
        </span>
        <span className="text-[11px] font-bold text-emerald-600 flex items-center">
          <ArrowUpRight size={12} />
          +18.4%
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="space-y-1 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Target Tabungan</span>
          <span className="font-bold text-emerald-700">82% tercapai</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-[#107c74] rounded-full w-[82%]" />
        </div>
      </div>
    </motion.div>
  );
}
