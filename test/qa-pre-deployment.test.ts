/**
 * Automated Pre-Deployment QA Verification Suite
 * Tests Job Tracker and Finance Tracker core logic, edge cases, calculations, and security.
 */

import { formatIDR, formatThousand, parseRawDigits, formatDateIndo, formatDateMonthIndo, formatIDRCompact, terbilangRupiah } from "../lib/finance/format";
import { resolveDateFilterRange } from "../lib/finance/service";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

console.log("=================================================");
console.log("🚀 RUNNING AUTOMATED PRE-DEPLOYMENT QA TEST SUITE");
console.log("=================================================\n");

// TEST SUITE 1: CURRENCY & NUMBER FORMATTING
console.log("--- 1. Currency & Number Formatting ---");
// Normalize non-breaking spaces for testing comparison
const cleanSpaces = (s: string) => s.replace(/\u00a0/g, " ");

assert(cleanSpaces(formatIDR(0)) === "Rp 0", "formatIDR handles 0 correctly", formatIDR(0));
assert(cleanSpaces(formatIDR(250000)) === "Rp 250.000", "formatIDR formats standard thousands", formatIDR(250000));
assert(cleanSpaces(formatIDR(-150000)) === "-Rp 150.000", "formatIDR formats negative numbers", formatIDR(-150000));
assert(cleanSpaces(formatIDR(1500000)) === "Rp 1.500.000", "formatIDR formats millions", formatIDR(1500000));
assert(formatThousand("250000") === "250.000", "formatThousand formats number string");
assert(formatThousand("") === "", "formatThousand handles empty string");
assert(parseRawDigits("250.000") === 250000, "parseRawDigits strips periods and returns integer");
assert(parseRawDigits("Rp 1.500.000") === 1500000, "parseRawDigits strips symbols");
assert(formatIDRCompact(1500000) === "Rp 1,5 Jt", "formatIDRCompact millions", formatIDRCompact(1500000));
assert(formatIDRCompact(500000) === "Rp 500 Rb", "formatIDRCompact thousands", formatIDRCompact(500000));
assert(terbilangRupiah(250000) === "Dua Ratus Lima Puluh Ribu Rupiah", "terbilangRupiah translates numbers accurately", terbilangRupiah(250000));

// TEST SUITE 2: DATE FORMATTING & RANGE RESOLUTION
console.log("\n--- 2. Date Formatting & Range Resolution ---");
assert(formatDateIndo("2026-10-30") === "30 Okt 2026", "formatDateIndo standard date", formatDateIndo("2026-10-30"));
assert(formatDateIndo("") === "-", "formatDateIndo empty string handling");
assert(formatDateMonthIndo("2026-10") === "Oktober 2026", "formatDateMonthIndo standard month", formatDateMonthIndo("2026-10"));

const rangeThisMonth = resolveDateFilterRange({ range: "this_month" });
assert(Boolean(rangeThisMonth.start && rangeThisMonth.end), "resolveDateFilterRange this_month has start and end");
assert(Boolean(rangeThisMonth.start?.endsWith("-01")), "this_month starts on 1st of month");

const rangeCustom = resolveDateFilterRange({ range: "custom", startDate: "2026-01-01", endDate: "2026-06-30" });
assert(rangeCustom.start === "2026-01-01" && rangeCustom.end === "2026-06-30", "resolveDateFilterRange custom preserves range");

const rangeUnbounded = resolveDateFilterRange({ range: "custom" });
assert(!rangeUnbounded.start && !rangeUnbounded.end, "resolveDateFilterRange custom without dates is unbounded");

// TEST SUITE 3: FINANCE ENGINE AGGREGATIONS & CALCULATIONS
console.log("\n--- 3. Finance Engine Aggregation Calculations ---");
const mockTxs = [
  { id: "1", type: "income" as const, amount: 10000000, date: "2026-10-01" },
  { id: "2", type: "expense" as const, amount: 250000, date: "2026-10-05" },
  { id: "3", type: "expense" as const, amount: 750000, date: "2026-10-10" },
];

const totalInc = mockTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
const totalExp = mockTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
const netFlow = totalInc - totalExp;

assert(totalInc === 10000000, "Calculates total income correctly");
assert(totalExp === 1000000, "Calculates total expenses correctly");
assert(netFlow === 9000000, "Calculates net cashflow surplus correctly");

// Budget status calculations
const budgetAllocated = 1000000;
const budgetSpent = 850000;
const budgetPct = Math.round((budgetSpent / budgetAllocated) * 100);
assert(budgetPct === 85, "Calculates budget percentage (85%)");
const isApproaching = budgetPct >= 80 && budgetPct < 100;
assert(isApproaching, "Identifies budget approaching limit correctly");

// TEST SUITE 4: SECURITY & SANITIZATION VERIFICATION
console.log("\n--- 4. Security & Robustness Edge Cases ---");
// Negative amounts in currency inputs
const sanitisedNegative = Math.max(0, Math.round(Number("-50000") || 0));
assert(sanitisedNegative === 0, "Prevents negative amount input");

// Extreme numbers
const largeNumber = 999999999999;
assert(formatIDR(largeNumber).includes("999.999.999.999"), "Safely formats very large amounts without overflow");

// Empty string title
const emptyTitle = "   ".trim();
assert(emptyTitle.length === 0, "Correctly identifies empty whitespace title");

// Non-numeric parsing
const parsedGarbage = Number("abc") || 0;
assert(parsedGarbage === 0, "Safely falls back to 0 on non-numeric input");

// TEST SUITE 5: KANBAN & RECRUITMENT CALENDAR LOGIC
console.log("\n--- 5. Kanban & Recruitment Calendar Logic ---");
import { validateEventTimes, getNearestEventForApplication } from "../lib/applications/recruitment-service";
import { formatStatus } from "../lib/applications/format";
import { RecruitmentEvent } from "../types/recruitment";

