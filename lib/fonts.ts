import { Manrope, Hanken_Grotesk } from "next/font/google";

/**
 * Dual-font setup — Jobora Design System v8
 * - Manrope   → heading (headline-lg/md/sm, stat-value, display-hero)
 * - Hanken Grotesk → body, label, caption
 *
 * Expose sebagai CSS variable (--font-manrope, --font-hanken-grotesk)
 * supaya bisa dipakai lewat token di styles/tokens.css, bukan
 * dipanggil langsung di tiap komponen.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});
