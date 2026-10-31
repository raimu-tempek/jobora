import { Application } from "@/types/application";

export type ActivityPeriodFilter =
  | "30_days"
  | "12_months"
  | "this_year"
  | "last_year"
  | "all_time";

export interface ActivitySeriesPoint {
  date: Date | string;
  label: string;
  applications: number;
  responses: number;
  callbacks: number;
  [key: string]: unknown;
}

export interface SparklinePoint {
  value: number;
}

export interface DashboardTopStats {
  totalApplications: {
    value: number;
    subtext: string;
    sparkline: SparklinePoint[];
  };
  callbackRate: {
    percentage: number;
    subtext: string;
    sparkline: SparklinePoint[];
  };
  interviewRate: {
    percentage: number;
    subtext: string;
    sparkline: SparklinePoint[];
  };
  activePipeline: {
    value: number;
    subtext: string;
    sparkline: SparklinePoint[];
  };
  offers: {
    value: number;
    percentage: number;
    subtext: string;
    sparkline: SparklinePoint[];
  };
  thisWeek: {
    value: number;
    subtext: string;
    sparkline: SparklinePoint[];
  };
}

export interface PipelineStageItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ClosureReasonItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Checks if a status indicates a response was received from the company
 * (anything beyond purely submitted / waiting)
 */
export function isRespondedStatus(status: string): boolean {
  const norm = (status || "").toLowerCase().trim();
  if (!norm || norm === "submitted" || norm === "applied") {
    return false;
  }
  return true;
}

/**
 * Checks if status indicates an actual callback (interview, test, task, offer)
 */
export function isCallbackStatus(status: string): boolean {
  const norm = (status || "").toLowerCase().trim();
  if (
    norm.includes("interview") ||
    norm.includes("test") ||
    norm.includes("task") ||
    norm.includes("lgd") ||
    norm.includes("fgd") ||
    norm.includes("screen") ||
    norm.includes("assessment") ||
    norm.includes("offer")
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if status is closed (Rejected, Ghosted, Withdrawn)
 */
export function isClosedStatus(status: string): boolean {
  const norm = (status || "").toLowerCase().trim();
  return (
    norm.includes("reject") ||
    norm.includes("tolak") ||
    norm.includes("ghost") ||
    norm.includes("withdraw") ||
    norm.includes("batal")
  );
}

/**
 * Computes the 6 top KPI cards with sparkline trends
 */
export function computeDashboardTopStats(applications: Application[]): DashboardTopStats {
  const total = applications.length;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Current month count
  let thisMonthCount = 0;
  for (const app of applications) {
    if (app.date) {
      const d = new Date(app.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        thisMonthCount++;
      }
    }
  }

  // Responded count
  let respondedCount = 0;
  let interviewCount = 0;
  let activeCount = 0;
  let offerCount = 0;

  for (const app of applications) {
    const s = app.status || "";
    const isClosed = isClosedStatus(s);

    if (isRespondedStatus(s)) {
      respondedCount++;
    }
    if (
      s.toLowerCase().includes("interview") ||
      s.toLowerCase().includes("lgd") ||
      s.toLowerCase().includes("fgd") ||
      s.toLowerCase().includes("offer")
    ) {
      interviewCount++;
    }
    if (!isClosed && !s.toLowerCase().includes("offer")) {
      activeCount++;
    }
    if (s.toLowerCase().includes("offer")) {
      offerCount++;
    }
  }

  const callbackRatePct = total > 0 ? Math.round((respondedCount / total) * 100) : 0;
  const interviewRatePct = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
  const offerRatePct = total > 0 ? Math.round((offerCount / total) * 100) : 0;

  // This Week (last 7 days or current calendar week)
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const weekStart = new Date(now.getTime() - 7 * MS_PER_DAY);
  let thisWeekCount = 0;

  for (const app of applications) {
    if (app.date) {
      const t = new Date(app.date).getTime();
      if (t >= weekStart.getTime() && t <= now.getTime()) {
        thisWeekCount++;
      }
    }
  }

  // Helper to build 6-month monthly trend for long-term KPIs
  const buildMonthlyTrend = (filterFn: (app: Application) => boolean): SparklinePoint[] => {
    const points: SparklinePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(currentYear, currentMonth - i, 1);
      const y = targetMonth.getFullYear();
      const m = targetMonth.getMonth();

      let count = 0;
      for (const app of applications) {
        if (app.date && filterFn(app)) {
          const d = new Date(app.date);
          if (d.getFullYear() === y && d.getMonth() === m) {
            count++;
          }
        }
      }
      points.push({ value: count });
    }
    return points;
  };

  // Helper to build 7-day daily trend for recent week KPI
  const buildDailyTrend = (filterFn: (app: Application) => boolean): SparklinePoint[] => {
    const points: SparklinePoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * MS_PER_DAY);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY - 1);

      let count = 0;
      for (const app of applications) {
        if (app.date && filterFn(app)) {
          const t = new Date(app.date).getTime();
          if (t >= dayStart.getTime() && t <= dayEnd.getTime()) {
            count++;
          }
        }
      }
      points.push({ value: count });
    }
    return points;
  };

  return {
    totalApplications: {
      value: total,
      subtext: `${thisMonthCount} lamaran bulan ini`,
      sparkline: buildMonthlyTrend(() => true),
    },
    callbackRate: {
      percentage: callbackRatePct,
      subtext: `${respondedCount} dari ${total} direspons`,
      sparkline: buildMonthlyTrend((a) => isRespondedStatus(a.status)),
    },
    interviewRate: {
      percentage: interviewRatePct,
      subtext: `${interviewCount} mencapai interview`,
      sparkline: buildMonthlyTrend((a) =>
        (a.status || "").toLowerCase().includes("interview") ||
        (a.status || "").toLowerCase().includes("lgd") ||
        (a.status || "").toLowerCase().includes("fgd")
      ),
    },
    activePipeline: {
      value: activeCount,
      subtext: `${activeCount} proses rekrutmen`,
      sparkline: buildMonthlyTrend((a) => !isClosedStatus(a.status)),
    },
    offers: {
      value: offerCount,
      percentage: offerRatePct,
      subtext: `${offerRatePct}% dari total lamaran`,
      sparkline: buildMonthlyTrend((a) =>
        (a.status || "").toLowerCase().includes("offer")
      ),
    },
    thisWeek: {
      value: thisWeekCount,
      subtext: `7 hari terakhir`,
      sparkline: buildDailyTrend(() => true),
    },
  };
}

