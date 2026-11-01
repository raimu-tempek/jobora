"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signIn } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { AuthVisualHero } from "@/components/auth/AuthVisualHero";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import {
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err === "oauth_error" || err === "oauth_failed") {
        setErrorMessage(
          "Gagal melakukan autentikasi dengan Google. Silakan coba kembali atau gunakan email dan kata sandi."
        );
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
      setErrorMessage("Email dan kata sandi wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Format email tidak valid. Masukkan alamat email yang benar.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(formData);
      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setErrorMessage("Terjadi kendala sistem. Silakan coba beberapa saat lagi.");
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(
          error.message.includes("provider is not enabled")
            ? "Masuk dengan Google belum diaktifkan di konfigurasi Supabase. Silakan masuk menggunakan email."
            : error.message
        );
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMessage("Gagal menghubungkan dengan Google. Silakan coba lagi.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Mobile Branding Header */}
      <div className="md:hidden flex flex-col items-center mb-6 text-center w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-3 focus:outline-none"
          aria-label="Jobora Home"
        >
          <div className="w-9 h-9 rounded-xl bg-[#107c74] text-white flex items-center justify-center shadow-xs">
            <Sparkles size={18} />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-[#107c74]">
            Jobora
          </span>
        </Link>
        <div className="w-full max-w-[320px] p-3 rounded-2xl bg-gradient-to-br from-[#0c534d] via-[#107c74] to-[#073934] text-white flex items-center gap-3 shadow-md">
          <div className="w-14 h-14 shrink-0 flex items-center justify-center">
            <Image
              src="/images/auth-hero-3d.png"
              alt="Ilustrasi Karier Jobora"
              width={80}
              height={80}
              className="w-full h-full object-contain drop-shadow"
              priority
            />
          </div>
          <div className="text-left pr-1">
            <p className="text-xs font-bold leading-tight">Karier Lebih Terarah</p>
            <p className="text-[11px] text-emerald-100/90 leading-snug mt-0.5">
              Pantau lamaran dan riwayat kariermu.
            </p>
          </div>
        </div>
      </div>

      {/* Form Header */}
      <div className="mb-6 text-left">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#132a30] font-heading tracking-tight">
          Selamat Datang Kembali
        </h1>
        <p className="mt-1 text-sm text-[#526970] leading-relaxed">
          Masuk ke akun Jobora untuk melanjutkan perjalanan kariermu.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
          role="alert"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* 1. Google OAuth Option */}
      <GoogleAuthButton
        text="Masuk dengan Google"
        onClick={handleGoogleAuth}
        disabled={isLoading || isGoogleLoading}
        isLoading={isGoogleLoading}
      />

      {/* 2. Visual Divider */}
      <AuthDivider text="atau masuk dengan email" />

      {/* 3. Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-gray-700 mb-1.5"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            spellCheck={false}
            placeholder="nama@email.com"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-11 px-3.5 rounded-xl border border-[#d8e2e9] bg-[#fbfcfd] focus:bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 focus:border-[#107c74] disabled:bg-gray-50 disabled:opacity-60 transition"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-gray-700 mb-1.5"
          >
            Kata Sandi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-[#d8e2e9] bg-[#fbfcfd] focus:bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 focus:border-[#107c74] disabled:bg-gray-50 disabled:opacity-60 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading || isGoogleLoading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition focus:outline-none cursor-pointer"
              aria-label={
                showPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-11 px-4 rounded-xl bg-[#107c74] hover:bg-[#0d6861] active:bg-[#09544e] text-white text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#107c74]/30"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="mt-7 text-center">
        <p className="text-sm text-[#526970]">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#107c74] hover:text-[#0d6861] underline-offset-4 hover:underline transition"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] overflow-x-hidden">
      {/* Sisi Kiri: Split Screen Visual Hero Area */}
      <div className="hidden md:block md:w-5/12 lg:w-1/2 xl:w-[48%] shrink-0">
        <AuthVisualHero />
      </div>

      {/* Sisi Kanan: Area Form Autentikasi */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8 md:px-8 lg:px-14 xl:px-20 min-h-screen bg-white w-full">
        <LoginForm />
      </div>
    </main>
  );
}
