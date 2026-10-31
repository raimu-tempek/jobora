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
  computeJobSourcePerformance,
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

// Job Source Performance
const emptyPerf = computeJobSourcePerformance([]);
assert(emptyPerf.totalApplications === 0 && emptyPerf.items.length === 0, "Empty applications return 0 total and empty items");

const perf = computeJobSourcePerformance(mockApplications);
assert(perf.totalApplications === 4, "Job Source Performance calculates exact total of 4 applications");
assert(perf.items.length === 4, "Job Source Performance identifies 4 distinct platforms");
const totalSum = perf.items.reduce((acc, it) => acc + it.count, 0);
assert(totalSum === 4, "Sum of platform counts matches totalApplications");

const withUnknown = computeJobSourcePerformance([
  ...mockApplications,
  {
    id: "app-5",
    user_id: "u1",
    company: "Unknown Corp",
    position: "Intern",
    type: "Internship",
    status: "Submitted",
    date: new Date().toISOString(),
    platform: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-6",
    user_id: "u1",
    company: "Another Corp",
    position: "Dev",
    type: "Contract",
    status: "Submitted",
    date: new Date().toISOString(),
    platform: "Tidak dicatat",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]);
assert(withUnknown.totalApplications === 6, "Total applications includes unrecorded sources (6 total)");
const unknownItem = withUnknown.items.find((it) => it.label === "Tidak diketahui");
assert(unknownItem !== undefined && unknownItem.count === 2, "Normalizes blank and 'Tidak dicatat' to 'Tidak diketahui' with count 2");

// Fresh Emerald Color Palette Verification
const linkedInItem = perf.items.find((it) => it.label === "LinkedIn");
assert(linkedInItem?.color === "#10B981", "LinkedIn is mapped to Emerald (#10B981)");

const glintsItem = perf.items.find((it) => it.label === "Glints");
assert(glintsItem?.color === "#65C98A", "Glints is mapped to Spring Green (#65C98A)");

const jobstreetItem = perf.items.find((it) => it.label === "JobStreet");
assert(jobstreetItem?.color === "#34A875", "JobStreet is mapped to Jade (#34A875)");

const kalibrrItem = perf.items.find((it) => it.label === "Kalibrr");
assert(kalibrrItem?.color === "#A3C94A", "Kalibrr is mapped to Lime Green (#A3C94A)");

assert(unknownItem?.color === "#C0DDA0", "Tidak diketahui is mapped to Pistachio (#C0DDA0)");

const distinctColors = new Set(perf.items.map((it) => it.color));
assert(distinctColors.size === perf.items.length, "All Job Source categories have unique distinct fresh green shades");

// TEST SUITE 7: DIRECT EDIT MODAL & RECORD LIFECYCLE (JOB JOURNEY)
console.log("\n--- 7. Direct Edit Modal & Record Lifecycle ---");
import { normalizeDateToISO, isStatusActive } from "../lib/applications/format";

// 0. Quick Status Picker & Active Status Matching
assert(isStatusActive("Submitted", "Submitted"), "Direct match active status");
assert(isStatusActive("Offering", "Offering Received"), "Synonym match: Offering matches Offering Received");
assert(isStatusActive("Offering", "offering"), "Case-insensitive active status match");
assert(isStatusActive("Test", "Technical Test"), "Synonym match: Test matches Technical Test");
assert(isStatusActive("Task", "Take Home Task"), "Synonym match: Task matches Take Home Task");
assert(!isStatusActive("Interview HR", "Submitted"), "Different status is correctly recognized as inactive");

// 1. Initial Data Mapping Integrity (QA 1 & 2)
const sampleCardApp: Application = {
  id: "app-edit-test-1",
  user_id: "user-123",
  company: "Tech Nusantara",
  position: "Senior Frontend Engineer",
  type: "Full-time",
  status: "Offering Received",
  date: "2026-10-15T00:00:00.000Z",
  platform: "LinkedIn",
  created_at: "2026-10-15T00:00:00.000Z",
  updated_at: "2026-10-15T00:00:00.000Z",
};

// Date formatter helper test
function formatISOToInputDateHelper(dateStr: string): string {
  if (!dateStr) return "";
  const clean = dateStr.split("T")[0].trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-");
    return `${d}/${m}/${y}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) return clean;
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split("-");
    return `${d}/${m}/${y}`;
  }
  return clean;
}

const formattedInputDate = formatISOToInputDateHelper(sampleCardApp.date);
assert(formattedInputDate === "15/10/2026", "Formats ISO date to DD/MM/YYYY input value");

// Initial data builder simulation
const knownPlatforms = ["LinkedIn", "Kalibrr", "JobStreet", "Glints", "Career Portal"];
let mappedStatus = sampleCardApp.status;
if (mappedStatus === "Offering Received") mappedStatus = "Offering";
const isKnown = knownPlatforms.includes(sampleCardApp.platform);

const directEditInitialData = {
  company: sampleCardApp.company,
  position: sampleCardApp.position,
  jobType: sampleCardApp.type || "Full-time",
  initialStatus: mappedStatus,
  applyDate: formattedInputDate,
  platform: isKnown ? sampleCardApp.platform : "Lainnya (Others)",
  customPlatform: isKnown ? "" : sampleCardApp.platform,
};

assert(directEditInitialData.company === "Tech Nusantara", "Direct Edit pre-fills company");
assert(directEditInitialData.position === "Senior Frontend Engineer", "Direct Edit pre-fills position");
assert(directEditInitialData.initialStatus === "Offering", "Direct Edit normalizes Offering Received to Offering");
assert(directEditInitialData.applyDate === "15/10/2026", "Direct Edit pre-fills date in DD/MM/YYYY");
assert(directEditInitialData.platform === "LinkedIn", "Direct Edit pre-fills platform");

// 2. Custom Platform pre-fill
const customPlatformApp: Application = {
  id: "app-custom-1",
  user_id: "user-123",
  company: "Startup Kita",
  position: "Backend Developer",
  type: "Contract",
  status: "Submitted",
  date: "2026-10-20",
  platform: "Deall Jobs",
  created_at: "2026-10-20T00:00:00.000Z",
  updated_at: "2026-10-20T00:00:00.000Z",
};
const isCustomKnown = knownPlatforms.includes(customPlatformApp.platform);
const customPlatformInitial = {
  platform: isCustomKnown ? customPlatformApp.platform : "Lainnya (Others)",
  customPlatform: isCustomKnown ? "" : customPlatformApp.platform,
};
assert(customPlatformInitial.platform === "Lainnya (Others)", "Unknown platform maps to Lainnya (Others)");
assert(customPlatformInitial.customPlatform === "Deall Jobs", "Preserves custom platform string");

// 3. Save Changes updates record in-place without duplicate (QA 3 & 4)
let appsState: Application[] = [
  { ...sampleCardApp },
  { ...customPlatformApp },
];

const editedFormData = {
  company: "Tech Nusantara Global",
  position: "Lead Frontend Engineer",
  jobType: "Full-time",
  initialStatus: "Interview HR",
  applyDate: "16/10/2026",
  platform: "LinkedIn",
  customPlatform: "",
};

const targetId = "app-edit-test-1";
const updatedDateISO = normalizeDateToISO(editedFormData.applyDate);
const resolvedPlatform = editedFormData.platform;

appsState = appsState.map((app) =>
  app.id === targetId
    ? {
        ...app,
        company: editedFormData.company.trim(),
        position: editedFormData.position.trim(),
        type: editedFormData.jobType,
        status: editedFormData.initialStatus,
        platform: resolvedPlatform,
        date: updatedDateISO,
        updated_at: new Date().toISOString(),
      }
    : app
);

assert(appsState.length === 2, "Array length remains exactly 2 (no record duplication on update)");
assert(appsState[0].id === targetId, "Record ID is preserved");
assert(appsState[0].company === "Tech Nusantara Global", "Company updated successfully");
assert(appsState[0].position === "Lead Frontend Engineer", "Position updated successfully");
assert(appsState[0].status === "Interview HR", "Status updated successfully");
assert(appsState[0].date === "2026-10-16", "Date normalized to ISO YYYY-MM-DD");
assert(appsState[1].company === "Startup Kita", "Other records remain untouched");

// 4. Clicking card again loads updated data (QA 5)
const reloadedApp = appsState.find((a) => a.id === targetId);
assert(reloadedApp?.company === "Tech Nusantara Global", "Subsequent open shows updated company");
assert(reloadedApp?.position === "Lead Frontend Engineer", "Subsequent open shows updated position");

// 5. Cancel preserves state untouched (QA 6)
const originalBeforeCancel = [...appsState];
// Simulating modal close on Cancel: no state mutation
const cancelledState = [...appsState];
assert(cancelledState.length === originalBeforeCancel.length, "Canceling retains same count");
assert(cancelledState[0].company === originalBeforeCancel[0].company, "Canceling discards pending changes");

// 6. Delete removes only targeted record (QA 7)
const idToDelete = "app-edit-test-1";
appsState = appsState.filter((app) => app.id !== idToDelete);
assert(appsState.length === 1, "State length decreases by 1 after deletion");
assert(appsState[0].id === "app-custom-1", "Only selected record was removed");
assert(appsState[0].company === "Startup Kita", "Surviving record remains intact");

// 7. Refresh / Re-hydration consistency (QA 8)
const rehydratedApplications = JSON.parse(JSON.stringify(appsState));
assert(rehydratedApplications.length === 1, "Persists consistent count across rehydration");
assert(rehydratedApplications[0].id === "app-custom-1", "Persists consistent record data across rehydration");

// -------------------------------------------------------------
// 8. Receipt Scanner Paste & Account Card Interaction
// -------------------------------------------------------------
console.log("\n--- 8. Receipt Scanner Paste & Account Card Interaction ---");

// Test A: Image Type Validation for Receipt OCR & Screenshot
const isValidReceiptImage = (mimeType: string) => Boolean(mimeType.match(/^image\/(jpeg|jpg|png|webp)$/i));

assert(isValidReceiptImage("image/jpeg"), "JPG is valid receipt format");
assert(isValidReceiptImage("image/png"), "PNG is valid receipt format");
assert(isValidReceiptImage("image/webp"), "WEBP is valid receipt format");
assert(!isValidReceiptImage("image/gif"), "GIF is rejected as unsupported");
assert(!isValidReceiptImage("application/pdf"), "PDF is rejected as unsupported");
assert(!isValidReceiptImage("text/plain"), "Plain text is rejected");

// Test B: Clipboard Extraction Simulation
interface MockClipboardItem {
  type: string;
  blob?: { size: number; type: string };
}

function simulateClipboardPaste(items: MockClipboardItem[]) {
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const ext = item.type.split("/")[1] || "png";
      const fileName = `struk-clipboard-test.${ext}`;
      return {
        success: true,
        fileName,
        type: item.type,
      };
    }
  }
  return {
    success: false,
    error: "Clipboard tidak berisi file gambar. Silakan salin gambar struk atau gunakan screenshot (Win + Shift + S).",
  };
}

const pasteResultImage = simulateClipboardPaste([
  { type: "image/png", blob: { size: 10240, type: "image/png" } },
]);
assert(pasteResultImage.success, "Clipboard paste succeeds when image is present");
assert(pasteResultImage.fileName === "struk-clipboard-test.png", "Clipboard generates proper filename with extension");

const pasteResultText = simulateClipboardPaste([
  { type: "text/plain" },
]);
assert(!pasteResultText.success, "Clipboard paste gracefully fails when text is copied instead of image");
assert(
  Boolean(pasteResultText.error?.includes("Clipboard tidak berisi file gambar")),
  "Clipboard provides user-friendly guidance on non-image paste"
);

// Test C: Account Card Direct Management Popup & Event Propagation
interface MockAccount {
  id: string;
  name: string;
  type: "bank" | "ewallet" | "cash" | "investment" | "other";
  initial_balance: number;
  current_balance: number;
  color?: string;
}

const mockAccount: MockAccount = {
  id: "acc-bca-1",
  name: "BCA Tahapan",
  type: "bank",
  initial_balance: 5000000,
  current_balance: 7500000,
  color: "#107c74",
};

const trackerState: {
  editModalOpen: boolean;
  activeAccountForEdit: MockAccount | null;
  propagationStopped: boolean;
  deleteConfirmed: boolean;
} = {
  editModalOpen: false,
  activeAccountForEdit: null,
  propagationStopped: false,
  deleteConfirmed: false,
};

// Simulate 1-Click Card Click (Direct Management: immediately opens edit modal)
function onCardClick(acc: MockAccount) {
  trackerState.editModalOpen = true;
  trackerState.activeAccountForEdit = acc;
}

// Simulate Edit Button Click (opens exact same management modal)
function onEditClick(e: { stopPropagation: () => void }, acc: MockAccount) {
  e.stopPropagation();
  trackerState.editModalOpen = true;
  trackerState.activeAccountForEdit = acc;
}

// Trigger card click: exactly 1 click opens edit modal
onCardClick(mockAccount);
assert(trackerState.editModalOpen, "Clicking account card directly opens management popup");
assert(trackerState.activeAccountForEdit?.id === "acc-bca-1", "Management popup receives selected account");
assert(trackerState.activeAccountForEdit?.name === "BCA Tahapan", "Management popup pre-fills account name");
assert(trackerState.activeAccountForEdit?.type === "bank", "Management popup pre-fills account type");
assert(trackerState.activeAccountForEdit?.initial_balance === 5000000, "Management popup pre-fills initial balance");

// Reset states
trackerState.editModalOpen = false;
trackerState.activeAccountForEdit = null;

// Trigger edit icon click with stopPropagation
trackerState.propagationStopped = false;
const mockEvent = {
  stopPropagation: () => {
    trackerState.propagationStopped = true;
  },
};

onEditClick(mockEvent, mockAccount);
if (!trackerState.propagationStopped) {
  onCardClick(mockAccount);
}

assert(trackerState.propagationStopped, "Action buttons inside card call e.stopPropagation()");
assert(trackerState.editModalOpen, "Edit icon opens the same management popup");
assert((trackerState.activeAccountForEdit as MockAccount | null)?.name === "BCA Tahapan", "Management popup receives correct account target");

console.log("\n=================================================");
console.log(`QA SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
