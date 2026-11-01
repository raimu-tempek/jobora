"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Briefcase,
  TrendingUp,
  Wallet,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Search,
  Layers,
  Settings,
  ChevronRight,
} from "lucide-react";

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<"overview" | "career" | "finance">("overview");

  // Mock demo dataset for illustrative visualization
  const careerStats = {
    totalApplications: 24,
    inProgress: 5,
    offers: 2,
    callbackRate: "75%",
  };

  const financeStats = {
    totalBalance: "Rp 28.450.000",
    monthlyIncome: "Rp 14.500.000",
    monthlyExpense: "Rp 5.250.000",
    netSavings: "+Rp 9.250.000",
  };

  const recentApplications = [
    {
      id: "app-1",
      company: "Google Indonesia",
      role: "Senior Frontend Lead",
      platform: "Glints",
      date: "1 Nov 2026",
      status: "Interview HR",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200/80",
      accent: "#8b5cf6",
      iconLetter: "G",
    },
    {
      id: "app-2",
      company: "Tokopedia (GoTo)",
      role: "Product Engineer",
      platform: "LinkedIn",
      date: "29 Okt 2026",
      status: "Offering",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      accent: "#10b981",
      iconLetter: "T",
    },
    {
      id: "app-3",
      company: "Traveloka",
      role: "Full Stack Engineer",
      platform: "JobStreet",
      date: "26 Okt 2026",
      status: "Technical Test",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200/80",
      accent: "#d97706",
      iconLetter: "Tr",
    },
    {
      id: "app-4",
      company: "Blibli.com",
      role: "UI/UX Engineer",
      platform: "LinkedIn",
      date: "24 Okt 2026",
      status: "Submitted",
      statusColor: "bg-teal-50 text-[#107c74] border-teal-200/80",
      accent: "#107c74",
      iconLetter: "B",
    },
  ];

  const recentTransactions = [
    {
      id: "tx-1",
      title: "Gaji Tech Corp",
      account: "Bank BCA",
      category: "Gaji & Kompensasi",
      amount: "+Rp 12.000.000",
      type: "income",
      date: "Hari ini",
    },
    {
      id: "tx-2",
      title: "Commis Design UI",
      account: "Bank Jago",
      category: "Freelance",
      amount: "+Rp 2.500.000",
      type: "income",
      date: "Kemarin",
    },
    {
      id: "tx-3",
      title: "Figma Professional Sub",
      account: "Kartu Kredit",
      category: "Tools & Software",
      amount: "-Rp 240.000",
      type: "expense",
      date: "30 Okt",
    },
    {
      id: "tx-4",
      title: "Alokasi Rekening Darurat",
      account: "BCA → Mandiri",
      category: "Transfer",
      amount: "Rp 1.500.000",
      type: "transfer",
      date: "28 Okt",
    },
  ];

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/[0.08] ring-1 ring-slate-900/[0.04] overflow-hidden transition-all duration-300 hover:shadow-indigo-950/[0.12]">
      {/* Window Titlebar / Chrome */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between gap-4 select-none">
        {/* Traffic Light Dots */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-400/90 border border-rose-500/30" />
          <span className="w-3 h-3 rounded-full bg-amber-400/90 border border-amber-500/30" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/90 border border-emerald-500/30" />
          <div className="hidden sm:flex items-center gap-2 ml-3 pl-3 border-l border-slate-200 text-xs font-medium text-slate-500">
            <Image
              src="/images/jobora-logo.svg"
              alt="Jobora"
              width={75}
              height={18}
              className="h-4 w-auto object-contain"
            />
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-mono text-[11px]">app.jobora.id</span>
          </div>
        </div>

        {/* Mock Search Bar */}
        <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-400 shadow-xs">
          <Search size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">Cari lamaran, transaksi, rekening...</span>
          <kbd className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>

        {/* User Pill / Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-linear-to-tr from-[#107c74] to-teal-400 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            U
          </div>
        </div>
      </div>

      {/* Window Body: Sidebar + Main Content */}
      <div className="flex min-h-[580px] bg-slate-50/50">
        {/* Mini Sidebar */}
        <aside className="w-48 sm:w-56 shrink-0 bg-white border-r border-slate-100 p-4 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu Utama
              </span>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "overview"
                    ? "bg-[#e6faf7] text-[#107c74] shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={16} />
                  <span>Overview</span>
                </div>
                {activeTab === "overview" && <ChevronRight size={13} />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("career")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "career"
                    ? "bg-[#e6faf7] text-[#107c74] shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase size={16} />
                  <span>Career Tracker</span>
                </div>
                <span className="text-[10px] bg-teal-100 text-[#107c74] px-1.5 py-0.5 rounded-full font-bold">
                  {careerStats.totalApplications}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("finance")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "finance"
                    ? "bg-[#e6faf7] text-[#107c74] shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet size={16} />
                  <span>Finance Tracker</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  +18%
                </span>
              </button>

              <div className="pt-2">
                <span className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400">
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </span>
              </div>
            </nav>
          </div>

          {/* Bottom Sidebar Card: Pro Account Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#107c74] text-white">
                <Sparkles size={12} />
              </span>
              <span className="text-xs font-bold text-slate-800">Jobora Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Karier dan finansial terpadu dalam satu kontrol aman.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-5 overflow-x-hidden">
          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Selamat datang kembali! 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Berikut ringkasan progres karier dan finansial terbarumu hari ini.
              </p>
            </div>

            {/* Quick Actions (Demo only) */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                <Calendar size={13} className="text-[#107c74]" />
                <span>Nov 2026</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#107c74] text-white shadow-xs">
                <span>+ Lamaran Baru</span>
              </span>
            </div>
          </div>

          {/* Top 4 KPI Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Total Applications */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Total Lamaran</span>
                <span className="p-1.5 rounded-lg bg-teal-50 text-[#107c74]">
                  <Briefcase size={14} />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                {careerStats.totalApplications}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ArrowUpRight size={12} />
                <span>+4 minggu ini</span>
              </div>
            </div>

            {/* Metric 2: Active Pipeline */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Interview Aktif</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Calendar size={14} />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                {careerStats.inProgress}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold">
                <span>2 penawaran siap review</span>
              </div>
            </div>

            {/* Metric 3: Total Balance */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Total Saldo</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Wallet size={14} />
                </span>
              </div>
              <div className="text-base sm:text-xl font-extrabold text-slate-900 truncate tabular-nums">
                {financeStats.totalBalance}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ArrowUpRight size={12} />
                <span>+12.4% MoM</span>
              </div>
            </div>

            {/* Metric 4: Net Surplus */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Surplus Arus Kas</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp size={14} />
                </span>
              </div>
              <div className="text-base sm:text-xl font-extrabold text-emerald-700 truncate tabular-nums">
                {financeStats.netSavings}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span>Tabungan 64%</span>
              </div>
            </div>
          </div>

          {/* Two-Column Core Modules: Career Tracker (Left) & Finance Tracker (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Module: Career Tracker Activity */}
            <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-50 text-[#107c74]">
                    <Briefcase size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Aktivitas Lamaran Terkini
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Status terkini dari tahapan rekrutmen aktif
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#107c74] hover:underline cursor-pointer">
                  Lihat Semua (24)
                </span>
              </div>

              {/* Pipeline Funnel Mini Indicator */}
              <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-center select-none">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Submitted</div>
                  <div className="text-xs font-bold text-slate-800">12</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Test/Task</div>
                  <div className="text-xs font-bold text-amber-600">5</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Interview</div>
                  <div className="text-xs font-bold text-purple-600">5</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Offering</div>
                  <div className="text-xs font-bold text-emerald-600">2</div>
                </div>
              </div>

              {/* Recent Applications List */}
              <div className="space-y-2">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="group p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initial */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: app.accent }}
                      >
                        {app.iconLetter}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#107c74] transition-colors">
                          {app.company}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                          <span>{app.role}</span>
                          <span>•</span>
                          <span className="text-slate-400">{app.platform}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${app.statusColor}`}
                      >
                        {app.status}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {app.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Module: Finance Tracker Chart & Transactions */}
            <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Arus Kas & Rekening
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pertumbuhan saldo & surplus 6 bulan
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Surplus +64%
                </span>
              </div>

              {/* Custom SVG Line & Area Chart */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Trend Kas Masuk vs Keluar</span>
                  <span className="text-[11px] font-mono font-medium text-slate-500">Rp Juta</span>
                </div>

                <div className="relative w-full h-32">
                  {/* SVG Chart with Smooth Bezier & Gradient */}
                  <svg
                    viewBox="0 0 340 110"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#107c74" stopOpacity="0.28" />
                        <stop offset="85%" stopColor="#107c74" stopOpacity="0.02" />
                        <stop offset="100%" stopColor="#107c74" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2="340" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="0" y1="55" x2="340" y2="55" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="340" y2="90" stroke="#e2e8f0" />

                    {/* Area Fill */}
                    <path
                      d="M 10 75 Q 70 65, 130 50 T 210 32 T 280 20 T 330 15 L 330 90 L 10 90 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Smooth Line Curve */}
                    <path
                      d="M 10 75 Q 70 65, 130 50 T 210 32 T 280 20 T 330 15"
                      fill="none"
                      stroke="#107c74"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Highlight Marker on Peak Point (Mei) */}
                    <circle cx="280" cy="20" r="5" fill="#ffffff" stroke="#107c74" strokeWidth="2.5" />
                    <circle cx="280" cy="20" r="8" fill="#107c74" fillOpacity="0.18" />
                  </svg>

                  {/* Floating Chart Tooltip Tag */}
                  <div className="absolute top-0 right-10 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Mei: Rp 14.5M</span>
                  </div>

                  {/* Month labels */}
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

              {/* Recent Transactions List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mutasi Terbaru
                </span>
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{tx.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {tx.account} • {tx.category}
                      </div>
                    </div>
                    <div
                      className={`font-bold tabular-nums text-right ${
                        tx.type === "income"
                          ? "text-emerald-600"
                          : tx.type === "expense"
                          ? "text-rose-600"
                          : "text-slate-700"
                      }`}
                    >
                      {tx.amount}
                      <span className="block text-[9px] font-normal text-slate-400">{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
