import { Application } from "@/types/application";
import { ActivityDataPoint } from "@/components/dashboard/ApplicationActivityChart";

export const MONTH_NAMES = [
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

export const MONTH_FULL_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Computes monthly data points ensuring the FULL requested monthsCount is always generated:
 * - If monthsCount = 6, generates all 6 consecutive months ending at current/latest month.
 * - If monthsCount = 12, generates all 12 consecutive months.
 */
export function computeMonthlyActivityData(
  applications: Application[],
  monthsCount = 6,
  referenceDate = new Date()
): ActivityDataPoint[] {
  if (!applications) return [];

  // Find latest recorded date
  let endYear = referenceDate.getFullYear();
  let endMonth = referenceDate.getMonth();

  for (const app of applications) {
    if (!app.date) continue;
    const parts = app.date.split("T")[0].split("-");
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        if (y > endYear || (y === endYear && m > endMonth)) {
          endYear = y;
          endMonth = m;
        }
      }
    }
  }

  // Count applications by year-month key
  const countByYearMonth: Record<string, number> = {};
  for (const app of applications) {
    if (!app.date) continue;
    const parts = app.date.split("T")[0].split("-");
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        const key = `${y}-${String(m + 1).padStart(2, "0")}`;
        countByYearMonth[key] = (countByYearMonth[key] || 0) + 1;
      }
    }
  }

  // Start from (monthsCount - 1) months prior to endMonth
  const result: ActivityDataPoint[] = [];
  let currY = endYear;
  let currM = endMonth - (monthsCount - 1);
  while (currM < 0) {
    currM += 12;
    currY -= 1;
  }

  for (let i = 0; i < monthsCount; i++) {
    const key = `${currY}-${String(currM + 1).padStart(2, "0")}`;
    const count = countByYearMonth[key] || 0;
    const label = MONTH_NAMES[currM];
    const fullLabel = `${MONTH_FULL_NAMES[currM]} ${currY}`;
    const dateObj = new Date(currY, currM, 1);

    result.push({
      month: label,
      label,
      count,
      date: dateObj,
      dateRangeText: fullLabel,
    });

    currM++;
    if (currM > 11) {
      currM = 0;
      currY++;
    }
  }

  return result;
}

/**
 * Computes weekly data points for the past `numWeeks` weeks.
 */
export function computeWeeklyActivityData(
  applications: Application[],
  numWeeks = 10,
  referenceDate = new Date()
): ActivityDataPoint[] {
  if (!applications) return [];

  let latestTime = referenceDate.getTime();
  for (const app of applications) {
    if (app.date) {
      const t = new Date(app.date).getTime();
      if (!isNaN(t) && t > latestTime) {
        latestTime = t;
      }
    }
  }

  const anchor = new Date(latestTime);
  // End on Sunday of anchor's week
  const dayOfWeek = anchor.getDay(); // 0 is Sunday, 1 is Monday
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endSunday = new Date(anchor);
  endSunday.setDate(anchor.getDate() + daysToSunday);
  endSunday.setHours(23, 59, 59, 999);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = 7 * MS_PER_DAY;

  const weeks: { start: Date; end: Date }[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const end = new Date(endSunday.getTime() - i * MS_PER_WEEK);
    const start = new Date(end.getTime() - MS_PER_WEEK + 1000);
    start.setHours(0, 0, 0, 0);
    weeks.push({ start, end });
  }

  const counts = weeks.map(() => 0);
  for (const app of applications) {
    if (!app.date) continue;
    const t = new Date(app.date).getTime();
    if (isNaN(t)) continue;

    for (let w = 0; w < weeks.length; w++) {
      if (t >= weeks[w].start.getTime() && t <= weeks[w].end.getTime()) {
        counts[w]++;
        break;
      }
    }
  }

  return weeks.map((w, idx) => {
    const startDay = w.start.getDate();
    const startMonth = MONTH_NAMES[w.start.getMonth()];
    const label = `${startDay} ${startMonth}`;
    const rangeText = `${w.start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })} – ${w.end.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;

    return {
      month: label,
      label,
      count: counts[idx],
      date: w.start,
      dateRangeText: rangeText,
    };
  });
}

/**
 * Computes daily data points for the past `numDays` days.
 */
export function computeDailyActivityData(
  applications: Application[],
  numDays = 30,
  referenceDate = new Date()
): ActivityDataPoint[] {
  if (!applications) return [];

  // Determine latest application date or reference date
  let latestTime = referenceDate.getTime();
  for (const app of applications) {
    if (app.date) {
      const t = new Date(app.date).getTime();
      if (!isNaN(t) && t > latestTime) {
        latestTime = t;
      }
    }
  }

  const anchor = new Date(latestTime);
  anchor.setHours(23, 59, 59, 999);

  // Map of daily counts: key = "YYYY-MM-DD"
  const countsByDay = new Map<string, number>();
  for (const app of applications) {
    if (!app.date) continue;
    const raw = String(app.date).trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    let key = "";
    if (match) {
      key = `${match[1]}-${match[2]}-${match[3]}`;
    } else {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        key = `${y}-${m}-${day}`;
      }
    }
    if (key) {
      countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
    }
  }

  // Generate continuous numDays from (anchor - numDays + 1) to anchor
  const result: ActivityDataPoint[] = [];
  const startDay = new Date(anchor);
  startDay.setDate(anchor.getDate() - (numDays - 1));
  startDay.setHours(0, 0, 0, 0);

  for (let i = 0; i < numDays; i++) {
    const cur = new Date(startDay);
    cur.setDate(startDay.getDate() + i);
    cur.setHours(0, 0, 0, 0);

    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    const count = countsByDay.get(key) || 0;
    const dayNum = cur.getDate();
    const monthShort = MONTH_NAMES[cur.getMonth()];
    const label = `${dayNum} ${monthShort}`;

    const dateFormatted = cur.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    result.push({
      month: label,
      label,
      count,
      date: cur,
      dateRangeText: dateFormatted,
    });
  }

  return result;
}

/**
 * Backwards compatibility wrapper: defaults to 6 months
 */
export function computeActivityChartData(
  applications: Application[],
  currentDate = new Date()
): ActivityDataPoint[] {
  return computeMonthlyActivityData(applications, 6, currentDate);
}
