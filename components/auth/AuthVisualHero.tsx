import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, TrendingUp, Briefcase } from "lucide-react";

export function AuthVisualHero() {
  return (
    <div className="relative hidden md:flex flex-col justify-between w-full h-full min-h-screen p-8 lg:p-10 xl:p-14 bg-gradient-to-br from-[#0c534d] via-[#107c74] to-[#073934] text-white border-r border-[#0d6861]/30 overflow-hidden select-none">
      {/* Luminous decorative glow behind the illustration */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#34d399]/20 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[#10b981]/15 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top: Jobora Branding */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center group focus:outline-none focus:ring-2 focus:ring-white/40 rounded-2xl"
          aria-label="Kembali ke Beranda Jobora"
        >
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg shadow-black/15 border border-white/60 flex items-center transition-transform group-hover:scale-[1.02]">
            <Image
              src="/images/jobora-logo.svg"
              alt="Jobora"
              width={160}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Center: 3D Career Illustration & Floating Badges */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center">
        <div className="relative w-full max-w-[400px] aspect-[4/3] flex items-center justify-center">
          {/* Main 3D Asset */}
          <Image
            src="/images/auth-hero-3d.png"
            alt="Ilustrasi 3D Karier Jobora"
            width={520}
            height={420}
            priority
            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:scale-[1.02]"
          />

          {/* Floating Pill Badges */}
          <div className="absolute top-2 -left-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl shadow-black/15 border border-white/60 flex items-center gap-2 text-xs font-semibold text-gray-800">
            <div className="w-5 h-5 rounded-full bg-[#e6faf7] flex items-center justify-center text-[#107c74]">
              <CheckCircle2 size={13} />
            </div>
            <span>Lamaran Terorganisir</span>
          </div>

          <div className="absolute -bottom-2 -right-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl shadow-black/15 border border-white/60 flex items-center gap-2 text-xs font-semibold text-gray-800">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp size={13} />
            </div>
            <span>Analisis Progres Karier</span>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex items-center gap-2 mt-6 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md border border-white/15 text-emerald-50">
            <Briefcase size={12} className="text-emerald-300" />
            Job Tracker
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md border border-white/15 text-emerald-50">
            <TrendingUp size={12} className="text-emerald-300" />
            Budget & Scan Struk
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md border border-white/15 text-emerald-50">
            <CheckCircle2 size={12} className="text-emerald-300" />
            Kanban Job Journey
          </span>
        </div>
      </div>

      {/* Bottom: Headline & Subtitle */}
      <div className="relative z-10 max-w-md pb-6 xl:pb-8">
        <h2 className="text-2xl xl:text-[28px] font-extrabold text-white font-heading tracking-tight leading-snug drop-shadow-xs">
          Langkah Baru untuk Karier yang Lebih Terarah.
        </h2>
        <p className="mt-2 text-sm xl:text-[15px] leading-relaxed text-emerald-100/90 font-normal">
          Pantau setiap tahapan lamaran kerja, kelola riwayat wawancara, dan atur
          keuangan pencarian kerjamu secara rapi dan profesional di Jobora.
        </p>
      </div>
    </div>
  );
}
