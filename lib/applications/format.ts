/**
 * Maps DB status value to presentation display label per PRD-JobTracker.md.
 * Only three differ:
 *   Test     → "Technical Test"
 *   Task     → "Take Home Task"
 *   Offering → "Offering Received"
 * All other statuses display as-is.
 */
export const STATUS_LABELS: Record<string, string> = {
  Submitted: "Submitted",
  Test: "Technical Test",
  Task: "Take Home Task",
  "Interview HR": "Interview HR",
  "Interview User": "Interview User",
  LGD: "LGD",
  FGD: "FGD",
  Offering: "Offering Received",
  Rejected: "Rejected",
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Compares column status with application status with synonym & case resilience.
 */
export function isStatusActive(colStatus: string, appStatus: string): boolean {
  if (colStatus === appStatus) return true;
  const colNorm = (colStatus || "").trim().toLowerCase();
  const appNorm = (appStatus || "").trim().toLowerCase();
  if (colNorm === appNorm) return true;
  if (
    (colNorm === "offering" || colNorm === "offering received") &&
    (appNorm === "offering" || appNorm === "offering received")
  ) {
    return true;
  }
  if (
    (colNorm === "test" || colNorm === "technical test") &&
    (appNorm === "test" || appNorm === "technical test")
  ) {
    return true;
  }
  if (
    (colNorm === "task" || colNorm === "take home task") &&
    (appNorm === "task" || appNorm === "take home task")
  ) {
    return true;
  }
  return false;
}

/**
 * Returns true if status is active / still in progress:
 * Submitted, Test, Task, Interview HR, Interview User, LGD, FGD
 * (everything except Offering and Rejected).
 */
export function isActiveStatus(status: string): boolean {
  return (
    status === "Submitted" ||
    status === "Test" ||
    status === "Task" ||
    status === "Interview HR" ||
    status === "Interview User" ||
    status === "LGD" ||
    status === "FGD"
  );
}

/**
 * Returns true if status is in the Interview stage:
 * Interview HR, Interview User, LGD, FGD.
 */
export function isInterviewStatus(status: string): boolean {
  return (
    status === "Interview HR" ||
    status === "Interview User" ||
    status === "LGD" ||
    status === "FGD"
  );
}

/**
 * Returns true if status is in the Test & Task group:
 * Test, Task.
 */
export function isTestTaskGroup(status: string): boolean {
  return status === "Test" || status === "Task";
}

/**
 * Returns true if status is in the Interview group (for Status Breakdown):
 * same as isInterviewStatus.
 */
export function isInterviewGroup(status: string): boolean {
  return isInterviewStatus(status);
}

const INDONESIAN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Formats a YYYY-MM-DD or ISO date string into Indonesian readable format, e.g. "8 Okt 2025".
 */
export function formatDate(dateInput: string | Date): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  // Extract date components in UTC/local safely
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const [y, m, day] = dateInput.split("T")[0].split("-");
    const mIdx = parseInt(m, 10) - 1;
    return `${parseInt(day, 10)} ${INDONESIAN_MONTHS[mIdx] || m} ${y}`;
  }

  const day = d.getDate();
  const month = INDONESIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  januari: "01",
  january: "01",
  feb: "02",
  februari: "02",
  february: "02",
  mar: "03",
  maret: "03",
  march: "03",
  apr: "04",
  april: "04",
  mei: "05",
  may: "05",
  jun: "06",
  juni: "06",
  june: "06",
  jul: "07",
  juli: "07",
  july: "07",
  agu: "08",
  agt: "08",
  agustus: "08",
  aug: "08",
  august: "08",
  sep: "09",
  september: "09",
  okt: "10",
  oktober: "10",
  oct: "10",
  october: "10",
  nov: "11",
  nop: "11",
  november: "11",
  des: "12",
  desember: "12",
  dec: "12",
  december: "12",
};

/**
 * Normalizes any user-input date (DD-Mon-YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
 * to ISO YYYY-MM-DD for PostgreSQL.
 */
export function normalizeDateToISO(input: string): string {
  if (!input) {
    return new Date().toISOString().split("T")[0];
  }

  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Split by common delimiters: -, /, ., or whitespace
  const parts = trimmed.split(/[/.\s-]+/).filter(Boolean);

  if (parts.length === 3) {
    const p0 = parts[0];
    const p1 = parts[1];
    const p2 = parts[2];

    const m0 = MONTH_MAP[p0.toLowerCase()];
    const m1 = MONTH_MAP[p1.toLowerCase()];

    // Case 1: DD-Mon-YYYY (e.g. 02-Agu-2026, 23-Sep-2026)
    if (m1 && p2.length === 4) {
      return `${p2}-${m1}-${p0.padStart(2, "0")}`;
    }

    // Case 2: Mon-DD-YYYY (e.g. Agu-02-2026, Aug 02 2026)
    if (m0 && p2.length === 4) {
      return `${p2}-${m0}-${p1.padStart(2, "0")}`;
    }

    // Case 3: YYYY-Mon-DD (e.g. 2026-Agu-02)
    if (p0.length === 4 && m1) {
      return `${p0}-${m1}-${p2.padStart(2, "0")}`;
    }

    // Case 4: Numeric YYYY/MM/DD or YYYY-MM-DD
    if (p0.length === 4 && /^\d+$/.test(p1) && /^\d+$/.test(p2)) {
      return `${p0}-${p1.padStart(2, "0")}-${p2.padStart(2, "0")}`;
    }

    // Case 5: Numeric DD/MM/YYYY or DD-MM-YYYY
    if (/^\d+$/.test(p0) && /^\d+$/.test(p1) && p2.length === 4) {
      return `${p2}-${p1.padStart(2, "0")}-${p0.padStart(2, "0")}`;
    }
  }

  // Fallback: try JS Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return new Date().toISOString().split("T")[0];
}
