"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signUp } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { AuthVisualHero } from "@/components/auth/AuthVisualHero";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        setErrorMessage("Gagal menghubungkan autentikasi. Silakan coba lagi.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 1. Mandatory fields check
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Semua kolom bertanda bintang (*) wajib diisi.");
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Format email tidak valid. Masukkan alamat email yang benar.");
      return;
    }

    // 3. Password minimum length check (Supabase requirement)
    if (password.length < 6) {
      setErrorMessage("Kata sandi harus terdiri dari minimal 6 karakter.");
      return;
    }

    // 4. Confirm password match check
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(formData);
      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else if (result?.success && result?.message) {
        setSuccessMessage(result.message);
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
            ? "Pendaftaran dengan Google belum diaktifkan di konfigurasi Supabase. Silakan mendaftar menggunakan email."
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
          className="inline-flex items-center justify-center mb-4 focus:outline-none"
          aria-label="Jobora Home"
        >
          <Image
            src="/images/jobora-logo.svg"
            alt="Jobora"
            width={175}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
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
          Buat Akun Jobora
        </h1>
        <p className="mt-1 text-sm text-[#526970] leading-relaxed">
          Mulai pantau dan kelola seluruh riwayat lamaran kerjamu.
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

      {/* Success Banner (e.g. Email Confirmation Required) */}
      {successMessage ? (
        <div
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-300"
          role="status"
        >
          <div className="flex items-center gap-2 font-bold text-base text-emerald-800 mb-2">
            <CheckCircle2 size={20} className="text-[#107c74]" />
            <span>Pendaftaran Berhasil!</span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-700">
            {successMessage}
          </p>
          <div className="mt-5">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-10 px-4 rounded-xl bg-[#107c74] text-white text-sm font-semibold hover:bg-[#0d6861] transition"
            >
              Menuju Halaman Masuk &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Google OAuth Option */}
          <GoogleAuthButton
            text="Daftar dengan Google"
            onClick={handleGoogleAuth}
            disabled={isLoading || isGoogleLoading}
            isLoading={isGoogleLoading}
          />

          {/* 2. Visual Divider */}
          <AuthDivider text="atau daftar dengan email" />

          {/* 3. Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="register-fullname"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="register-fullname"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="cth. Rian Pratama"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 px-3.5 rounded-xl border border-[#d8e2e9] bg-[#fbfcfd] focus:bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 focus:border-[#107c74] disabled:bg-gray-50 disabled:opacity-60 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                placeholder="nama@email.com"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 px-3.5 rounded-xl border border-[#d8e2e9] bg-[#fbfcfd] focus:bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 focus:border-[#107c74] disabled:bg-gray-50 disabled:opacity-60 transition"
              />
            </div>

            {/* Kata Sandi */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
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

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Konfirmasi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Ulangi kata sandi"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-[#d8e2e9] bg-[#fbfcfd] focus:bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#107c74]/20 focus:border-[#107c74] disabled:bg-gray-50 disabled:opacity-60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading || isGoogleLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition focus:outline-none cursor-pointer"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi kata sandi"
                      : "Tampilkan konfirmasi kata sandi"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
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
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <span>Daftar</span>
                )}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Footer Navigation */}
      <div className="mt-7 text-center">
        <p className="text-sm text-[#526970]">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#107c74] hover:text-[#0d6861] underline-offset-4 hover:underline transition"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] overflow-x-hidden">
      {/* Sisi Kiri: Split Screen Visual Hero Area */}
      <div className="hidden md:block md:w-5/12 lg:w-1/2 xl:w-[48%] shrink-0">
        <AuthVisualHero />
      </div>

      {/* Sisi Kanan: Area Form Autentikasi */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8 md:px-8 lg:px-14 xl:px-20 min-h-screen bg-white w-full">
        <RegisterForm />
      </div>
    </main>
  );
}
