"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";

interface LandingNavbarProps {
  user?: User | null;
}

export function LandingNavbar({ user }: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-100/90 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-none"
          aria-label="Jobora Home"
        >
          <Image
            src="/images/jobora-logo.svg"
            alt="Jobora"
            width={140}
            height={36}
            priority
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"
          aria-label="Navigasi Utama"
        >
          <a
            href="#features"
            className="hover:text-slate-900 transition-colors"
          >
            Fitur
          </a>
          <a
            href="#career-preview"
            className="hover:text-slate-900 transition-colors"
          >
            Career Tracker
          </a>
          <a
            href="#finance-preview"
            className="hover:text-slate-900 transition-colors"
          >
            Finance Tracker
          </a>
          <a
            href="https://tako.id/shials"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            Donasi
          </a>
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] shadow-sm hover:shadow transition-all"
            >
              <LayoutDashboard size={16} />
              <span>Buka Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] shadow-sm hover:shadow transition-all"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Fitur
            </a>
            <a
              href="#career-preview"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Career Tracker
            </a>
            <a
              href="#finance-preview"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Finance Tracker
            </a>
            <a
              href="https://tako.id/shials"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Donasi
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Buka Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#107c74] hover:bg-[#0d6861] transition-all"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
