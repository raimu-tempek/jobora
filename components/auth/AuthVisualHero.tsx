import Image from "next/image";
import Link from "next/link";
import { Sparkles, CheckCircle2, TrendingUp, Briefcase } from "lucide-react";

export function AuthVisualHero() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-full h-full p-10 xl:p-14 bg-gradient-to-br from-[#e6faf7]/80 via-[#f0fdf9] to-[#ffffff] border-r border-[#e2eaf0] overflow-hidden select-none">
      {/* Decorative background aura/circles */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[380px] h-[380px] rounded-full bg-[#107c74]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[340px] h-[340px] rounded-full bg-[#10b981]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top: Jobora Branding */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#107c74]/30 rounded-xl"
          aria-label="Kembali ke Beranda Jobora"
        >
          <div className="w-10 h-10 rounded-xl bg-[#107c74] text-white flex items-center justify-center shadow-md shadow-[#107c74]/20 group-hover:bg-[#0d6861] transition">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <span className="font-heading text-2xl font-bold tracking-tight text-[#107c74]">
              Jobora
            </span>
            <span className="block text-[11px] font-medium tracking-wide text-gray-500 uppercase -mt-1">
              Career & Finance Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Center: 3D Career Illustration & Floating Badges */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center">
        <div className="relative w-full max-w-[460px] aspect-[4/3] flex items-center justify-center">
          {/* Main 3D Asset */}
          <Image
            src="/images/auth-hero-3d.png"
            alt="Ilustrasi 3D Karier Jobora"
            width={520}
            height={420}
            priority
            className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 hover:scale-[1.02]"
          />

          {/* Floating Pill Badges for Aesthetic Depth */}
          <div className="absolute -top-1 left-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg shadow-black/5 border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-gray-800 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-6 h-6 rounded-full bg-[#e6faf7] flex items-center justify-center text-[#107c74]">
              <CheckCircle2 size={14} />
            </div>
            <span>Lamaran Terorganisir</span>
          </div>

          <div className="absolute -bottom-2 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg shadow-black/5 border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-gray-800 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp size={14} />
            </div>
            <span>Analisis Progres Karier</span>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/80 border border-[#e2eaf0] text-gray-600">
            <Briefcase size={12} className="text-[#107c74]" />
            Job Tracker
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/80 border border-[#e2eaf0] text-gray-600">
            <TrendingUp size={12} className="text-[#107c74]" />
            Budget & Scan Struk
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/80 border border-[#e2eaf0] text-gray-600">
            <CheckCircle2 size={12} className="text-[#107c74]" />
            Kanban Job Journey
          </span>
        </div>
      </div>

      {/* Bottom: Headline & Subtitle */}
      <div className="relative z-10 max-w-lg">
        <h2 className="text-2xl xl:text-3xl font-extrabold text-[#132a30] font-heading tracking-tight leading-snug">
          Langkah Baru untuk Karier yang Lebih Terarah.
        </h2>
        <p className="mt-2.5 text-sm xl:text-[15px] leading-relaxed text-gray-600">
          Pantau setiap tahapan lamaran kerja, kelola riwayat wawancara, dan atur
          keuangan pencarian kerjamu secara rapi dan profesional di Jobora.
        </p>
      </div>
    </div>
  );
}