/**
 * Computes Activity chart multi-series data for the requested period
 */
export function computeActivitySeries(
  applications: Application[],
  period: ActivityPeriodFilter
): ActivitySeriesPoint[] {
  const now = new Date();
  const points: ActivitySeriesPoint[] = [];

  const MONTH_NAMES = [
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

  if (period === "30_days") {
    // 30 consecutive days
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * MS_PER_DAY);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      const label = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;

      let apps = 0;
      let resps = 0;
      let callbacks = 0;

      for (const app of applications) {
        if (!app.date) continue;
        const appDateStr = app.date.split("T")[0];
        if (appDateStr === dateStr) {
          apps++;
          if (isRespondedStatus(app.status)) resps++;
          if (isCallbackStatus(app.status)) callbacks++;
        }
      }

      points.push({
        date: d,
        label,
        applications: apps,
        responses: resps,
        callbacks,
      });
    }
    return points;
  }

  if (period === "12_months" || period === "all_time") {
    // 12 months ending at current month
    const monthsCount = period === "all_time" ? 24 : 12;
    let startYear = now.getFullYear();
    let startMonth = now.getMonth() - (monthsCount - 1);
    while (startMonth < 0) {
      startMonth += 12;
      startYear -= 1;
    }

    let y = startYear;
    let m = startMonth;

    for (let i = 0; i < monthsCount; i++) {
      const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
      const label = `${MONTH_NAMES[m]} ${y !== now.getFullYear() ? `'${String(y).slice(-2)}` : ""}`;
      const dateObj = new Date(y, m, 1);

      let apps = 0;
      let resps = 0;
      let callbacks = 0;

      for (const app of applications) {
        if (!app.date) continue;
        const appKey = app.date.slice(0, 7);
        if (appKey === monthKey) {
          apps++;
          if (isRespondedStatus(app.status)) resps++;
          if (isCallbackStatus(app.status)) callbacks++;
        }
      }

      points.push({
        date: dateObj,
        label,
        applications: apps,
        responses: resps,
        callbacks,
      });

      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return points;
  }

  if (period === "this_year" || period === "last_year") {
    const targetYear = period === "this_year" ? now.getFullYear() : now.getFullYear() - 1;

    for (let m = 0; m < 12; m++) {
      const monthKey = `${targetYear}-${String(m + 1).padStart(2, "0")}`;
      const label = MONTH_NAMES[m];
      const dateObj = new Date(targetYear, m, 1);

      let apps = 0;
      let resps = 0;
      let callbacks = 0;

      for (const app of applications) {
        if (!app.date) continue;
        const appKey = app.date.slice(0, 7);
        if (appKey === monthKey) {
          apps++;
          if (isRespondedStatus(app.status)) resps++;
          if (isCallbackStatus(app.status)) callbacks++;
        }
      }

      points.push({
        date: dateObj,
        label,
        applications: apps,
        responses: resps,
        callbacks,
      });
    }
    return points;
  }

  return points;
}

/**
 * Computes Active Pipeline Status items across 6 standard stages
 */
