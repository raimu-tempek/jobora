import { Application } from "@/types/application";
import { BreakdownItem } from "@/components/dashboard/BreakdownBarList";
import { isInterviewGroup, isTestTaskGroup } from "./format";

export interface StatusBreakdownResult {
  items: BreakdownItem[];
  conversionRate: string; // e.g. "12.5%" or "—"
}

/**
 * Computes 5 mutually-exclusive status breakdown rows per PRD-JobTracker.md:
 * - Submitted (status === "Submitted")
 * - Test/Task (isTestTaskGroup: Test, Task)
 * - Interview (isInterviewGroup: Interview HR, Interview User, LGD, FGD)
 * - Offering (status === "Offering" / "Offering Received")
 * - Rejected (status === "Rejected")
 */
export function computeStatusBreakdown(
  applications: Application[]
): StatusBreakdownResult {
  const total = applications.length;

  let submittedCount = 0;
  let testTaskCount = 0;
  let interviewCount = 0;
  let offeringCount = 0;
  let rejectedCount = 0;

  for (const app of applications) {
    if (app.status === "Submitted") {
      submittedCount++;
    } else if (isTestTaskGroup(app.status)) {
      testTaskCount++;
    } else if (isInterviewGroup(app.status)) {
      interviewCount++;
    } else if (app.status === "Offering" || app.status === "Offering Received") {
      offeringCount++;
    } else if (app.status === "Rejected") {
      rejectedCount++;
    }
  }

  const calcPct = (cnt: number) =>
    total > 0 ? Math.round((cnt / total) * 100) : 0;

  const items: BreakdownItem[] = [
    {
      label: "Submitted",
      value: submittedCount,
      percentage: calcPct(submittedCount),
      color: "var(--status-submitted-text)",
    },
    {
      label: "Test / Task",
      value: testTaskCount,
      percentage: calcPct(testTaskCount),
      color: "var(--status-test-text)",
    },
    {
      label: "Interview",
      value: interviewCount,
      percentage: calcPct(interviewCount),
      color: "var(--status-interview-text)",
    },
    {
      label: "Offering",
      value: offeringCount,
      percentage: calcPct(offeringCount),
      color: "var(--status-offering-text)",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      percentage: calcPct(rejectedCount),
      color: "var(--status-rejected-text)",
    },
  ];

  const conversionRate =
    total > 0 ? `${((offeringCount / total) * 100).toFixed(1)}%` : "—";

  return { items, conversionRate };
}

interface PlatformConfig {
  icon: string;
  color: string;
}

const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  linkedin: { icon: "language", color: "var(--color-primary)" },
  glints: { icon: "domain", color: "var(--color-purple)" },
  jobstreet: { icon: "public", color: "var(--color-warning)" },
  kalibrr: { icon: "public", color: "var(--color-primary)" },
  "career portal": { icon: "domain", color: "var(--color-text-secondary)" },
  "tidak dicatat": { icon: "help_outline", color: "var(--color-text-muted)" },
};

function getPlatformMeta(platform: string): PlatformConfig {
  const norm = platform.trim().toLowerCase();
  for (const [key, cfg] of Object.entries(PLATFORM_CONFIG)) {
    if (norm.includes(key)) {
      return cfg;
    }
  }
  return { icon: "more_horiz", color: "var(--color-text-secondary)" };
}

/**
 * Computes Applications by Platform breakdown:
 * - Group applications by platform field (null/empty displays as "Tidak dicatat").
 * - Sorted by count descending (tie-break alphabetically).
 */
export function computePlatformBreakdown(
  applications: Application[]
): BreakdownItem[] {
  const total = applications.length;
  const countMap: Record<string, number> = {};

  for (const app of applications) {
    const raw = app.platform?.trim();
    const platform = raw && raw.length > 0 ? raw : "Tidak dicatat";
    countMap[platform] = (countMap[platform] || 0) + 1;
  }

  const platforms = Object.keys(countMap);

  // Sort by count descending, tie-break alphabetically
  platforms.sort((a, b) => {
    const diff = countMap[b] - countMap[a];
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  });

  return platforms.map((platform) => {
    const val = countMap[platform];
    const percentage = total > 0 ? Math.round((val / total) * 100) : 0;
    const meta = getPlatformMeta(platform);

    return {
      label: platform,
      value: val,
      percentage,
      color: meta.color,
      icon: meta.icon,
    };
  });
}
