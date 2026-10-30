/**
 * Indonesian Rupiah and Date formatting utilities
 */

export function formatIDR(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);
}

export function formatIDRCompact(amount: number): string {
  const val = Math.abs(Number(amount) || 0);
  const sign = amount < 0 ? "-" : "";
  if (val >= 1_000_000_000) {
    return `${sign}Rp ${(val / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (val >= 1_000_000) {
    return `${sign}Rp ${(val / 1_000_000).toFixed(1).replace(".", ",")} Jt`;
  }
  if (val >= 1_000) {
    return `${sign}Rp ${(val / 1_000).toFixed(0)} Rb`;
  }
  return formatIDR(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day || 1);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateMonthIndo(yearMonthStr: string): string {
  if (!yearMonthStr) return "-";
  try {
    const [year, month] = yearMonthStr.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return yearMonthStr;
  }
}

/**
 * Format raw number or digit string with thousand separators (dots) for IDR
 * e.g. 250000 -> "250.000"
 */
export function formatThousand(val: number | string): string {
  const num = typeof val === "string" ? Number(val.replace(/\D/g, "")) : val;
  if (!num || isNaN(num)) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Parse a formatted string into numeric integer
 * e.g. "Rp 250.000" -> 250000
 */
export function parseRawDigits(val: string): number {
  const digits = String(val || "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Indonesian number to words conversion for clear reading of money amounts
 * e.g. 250000 -> "Dua Ratus Lima Puluh Ribu Rupiah"
 */
export function terbilangRupiah(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "";

  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  function bilang(n: number): string {
    if (n < 12) return satuan[n];
    if (n < 20) return bilang(n - 10) + " Belas";
    if (n < 100) return bilang(Math.floor(n / 10)) + " Puluh " + bilang(n % 10);
    if (n < 200) return "Seratus " + bilang(n - 100);
    if (n < 1000) return bilang(Math.floor(n / 100)) + " Ratus " + bilang(n % 100);
    if (n < 2000) return "Seribu " + bilang(n - 1000);
    if (n < 1000000) return bilang(Math.floor(n / 1000)) + " Ribu " + bilang(n % 1000);
    if (n < 1000000000) return bilang(Math.floor(n / 1000000)) + " Juta " + bilang(n % 1000000);
    if (n < 1000000000000) return bilang(Math.floor(n / 1000000000)) + " Miliar " + bilang(n % 1000000000);
    if (n < 1000000000000000) return bilang(Math.floor(n / 1000000000000)) + " Triliun " + bilang(n % 1000000000000);
    return "";
  }

  const result = bilang(Math.floor(num)).replace(/\s+/g, " ").trim();
  return result ? `${result} Rupiah` : "";
}
