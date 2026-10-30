"use client";

import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth/actions";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validations
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi harus terdiri dari minimal 6 karakter.");
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
      // Re-throw internal Next.js redirect errors
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setErrorMessage("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* Brand Wordmark & Icon */}
      <Link href="/" className={styles.brand} aria-label="Jobora Home">
        <div className={styles.brandIconBox}>
          <span
            className={`material-symbols-outlined ${styles.brandIcon}`}
            aria-hidden="true"
          >
            auto_awesome
          </span>
        </div>
        <span className={styles.brandText}>Jobora</span>
      </Link>

      {/* Register Card */}
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>Buat Akun Jobora</h2>
          <p className={styles.subtitle}>
            Mulai pantau dan kelola seluruh riwayat lamaran kerjamu
          </p>
        </header>

        {/* Error Banner */}
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <span
              className={`material-symbols-outlined ${styles.errorIcon}`}
              aria-hidden="true"
            >
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Confirmation Banner (if email verification required) */}
        {successMessage ? (
          <div className={styles.successBanner} role="status">
            <div className={styles.successHeader}>
              <span
                className={`material-symbols-outlined ${styles.successIcon}`}
                aria-hidden="true"
              >
                check_circle
              </span>
              <span>Pendaftaran Berhasil</span>
            </div>
            <p className={styles.successMessage}>{successMessage}</p>
            <div style={{ marginTop: "12px" }}>
              <Link href="/login" className={styles.footerLink}>
                Kembali ke Halaman Masuk →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Nama Lengkap */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="register-name">
                Nama Lengkap <span className={styles.required}>*</span>
              </label>
              <input
                id="register-name"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="cth. Rian Pratama"
                className={styles.input}
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="register-email">
                Email <span className={styles.required}>*</span>
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                className={styles.input}
              />
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="register-password">
                Kata Sandi <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  className={`${styles.input} ${styles.inputWithToggle}`}
                />
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  <span
                    className={`material-symbols-outlined ${styles.toggleIcon}`}
                    aria-hidden="true"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="register-confirm-password">
                Konfirmasi Kata Sandi <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Ulangi kata sandi"
                  className={`${styles.input} ${styles.inputWithToggle}`}
                />
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi kata sandi"
                      : "Tampilkan konfirmasi kata sandi"
                  }
                >
                  <span
                    className={`material-symbols-outlined ${styles.toggleIcon}`}
                    aria-hidden="true"
                  >
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>
        )}

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Sudah punya akun?{" "}
            <Link href="/login" className={styles.footerLink}>
              Masuk
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
