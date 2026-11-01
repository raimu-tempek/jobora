"use client";

import Image from "next/image";

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
            <Image
              src="/images/jobora-logo.svg"
              alt="Jobora"
              width={112}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <p className="text-gray-500 font-normal">
            Kelola perjalanan kariermu dengan lebih terarah.
          </p>
        </div>

        {/* Sisi Kanan: Link Kritik dan Saran, Donasi & Hak Cipta */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={onOpenFeedback}
            className="text-xs font-semibold text-[#107c74] hover:text-[#0d6861] hover:underline underline-offset-4 transition cursor-pointer focus:outline-none"
            aria-label="Buka formulir Kritik dan Saran"
          >
            Kritik dan Saran
          </button>

          <span className="text-gray-300">•</span>

          <a
            href="https://tako.id/shials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#107c74] hover:text-[#0d6861] hover:underline underline-offset-4 transition cursor-pointer focus:outline-none"
            aria-label="Donasi untuk Jobora"
          >
            Donasi
          </a>

          <span className="text-gray-300">•</span>

          <span className="text-gray-400">
            © 2026 Jobora. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
