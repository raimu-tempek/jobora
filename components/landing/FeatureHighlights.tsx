"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { InteractiveKanbanPreview } from "./InteractiveKanbanPreview";

export function FeatureHighlights() {
  const shouldReduceMotion = useReducedMotion();

  const scrollToKanban = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("interactive-kanban");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full">
      {/* 1. EDITORIAL MANIFESTO / PHILOSOPHY SECTION */}
      <section className="py-20 sm:py-28 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} className="text-[#107c74]" />
            <span>Filosofi Jobora</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight">
            Karier dan keuangan tidak pernah berdiri sendiri.{" "}
            <span className="font-editorial italic font-normal text-[#107c74]">
              Keduanya saling menguatkan.
            </span>
          </h2>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Keputusan kariermu menentukan arus kasmu, dan fondasi keuangan yang stabil memberimu ketenangan saat memilih tawaran kerja terbaik. Jobora menyatukan keduanya dalam satu alur yang harmonis.
          </p>

          <div className="pt-4 flex items-center justify-center">
            <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-[#107c74] to-transparent" />
          </div>
        </div>
      </section>

      {/* 2. CAREER TRACKER: ASYMMETRIC SPLIT LAYOUT (Narrative Left, Visual Kanban Right) */}
      <section id="career-preview" className="py-20 sm:py-28 bg-slate-50/60 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#107c74]">
                <span className="w-6 h-px bg-[#107c74]" />
                <span>01 / Career Tracker</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Kuasai setiap proses lamaran. Tanpa ada yang terlewat.
              </h3>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Tinggalkan spreadsheet manual yang berantakan. Pantau setiap posisi yang kamu lamar dalam Kanban board yang intuitif — mulai dari pengiriman CV, jadwal interview, hingga negosiasi offering.
              </p>

              {/* Bespoke Editorial Feature Points */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#107c74] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Alur Kanban Terstruktur</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Pindahkan kartu lamaran dari Submitted, Technical Test, Interview, hingga Offering dengan mudah.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pengingat Jadwal & Follow-up</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Simpan tanggal wawancara, link Google Meet, dan batas waktu pengerjaan tugas tanpa risiko lupa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Analisis Platform & Callback Rate</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Ketahui apakah LinkedIn, Glints, atau JobStreet yang memberikan panggilan terbanyak untuk profilmu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Kanban Showcase (Interactive Preview) */}
            <div id="interactive-kanban" className="lg:col-span-7 space-y-4 scroll-mt-28">
              {/* CTA Instruksi Demo Tepat di Atas Kanban Preview - Centered with Radar / Ripple Motion */}
              <div className="flex justify-center items-center w-full">
                <div className="relative inline-flex items-center justify-center">
                  {/* Radar / Ripple Animation Rings */}
                  {!shouldReduceMotion && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-[#107c74]/40 pointer-events-none -z-10"
                        animate={{
                          scale: [1, 1.15, 1.35],
                          opacity: [0.6, 0.2, 0],
                        }}
                        transition={{
                          duration: 2.6,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-[#107c74]/30 pointer-events-none -z-10"
                        animate={{
                          scale: [1, 1.25, 1.5],
                          opacity: [0.45, 0.12, 0],
                        }}
                        transition={{
                          duration: 2.6,
                          delay: 0.85,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-[#107c74]/15 pointer-events-none -z-10"
                        animate={{
                          scale: [1, 1.08, 1.2],
                          opacity: [0.3, 0.08, 0],
                        }}
                        transition={{
                          duration: 2.6,
                          delay: 0.4,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    </>
                  )}

                  <a
                    href="#interactive-kanban"
                    onClick={scrollToKanban}
                    className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#e6faf7] hover:bg-teal-100/90 border border-teal-300/90 text-xs sm:text-sm font-bold text-[#107c74] text-center shadow-xs transition-colors select-none cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#107c74]/40"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#107c74] animate-pulse shrink-0" />
                    <span className="text-center">Penasaran cara kerjanya? Coba langsung di sini ↓</span>
                  </a>
                </div>
              </div>

              <InteractiveKanbanPreview />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FINANCE TRACKER: ALTERNATING ASYMMETRIC LAYOUT (Visual Left, Narrative Right) */}
      <section id="finance-preview" className="py-20 sm:py-28 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Visual Cashflow & Multi-rekening Showcase */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-7 shadow-xl shadow-slate-900/[0.04] space-y-5">
                {/* Total Balance Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Total Saldo Terkonsolidasi</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                      Rp 28.450.000
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 self-start sm:self-auto">
                    <ArrowUpRight size={14} />
                    <span>+12.4% vs bulan lalu</span>
                  </div>
                </div>

                {/* SVG Area Chart of 6-Month Cashflow */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Tren Pertumbuhan Arus Kas Bersih</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Surplus Kas 82%
                    </span>
                  </div>

                  <div className="relative w-full h-28 pt-2">
                    <svg viewBox="0 0 400 90" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="finGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#107c74" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#107c74" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="15" x2="400" y2="15" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="0" y1="45" x2="400" y2="45" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="0" y1="75" x2="400" y2="75" stroke="#e2e8f0" />

                      <path
                        d="M 10 65 Q 90 55, 170 40 T 260 25 T 340 18 T 390 12 L 390 75 L 10 75 Z"
                        fill="url(#finGradient)"
                      />
                      <path
                        d="M 10 65 Q 90 55, 170 40 T 260 25 T 340 18 T 390 12"
                        fill="none"
                        stroke="#107c74"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="340" cy="18" r="4.5" fill="#ffffff" stroke="#107c74" strokeWidth="2.5" />
                    </svg>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-2 mt-1">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span className="text-[#107c74] font-bold">Mei</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Account Breakdown Tiles */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <div className="text-[10px] text-slate-400 font-medium">BCA Operasional</div>
                    <div className="font-bold text-slate-900 mt-0.5">Rp 18.200.000</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <div className="text-[10px] text-slate-400 font-medium">Mandiri Tabungan</div>
                    <div className="font-bold text-slate-900 mt-0.5">Rp 8.750.000</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <div className="text-[10px] text-slate-400 font-medium">E-Wallet & Kas</div>
                    <div className="font-bold text-slate-900 mt-0.5">Rp 1.500.000</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Narrative Column */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <span className="w-6 h-px bg-emerald-600" />
                <span>02 / Finance Tracker</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Arus kas transparan. Ketenangan di setiap langkah hidup.
              </h3>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Kelola rekening bank, pantau pemasukan dari komisi atau gaji, dan kendalikan pengeluaran harian. Dukungan scan bukti transaksi berbasis OCR memudahkan pencatatan tanpa ribet.
              </p>

              {/* Bespoke Editorial Feature Points */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Manajemen Rekening Multi-Akun</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Pisahkan saldo rekening operasional, dana darurat, dan tabungan tanpa perlu menghitung berulang kali.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#107c74] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pindai Kuitansi Otomatis (OCR)</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Cukup upload foto bukti transfer atau struk pembelian, AI membaca nominal dan tanggal seketika.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pengawasan Batas Anggaran Bulanan</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Indikator visual saat kategori pengeluaran mendekati limit yang kamu tentukan sendiri.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SYNERGY TIMELINE / EDITORIAL PROGRESSION (No cards, pure architectural flow) */}
      <section className="py-20 sm:py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Sinergi Terpadu
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Satu siklus utuh untuk kemajuan finansial dan profesionalmu.
            </h3>
            <p className="text-slate-400 text-base sm:text-lg">
              Bagaimana Jobora menemani setiap fase perjalanan hidupmu dari waktu ke waktu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="text-3xl font-extrabold text-teal-400 font-mono">01</div>
              <h4 className="text-lg font-bold text-white">Lamar dengan Terarah</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pantau lowongan kerja impian, atur jadwal interview tanpa tumpang tindih, dan ukur daya tarik portofoliomu.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">02</div>
              <h4 className="text-lg font-bold text-white">Negosiasi Berbasis Realitas</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ketahui kebutuhan hidup riilmu dan ketahanan dana darurat, sehingga kamu siap menegosiasikan offering terbaik.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">03</div>
              <h4 className="text-lg font-bold text-white">Rayakan Pertumbuhan</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Alokasikan kenaikan gaji secara terstruktur ke tabungan dan investasi untuk masa depan yang lebih mapan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
