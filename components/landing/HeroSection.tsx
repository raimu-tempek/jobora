"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, LogIn, Shield, CheckCircle2 } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";
import { FloatingCareerCard, FloatingFinanceCard } from "./FloatingCards";

interface HeroSectionProps {
  user?: User | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: shouldReduceMotion ? 0 : custom * 0.15,
        ease: "easeOut" as const,
      },
    }),
  };

  const previewVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 36, scale: shouldReduceMotion ? 1 : 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: shouldReduceMotion ? 0 : 0.45,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36 overflow-hidden">
      {/* Background Soft Lighting Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-linear-to-b from-teal-50/70 via-indigo-50/30 to-transparent -z-10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-100/30 -z-10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Top Content: Badge, Headline, Subtitle, CTAs */}
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Badge: "Career & Finance, Simplified" */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="inline-flex items-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/70 text-[#107c74] text-xs sm:text-sm font-semibold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#107c74] animate-pulse" />
              <span>Career & Finance, Simplified</span>
            </div>
          </motion.div>

          {/* Headline: "Bangun masa depanmu, selangkah demi selangkah." */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="text-4xl sm:text-6xl lg:text-[74px] font-extrabold tracking-tight text-slate-900 leading-[1.12]"
          >
            Bangun masa depanmu,{" "}
            <span className="font-editorial italic font-normal text-[#107c74] block sm:inline">
              selangkah demi selangkah.
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Kelola perjalanan karier, pantau lamaran pekerjaan, dan atur keuanganmu dalam satu tempat. Biar setiap langkah kecil membawamu lebih dekat ke tujuan.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] shadow-md hover:shadow-lg hover:shadow-teal-900/10 transition-all duration-200 cursor-pointer"
              >
                <span>Buka Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] shadow-md hover:shadow-lg hover:shadow-teal-900/10 transition-all duration-200 cursor-pointer"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
                >
                  <LogIn size={18} className="text-slate-500" />
                  <span>Masuk</span>
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust points */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium select-none"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Gratis Digunakan</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Tanpa Kartu Kredit</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-600" />
              <span>Data Privat & Terenkripsi</span>
            </span>
          </motion.div>
        </div>

        {/* Large Floating Dashboard Preview with Layered Overlapping Cards */}
        <div className="relative mt-12 sm:mt-16 lg:mt-20 max-w-6xl mx-auto">
          {/* Overlapping Floating Career Card (Top-Right) */}
          <div className="absolute -top-7 -right-4 xl:-right-10 z-20 pointer-events-none">
            <FloatingCareerCard />
          </div>

          {/* Dashboard Preview Window */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={previewVariants}
            className="relative z-10"
          >
            <DashboardPreview />
          </motion.div>

          {/* Overlapping Floating Finance Card (Bottom-Left) */}
          <div className="absolute -bottom-7 -left-4 xl:-left-10 z-20 pointer-events-none">
            <FloatingFinanceCard />
          </div>
        </div>
      </div>
    </section>
  );
}