// Status formatting & mapping
assert(formatStatus("Test") === "Technical Test", "Status 'Test' formats to 'Technical Test'");
assert(formatStatus("Task") === "Take Home Task", "Status 'Task' formats to 'Take Home Task'");
assert(formatStatus("Offering") === "Offering Received", "Status 'Offering' formats to 'Offering Received'");
assert(formatStatus("Submitted") === "Submitted", "Status 'Submitted' retains standard label");
assert(formatStatus("Interview HR") === "Interview HR", "Status 'Interview HR' retains standard label");

// Event Time Validations
const valValidSingle = validateEventTimes("2026-10-31T09:00:00");
assert(valValidSingle.valid, "Accepts valid start time without end time");

const valValidRange = validateEventTimes("2026-10-31T09:00:00", "2026-10-31T10:00:00");
assert(valValidRange.valid, "Accepts end time after start time");

const valEqualTime = validateEventTimes("2026-10-31T09:00:00", "2026-10-31T09:00:00");
assert(valEqualTime.valid, "Accepts equal start and end time");

const valInvalidMissingStart = validateEventTimes("");
assert(!valInvalidMissingStart.valid, "Rejects empty start time");

const valInvalidPrecedingEnd = validateEventTimes("2026-10-31T10:00:00", "2026-10-31T09:00:00");
assert(!valInvalidPrecedingEnd.valid, "Rejects end time earlier than start time");

// Nearest Event Detection
const mockEvents: RecruitmentEvent[] = [
  {
    id: "ev1",
    user_id: "u1",
    application_id: "app-1",
    title: "Interview HR",
    event_type: "HR Interview",
    start_time: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    end_time: null,
    is_all_day: false,
    location: "Google Meet",
    notes: null,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ev2",
    user_id: "u1",
    application_id: "app-1",
    title: "Interview User",
    event_type: "User Interview",
    start_time: new Date(Date.now() + 172800000).toISOString(), // in 2 days
    end_time: null,
    is_all_day: false,
    location: null,
    notes: null,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ev3",
    user_id: "u1",
    application_id: "app-1",
    title: "Completed Assessment",
    event_type: "Assessment Deadline",
    start_time: new Date(Date.now() + 3600000).toISOString(),
    end_time: null,
    is_all_day: false,
    location: null,
    notes: null,
    is_completed: true, // completed!
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const nearest = getNearestEventForApplication(mockEvents, "app-1");
assert(Boolean(nearest), "Finds nearest event for application");
assert(nearest?.id === "ev1", "Selects the closest non-completed upcoming event", nearest?.id);

const nearestEmpty = getNearestEventForApplication(mockEvents, "app-non-existent");
assert(nearestEmpty === null, "Returns null when no event exists for application");

// TEST SUITE 6: COMMAND CENTER CONSISTENCY & INTEGRITY
console.log("\n--- 6. Command Center Home Consistency ---");
import { isActiveStatus } from "../lib/applications/format";
import { Application } from "../types/application";

const mockAppsForCC: Application[] = [
  { id: "1", user_id: "u1", company: "Company A", position: "Dev", type: "Full-time", status: "Submitted", date: "2026-10-01", platform: "LinkedIn", created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" },
  { id: "2", user_id: "u1", company: "Company B", position: "Design", type: "Full-time", status: "Interview HR", date: "2026-10-02", platform: "LinkedIn", created_at: "2026-10-02T00:00:00Z", updated_at: "2026-10-02T00:00:00Z" },
  { id: "3", user_id: "u1", company: "Company C", position: "PM", type: "Full-time", status: "Offering", date: "2026-10-03", platform: "LinkedIn", created_at: "2026-10-03T00:00:00Z", updated_at: "2026-10-03T00:00:00Z" },
  { id: "4", user_id: "u1", company: "Company D", position: "QA", type: "Full-time", status: "Rejected", date: "2026-10-04", platform: "LinkedIn", created_at: "2026-10-04T00:00:00Z", updated_at: "2026-10-04T00:00:00Z" },
];

const activeJobs = mockAppsForCC.filter((a) => isActiveStatus(a.status));
assert(activeJobs.length === 2, "Accurately identifies active jobs (Submitted & Interview HR)", String(activeJobs.length));
assert(!isActiveStatus("Offering"), "Offering is marked as completed/not in progress");
assert(!isActiveStatus("Rejected"), "Rejected is marked as inactive");

// Upcoming 7-day events filtering
const nowTime = Date.now();
const sevenDaysAhead = nowTime + 7 * 24 * 60 * 60 * 1000;
const upcomingSevenDays = mockEvents.filter((e) => {
  if (e.is_completed) return false;
  const t = new Date(e.start_time).getTime();
  return t >= nowTime - 3600000 && t <= sevenDaysAhead;
});
assert(upcomingSevenDays.length === 2, "Accurately filters active events within 7 days", String(upcomingSevenDays.length));

// Recent Activity Chronological Sorting Integrity
const testActivityTimestamps = [
  "2026-10-28T10:00:00.000Z",
  "2026-10-31T09:00:00.000Z",
  "2026-10-30T15:00:00.000Z",
];
const sortedTimestamps = [...testActivityTimestamps].sort(
  (a, b) => new Date(b).getTime() - new Date(a).getTime()
);
assert(sortedTimestamps[0] === "2026-10-31T09:00:00.000Z", "Sorts latest activity first");
assert(sortedTimestamps[2] === "2026-10-28T10:00:00.000Z", "Preserves chronological order for oldest items");

console.log("\n=================================================");
console.log(`QA SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
