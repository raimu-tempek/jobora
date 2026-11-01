import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface CtaSectionProps {
  user?: User | null;
}

export function CtaSection({ user }: CtaSectionProps) {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-linear-to-br from-slate-900 via-[#0d2a2f] to-[#107c74] text-white p-8 sm:p-12 lg:p-16 text-center space-y-6 sm:space-y-8 overflow-hidden shadow-2xl shadow-slate-900/15">
          {/* Subtle Decorative Ambient Glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold">
            <Sparkles size={13} />
            <span>Gratis Digunakan Selamanya</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Mulai langkah pertamamu hari ini.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Biar setiap lamaran dan setiap rupiah tercatat rapi, membawamu semakin dekat dengan tujuan karier dan finansial impianmu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-lg transition-all"
              >
                <span>Buka Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-[#107c74] bg-white hover:bg-slate-100 shadow-lg transition-all"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                >
                  <span>Masuk</span>
                </Link>
              </>
            )}
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Data privat terisolasi penuh dengan Supabase Row-Level Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}
