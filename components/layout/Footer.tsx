"use client";

import { MessageSquarePlus } from "lucide-react";

export interface FooterProps {
  onOpenFeedback?: () => void;
}

export function Footer({ onOpenFeedback }: FooterProps) {
  return (
    <footer className="w-full bg-white border-t border-[#e2eaf0] py-6 px-4 sm:px-6 lg:px-8 mt-auto select-none">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        {/* Sisi Kiri: Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#107c74] to-[#0d6861] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              J
            </div>
            <span className="font-heading font-bold text-sm tracking-tight text-[#107c74]">
              Jobora
            </span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <p className="text-gray-500 font-normal">
            Kelola perjalanan kariermu dengan lebih terarah.
          </p>
        </div>

        {/* Sisi Kanan: Link Kritik & Saran & Hak Cipta */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={onOpenFeedback}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#107c74] hover:text-[#0d6861] hover:underline underline-offset-4 transition cursor-pointer focus:outline-none"
            aria-label="Buka formulir Kritik dan Saran"
          >
            <MessageSquarePlus size={14} className="text-[#107c74]" />
            <span>Kritik & Saran</span>
          </button>

          <span className="text-gray-300">•</span>

          <span className="text-gray-400">
            © 2026 Jobora. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
