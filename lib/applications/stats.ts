import { Application } from "@/types/application";
import { isActiveStatus, isInterviewStatus } from "./format";

export interface KpiStats {
  applied: number;
  active: number;
  interview: number;
  offer: number;
}

export interface SparklinePoint {
  value: number;
}

export interface KpiTrends {
  applied: SparklinePoint[];
  active: SparklinePoint[];
  interview: SparklinePoint[];
  offer: SparklinePoint[];
}

/**
 * Computes the 4 core KPI statistics per PRD-JobTracker.md:
 * - Applied: total count of all applications
 * - Active: applications with active statuses (Submitted, Test, Task, Interview HR, Interview User, LGD, FGD)
 * - Interview: applications in interview stage (Interview HR, Interview User, LGD, FGD)
 * - Offer: applications with Offering status
 */
export function computeStats(applications: Application[]): KpiStats {
  let active = 0;
  let interview = 0;
  let offer = 0;

  for (const app of applications) {
    if (isActiveStatus(app.status)) {
      active++;
    }
    if (isInterviewStatus(app.status)) {
      interview++;
    }
    if (app.status === "Offering" || app.status === "Offering Received") {
      offer++;
    }
  }

  return {
    applied: applications.length,
    active,
    interview,
    offer,
  };
}

/**
 * Computes weekly trend data (past 8 weeks) for each KPI category sparkline.
 */
export function computeKpiSparklineTrends(
  applications: Application[],
  numWeeks = 8,
  referenceDate = new Date()
): KpiTrends {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = 7 * MS_PER_DAY;

  // Determine anchor date: if user has applications, align to latest application or reference date
  let latestAppTime = 0;
  for (const app of applications) {
    if (app.date) {
      const t = new Date(app.date).getTime();
      if (!Number.isNaN(t) && t > latestAppTime) {
        latestAppTime = t;
      }
    }
  }

  let anchorTime = referenceDate.getTime();
  if (latestAppTime > 0) {
    if (latestAppTime > anchorTime || anchorTime - latestAppTime > 60 * MS_PER_DAY) {
      anchorTime = latestAppTime;
    }
  }

  const anchor = new Date(anchorTime);
  anchor.setHours(23, 59, 59, 999);

  const weeks: { start: number; end: number }[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const end = anchor.getTime() - i * MS_PER_WEEK;
    const start = end - MS_PER_WEEK;
    weeks.push({ start, end });
  }

  const trends: KpiTrends = {
    applied: weeks.map(() => ({ value: 0 })),
    active: weeks.map(() => ({ value: 0 })),
    interview: weeks.map(() => ({ value: 0 })),
    offer: weeks.map(() => ({ value: 0 })),
  };

  for (const app of applications) {
    if (!app.date) continue;
    const appTime = new Date(app.date).getTime();
    if (Number.isNaN(appTime)) continue;

    for (let w = 0; w < weeks.length; w++) {
      if (appTime >= weeks[w].start && appTime <= weeks[w].end) {
        trends.applied[w].value++;
        if (isActiveStatus(app.status)) {
          trends.active[w].value++;
        }
        if (isInterviewStatus(app.status)) {
          trends.interview[w].value++;
        }
        if (app.status === "Offering" || app.status === "Offering Received") {
          trends.offer[w].value++;
        }
        break;
      }
    }
  }

  return trends;
}
