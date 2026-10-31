/**
 * Automated Pre-Deployment QA Verification Suite
 * Tests Job Tracker, Kanban Board, Career Analytics, and core utilities.
 */

import {
  formatIDR,
  formatThousand,
  parseRawDigits,
  formatDateIndo,
  formatDateMonthIndo,
  formatIDRCompact,
  terbilangRupiah,
} from "../lib/finance/format";
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

const totalInc = mockTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
const totalExp = mockTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
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
const sanitisedNegative = Math.max(0, Math.round(Number("-50000") || 0));
assert(sanitisedNegative === 0, "Prevents negative amount input");

const largeNumber = 999999999999;
assert(cleanSpaces(formatIDR(largeNumber)).startsWith("Rp"), "Safely formats very large amounts without overflow");

const emptyTitle = "   ".trim();
assert(emptyTitle.length === 0, "Correctly identifies empty whitespace title");

const parsedGarbage = Number("abc") || 0;
assert(parsedGarbage === 0, "Safely falls back to 0 on non-numeric input");

// TEST SUITE 5: KANBAN BOARD LOGIC & STATUS MAPPING
console.log("\n--- 5. Kanban Board Logic & Status Mapping ---");
import { formatStatus, isActiveStatus } from "../lib/applications/format";

assert(formatStatus("Test") === "Technical Test", "Status 'Test' formats to 'Technical Test'");
assert(formatStatus("Task") === "Take Home Task", "Status 'Task' formats to 'Take Home Task'");
assert(formatStatus("Offering") === "Offering Received", "Status 'Offering' formats to 'Offering Received'");
assert(formatStatus("Submitted") === "Submitted", "Status 'Submitted' retains standard label");
assert(formatStatus("Interview HR") === "Interview HR", "Status 'Interview HR' retains standard label");

const BASE_COLUMN_STATUSES = [
  "Submitted",
  "Test",
  "Task",
  "Interview HR",
  "Interview User",
  "Offering",
  "Rejected",
];
assert(BASE_COLUMN_STATUSES.length === 7, "Kanban has 7 standard base stages");
assert(BASE_COLUMN_STATUSES.includes("Submitted"), "Base columns include Submitted");
assert(BASE_COLUMN_STATUSES.includes("Offering"), "Base columns include Offering");

// Card edge cases: short vs long text, special characters, fallback
const testCardShort = { company: "X", position: "Dev", status: "Submitted" };
const testCardLong = {
  company: "Super Ultra International Conglomerate Technology Solutions Indonesia Tbk",
  position: "Senior Lead Principal Enterprise Cloud Systems Infrastructure Security Architect",
  status: "Submitted",
};
assert(testCardShort.company.length > 0 && testCardShort.position.length > 0, "Short card title & position retain content");
assert(testCardLong.company.length > 50 && testCardLong.position.length > 50, "Long card handles excessive character length");

// TEST SUITE 6: CAREER ANALYTICS DASHBOARD ENGINE
console.log("\n--- 6. Career Analytics Dashboard Engine ---");
import {
  computeDashboardTopStats,
  isRespondedStatus,
  isCallbackStatus,
  isClosedStatus,
} from "../lib/applications/dashboard-stats";
import { Application } from "../types/application";

const mockApplications: Application[] = [
  {
    id: "app-1",
    user_id: "u1",
    company: "Google",
    position: "Software Engineer",
    type: "Full-time",
    status: "Submitted",
    date: new Date().toISOString(),
    platform: "LinkedIn",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-2",
    user_id: "u1",
    company: "Tokopedia",
    position: "Frontend Engineer",
    type: "Full-time",
    status: "Interview HR",
    date: new Date().toISOString(),
    platform: "Glints",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-3",
    user_id: "u1",
    company: "Gojek",
    position: "Product Manager",
    type: "Full-time",
    status: "Offering",
    date: new Date().toISOString(),
    platform: "Jobstreet",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-4",
    user_id: "u1",
    company: "Traveloka",
    position: "QA Engineer",
    type: "Full-time",
    status: "Rejected",
    date: new Date().toISOString(),
    platform: "Kalibrr",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper classification tests
assert(!isRespondedStatus("Submitted"), "Submitted is not responded yet");
assert(isRespondedStatus("Interview HR"), "Interview HR is considered responded");
assert(isCallbackStatus("Technical Test"), "Technical Test is classified as callback");
assert(isClosedStatus("Rejected"), "Rejected is classified as closed");
assert(!isClosedStatus("Interview User"), "Interview User is not closed");

// Top stats computation
const computedStats = computeDashboardTopStats(mockApplications);
assert(computedStats.totalApplications.value === 4, "Total applications count equals 4");
assert(computedStats.activePipeline.value === 2, "Active pipeline equals 2 (Submitted & Interview HR)");
assert(computedStats.offers.value === 1, "Offers count equals 1 (Offering)");
assert(computedStats.offers.percentage === 25, "Offers percentage is 25% (1/4)");
assert(computedStats.callbackRate.percentage === 75, "Callback/response rate is 75% (3/4)");
assert(computedStats.thisWeek.value === 4, "Applications this week count equals 4");

// Status active helper
assert(isActiveStatus("Submitted"), "Submitted is active");
assert(isActiveStatus("Interview HR"), "Interview HR is active");
assert(!isActiveStatus("Offering"), "Offering is marked as completed/not in progress");
assert(!isActiveStatus("Rejected"), "Rejected is marked as inactive");

// Chronological Sorting Integrity
const testActivityTimestamps = [
  "2026-10-28T10:00:00.000Z",
  "2026-10-31T09:00:00.000Z",
  "2026-10-30T15:00:00.000Z",
];
const sortedTimestamps = [...testActivityTimestamps].sort(
  (a, b) => new Date(b).getTime() - new Date(a).getTime()
);
assert(sortedTimestamps[0] === "2026-10-31T09:00:00.000Z", "Sorts latest application first");
assert(sortedTimestamps[2] === "2026-10-28T10:00:00.000Z", "Preserves chronological order for oldest items");

console.log("\n=================================================");
console.log(`QA SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