export function computeActivePipelineStatus(applications: Application[]): {
  items: PipelineStageItem[];
  totalActive: number;
} {
  const STAGES: { key: string; label: string; color: string; match: (s: string) => boolean }[] = [
    {
      key: "submitted",
      label: "Lamaran Terkirim (Submitted)",
      color: "#107c74",
      match: (s) => s === "submitted" || s === "applied" || s === "",
    },
    {
      key: "screen",
      label: "Screening HR",
      color: "#0d9488",
      match: (s) => s.includes("screen") || s.includes("recruiter"),
    },
    {
      key: "test",
      label: "Tes & Tugas Teknis",
      color: "#ea580c",
      match: (s) => s.includes("test") || s.includes("task") || s.includes("assessment"),
    },
    {
      key: "interview",
      label: "Wawancara (Interview)",
      color: "#8b5cf6",
      match: (s) =>
        s.includes("interview hr") ||
        s.includes("hr interview") ||
        s.includes("lgd") ||
        s.includes("fgd") ||
        (s.includes("interview") && !s.includes("user") && !s.includes("final")),
    },
    {
      key: "final_interview",
      label: "Wawancara Akhir (User)",
      color: "#6366f1",
      match: (s) =>
        s.includes("interview user") ||
        s.includes("user interview") ||
        s.includes("final") ||
        s.includes("panel") ||
        s.includes("management"),
    },
    {
      key: "offering",
      label: "Penawaran Kerja (Offering)",
      color: "#10b981",
      match: (s) => s.includes("offer"),
    },
  ];

  // Filter out closed applications
  const activeApplications = applications.filter((app) => !isClosedStatus(app.status));
  const totalActive = activeApplications.length;

  const stageCounts: Record<string, number> = {};
  for (const st of STAGES) stageCounts[st.key] = 0;

  for (const app of activeApplications) {
    const s = (app.status || "").toLowerCase().trim();
    let matched = false;

    for (const st of STAGES) {
      if (st.match(s)) {
        stageCounts[st.key]++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      stageCounts["submitted"]++;
    }
  }

  const items: PipelineStageItem[] = STAGES.map((st) => {
    const count = stageCounts[st.key];
    const percentage = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
    return {
      key: st.key,
      label: st.label,
      count,
      percentage,
      color: st.color,
    };
  });

  return { items, totalActive };
}

/**
 * Computes Closure Reasons (Rejected, Ghosted, Withdrawn)
 */
export function computeClosureReasons(applications: Application[]): {
  items: ClosureReasonItem[];
  totalClosed: number;
} {
  let rejected = 0;
  let ghosted = 0;
  let withdrawn = 0;

  for (const app of applications) {
    const s = (app.status || "").toLowerCase().trim();
    if (s.includes("reject") || s.includes("tolak")) {
      rejected++;
    } else if (s.includes("ghost") || s.includes("no response") || s.includes("hilang")) {
      ghosted++;
    } else if (s.includes("withdraw") || s.includes("batal") || s.includes("mundur")) {
      withdrawn++;
    }
  }

  const totalClosed = rejected + ghosted + withdrawn;

  const items: ClosureReasonItem[] = [
    {
      key: "rejected",
      label: "Ditolak (Rejected)",
      count: rejected,
      percentage: totalClosed > 0 ? Math.round((rejected / totalClosed) * 100) : 0,
      color: "#ef4444",
    },
    {
      key: "ghosted",
      label: "Tidak Ada Kabar (Ghosted)",
      count: ghosted,
      percentage: totalClosed > 0 ? Math.round((ghosted / totalClosed) * 100) : 0,
      color: "#64748b",
    },
    {
      key: "withdrawn",
      label: "Mengundurkan Diri (Withdrawn)",
      count: withdrawn,
      percentage: totalClosed > 0 ? Math.round((withdrawn / totalClosed) * 100) : 0,
      color: "#f59e0b",
    },
  ];

  return { items, totalClosed };
}

export interface JobSourcePerformanceItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Tonal Green Palette (Harmonious with Jobora Brand Identity):
 * - Signature Jobora Teal: #107C74
 * - Vivid Emerald Green: #059669
 * - Fresh Spring Green: #16A34A
 * - Warm Olive Leaf: #4D7C0F
 * - Crisp Jade: #14B8A6
 * - Deep Hunter Green: #14532D
 *
 * Plus extended harmonious green shades for additional categories:
 * - Dark Sea Green: #0D9488
 * - Dark Emerald: #065F46
 * - Deep Moss: #3F6212
 * - Forest Green: #15803D
 * - Vivid Mint: #22C55E
 * - Deep Pine Spruce: #1E3A2F
 */
export const GREEN_TONAL_COLORS: Record<string, string> = {
  // Primary 6 Green Tonal Shades
  linkedin: "#107C74",             // Signature Jobora Teal
  jobstreet: "#059669",            // Vivid Emerald Green
  glints: "#16A34A",               // Fresh Spring Green
  kalibrr: "#4D7C0F",              // Warm Olive Leaf
  "website perusahaan": "#14B8A6",  // Crisp Jade
  "company website": "#14B8A6",
  "portal karir": "#14B8A6",
  "career portal": "#14B8A6",
  "tidak diketahui": "#14532D",    // Deep Hunter Green
  "tidak dicatat": "#14532D",
  unknown: "#14532D",

  // Extended Harmonious Green Accents
  indeed: "#065F46",               // Dark Emerald
  "tech in asia": "#3F6212",       // Deep Moss
  techinasia: "#3F6212",
  kitalulus: "#15803D",            // Forest Green
  referral: "#0D9488",             // Dark Sea Green
  rekomendasi: "#0D9488",
  internasional: "#065F46",
  lainnya: "#1E3A2F",              // Deep Pine Spruce
  "lainnya (others)": "#1E3A2F",
};

export const JOB_SOURCE_COLORS = GREEN_TONAL_COLORS;

export const CORE_GREEN_PALETTE = [
  "#107C74", // Signature Jobora Teal
  "#059669", // Vivid Emerald Green
  "#16A34A", // Fresh Spring Green
  "#4D7C0F", // Warm Olive Leaf
  "#14B8A6", // Crisp Jade
  "#14532D", // Deep Hunter Green
];

export const EXTENDED_GREEN_PALETTE = [
  "#107C74", // Signature Jobora Teal
  "#059669", // Vivid Emerald Green
  "#16A34A", // Fresh Spring Green
  "#4D7C0F", // Warm Olive Leaf
  "#14B8A6", // Crisp Jade
  "#14532D", // Deep Hunter Green
  "#0D9488", // Dark Sea Green
  "#065F46", // Dark Emerald
  "#3F6212", // Deep Moss
  "#15803D", // Forest Green
  "#22C55E", // Vivid Mint
  "#1E3A2F", // Deep Pine Spruce
];

export function resolveJobSourceColor(label: string): string {
  const norm = label.toLowerCase().trim();
  if (GREEN_TONAL_COLORS[norm]) {
    return GREEN_TONAL_COLORS[norm];
  }
  for (const [key, color] of Object.entries(GREEN_TONAL_COLORS)) {
    if (norm.includes(key)) {
      return color;
    }
  }
  // Deterministic hash on string so that any custom category consistently gets the exact same color
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = (hash << 5) - hash + norm.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % EXTENDED_GREEN_PALETTE.length;
  return EXTENDED_GREEN_PALETTE[index];
}

function normalizePlatformLabel(rawPlatform?: string | null): string {
  if (!rawPlatform) return "Tidak diketahui";
  const trimmed = rawPlatform.trim();
  if (trimmed.length === 0) return "Tidak diketahui";

  const lower = trimmed.toLowerCase();
  if (
    lower === "tidak dicatat" ||
    lower === "unknown" ||
    lower === "tidak diketahui" ||
    lower === "-" ||
    lower === "n/a"
  ) {
    return "Tidak diketahui";
  }
  if (lower === "linkedin") return "LinkedIn";
  if (lower === "jobstreet") return "JobStreet";
  if (lower === "glints") return "Glints";
  if (lower === "kalibrr") return "Kalibrr";
  if (lower === "website perusahaan" || lower === "company website") {
    return "Website Perusahaan";
  }

  return trimmed;
}

/**
 * Computes Job Source Performance breakdown:
 * - Aggregates actual applications by the `platform` field.
 * - Missing or empty platforms are categorized as "Tidak diketahui".
 * - Assigns consistent Muted Accent Colors per category.
 * - Sorts by count descending (tie-break alphabetically, "Tidak diketahui" last).
 */
export function computeJobSourcePerformance(applications: Application[]): {
  items: JobSourcePerformanceItem[];
  totalApplications: number;
} {
  const totalApplications = applications.length;
  if (totalApplications === 0) {
    return { items: [], totalApplications: 0 };
  }

  const counts: Record<string, number> = {};

  for (const app of applications) {
    const label = normalizePlatformLabel(app.platform);
    counts[label] = (counts[label] || 0) + 1;
  }

  const sortedLabels = Object.keys(counts).sort((a, b) => {
    if (a === "Tidak diketahui" && b !== "Tidak diketahui") return 1;
    if (b === "Tidak diketahui" && a !== "Tidak diketahui") return -1;
    const diff = counts[b] - counts[a];
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  const items: JobSourcePerformanceItem[] = sortedLabels.map((label) => {
    const count = counts[label];
    const percentage =
      totalApplications > 0
        ? Math.round((count / totalApplications) * 100)
        : 0;

    const color = resolveJobSourceColor(label);

    return {
      key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      count,
      percentage,
      color,
    };
  });

  return { items, totalApplications };
}
