"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth/actions";
import styles from "./login.module.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await signIn(formData);
      if (result?.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      // In Next.js, redirect() throws an internal redirect error which should be re-thrown
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

      {/* Login Card */}
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>Masuk ke Jobora</h2>
          <p className={styles.subtitle}>
            Kelola progres lamaran kerjamu di satu tempat
          </p>
        </header>

        {/* Inline Error Banner */}
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

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="login-email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="login-email"
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
            <label className={styles.label} htmlFor="login-password">
              Kata Sandi <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Belum punya akun?{" "}
            <Link href="/register" className={styles.footerLink}>
              Daftar
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
