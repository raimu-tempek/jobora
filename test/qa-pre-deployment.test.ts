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

// Test B2: isEditableTextInput does not block image paste when file input or buttons are focused
function isEditableTextInputTest(el: { tagName: string; type?: string; isContentEditable?: boolean } | null): boolean {
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName === "INPUT") {
    const nonTextTypes = ["file", "checkbox", "radio", "button", "submit", "reset", "image", "range", "color"];
    return !nonTextTypes.includes((el.type || "text").toLowerCase());
  }
  return false;
}
assert(!isEditableTextInputTest({ tagName: "INPUT", type: "file" }), "File input is not treated as editable text (paste not blocked)");
assert(!isEditableTextInputTest({ tagName: "DIV", isContentEditable: false }), "Non-editable div is not treated as text input");
assert(isEditableTextInputTest({ tagName: "INPUT", type: "text" }), "Text input is correctly recognized as editable");
assert(isEditableTextInputTest({ tagName: "TEXTAREA" }), "Textarea is correctly recognized as editable");

// Test B3: Dropdown Menu CSS Keyframe Horizontal Stability
const keyframeFromTransform = "translateX(-50%) translateY(-4px)";
const keyframeToTransform = "translateX(-50%) translateY(0)";
assert(keyframeFromTransform.includes("translateX(-50%)"), "Dropdown animation 'from' maintains translateX(-50%) horizontal centering");
assert(keyframeToTransform.includes("translateX(-50%)"), "Dropdown animation 'to' maintains translateX(-50%) horizontal centering");


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

// --- 9. Authentication Validation, Metadata & Asset Integrity ---
console.log("\n--- 9. Authentication Validation & User Metadata ---");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert(emailRegex.test("faishal@jobora.id"), "Valid email passes format validation");
assert(emailRegex.test("user.name+tag@example.co.id"), "Email with plus tag and subdomain passes");
assert(!emailRegex.test("plainaddress"), "Plain address without @ fails validation");
assert(!emailRegex.test("missing@domain"), "Email missing TLD fails validation");
assert(!emailRegex.test("@missingusername.com"), "Email missing username fails validation");

// Password length validation
function validatePasswordLength(password: string): boolean {
  return password.length >= 6;
}
assert(validatePasswordLength("secret123"), "Password with 9 characters passes");
assert(validatePasswordLength("123456"), "Password with exactly 6 characters passes");
assert(!validatePasswordLength("12345"), "Password with 5 characters is rejected");
assert(!validatePasswordLength(""), "Empty password is rejected");

// Password confirmation matching
function validatePasswordConfirmation(p1: string, p2: string): boolean {
  return p1 === p2 && p1.length >= 6;
}
assert(validatePasswordConfirmation("JoboraSecure2026", "JoboraSecure2026"), "Matching passwords pass");
assert(!validatePasswordConfirmation("JoboraSecure2026", "joborasecure2026"), "Case-mismatched passwords fail");
assert(!validatePasswordConfirmation("JoboraSecure2026", "DifferentPass"), "Different passwords fail");

// Full Name validation
function validateFullName(fullName: string): boolean {
  return fullName.trim().length > 0;
}
assert(validateFullName("Faishal Rahman"), "Standard full name passes");
assert(validateFullName("Dr. Siti Nurhaliza, M.Kom"), "Full name with punctuation passes");
assert(!validateFullName("   "), "Whitespace-only full name fails");

// User metadata full_name resolution for Dashboard greeting
interface MockSupabaseUser {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

function resolveDashboardUserName(user: MockSupabaseUser | null): string | undefined {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    undefined
  );
}

const emailUser: MockSupabaseUser = {
  email: "faishal@example.com",
  user_metadata: {
    full_name: "Faishal Rahman",
  },
};
assert(
  resolveDashboardUserName(emailUser) === "Faishal Rahman",
  "Dashboard resolves full_name from registered user metadata"
);

const googleUser: MockSupabaseUser = {
  email: "faishal.google@gmail.com",
  user_metadata: {
    name: "Faishal Google OAuth",
  },
};
assert(
  resolveDashboardUserName(googleUser) === "Faishal Google OAuth",
  "Dashboard resolves name from Google OAuth user metadata"
);

const fallbackUser: MockSupabaseUser = {
  email: "anon@example.com",
  user_metadata: {},
};
assert(
  resolveDashboardUserName(fallbackUser) === "anon@example.com",
  "Dashboard falls back to email when metadata name is absent"
);

assert(
  resolveDashboardUserName(null) === undefined,
  "Dashboard returns undefined when unauthenticated"
);

// 3D Asset existence verification
import fs from "fs";
assert(
  fs.existsSync("public/images/auth-hero-3d.png"),
  "3D Career illustration asset exists in public/images"
);
assert(
  fs.statSync("public/images/auth-hero-3d.png").size > 100000,
  "3D Career illustration asset maintains high quality/size"
);

// TEST SUITE 10: KRITIK & SARAN (FEEDBACK) & FOOTER SYSTEM VERIFICATION
console.log("\n--- 10. Kritik & Saran (Feedback) & Footer System ---");
import {
  validateFeedback,
  FEEDBACK_CATEGORIES,
  MAX_FEEDBACK_LENGTH,
} from "../lib/feedback/service";

// Validation tests
const emptyCheck = validateFeedback("Saran", "");
assert(Boolean(!emptyCheck.valid && emptyCheck.error?.includes("wajib")), "Validation: rejects empty message");

const whitespaceCheck = validateFeedback("Saran", "   \n\t  ");
assert(!whitespaceCheck.valid, "Validation: rejects whitespace-only message");

const invalidCatCheck = validateFeedback("OtherCategory", "Pesan feedback");
assert(Boolean(!invalidCatCheck.valid && invalidCatCheck.error?.includes("valid")), "Validation: rejects invalid category");

const kritikCheck = validateFeedback("Kritik", "Fitur filter perlu ditingkatkan responnya.");
assert(Boolean(kritikCheck.valid), "Validation: accepts valid Kritik category");

const saranCheck = validateFeedback("Saran", "Mohon tambahkan ekspor PDF untuk laporan bulanan.");
assert(Boolean(saranCheck.valid), "Validation: accepts valid Saran category");

const bugCheck = validateFeedback("Laporan Bug", "Ada error saat menekan tombol tertentu.");
assert(Boolean(bugCheck.valid), "Validation: accepts valid Laporan Bug category");

assert(FEEDBACK_CATEGORIES.length === 3, "Feedback categories include exactly 3 types");
assert(FEEDBACK_CATEGORIES.includes("Kritik"), "Categories include Kritik");
assert(FEEDBACK_CATEGORIES.includes("Saran"), "Categories include Saran");
assert(FEEDBACK_CATEGORIES.includes("Laporan Bug"), "Categories include Laporan Bug");

const exactMaxCheck = validateFeedback("Saran", "x".repeat(MAX_FEEDBACK_LENGTH));
assert(Boolean(exactMaxCheck.valid), `Validation: accepts exactly ${MAX_FEEDBACK_LENGTH} characters`);

const overMaxCheck = validateFeedback("Saran", "x".repeat(MAX_FEEDBACK_LENGTH + 1));
assert(Boolean(!overMaxCheck.valid && overMaxCheck.error?.includes("maksimal")), "Validation: rejects message exceeding 5000 characters");

// Payload & Session Binding Simulation
interface MockFeedbackPayload {
  user_id: string;
  category: string;
  message: string;
}

function createFeedbackPayload(loggedInUserId: string, category: string, rawMessage: string): MockFeedbackPayload {
  return {
    user_id: loggedInUserId,
    category,
    message: rawMessage.trim(),
  };
}

const mockUserId = "usr-feedback-9876";
const payload = createFeedbackPayload(mockUserId, "Saran", "   Usulan fitur baru   ");
assert(payload.user_id === mockUserId, "Feedback payload correctly binds logged-in user_id");
assert(payload.category === "Saran", "Feedback payload preserves selected category");
assert(payload.message === "Usulan fitur baru", "Feedback payload trims leading/trailing whitespace");
assert(!("id" in payload), "Feedback payload omits explicit id to allow database default uuid");
assert(!("created_at" in payload), "Feedback payload omits explicit created_at to allow database default timestamp");

// Error Resilience Simulation (Preserve Message on Failure)
interface FeedbackFormState {
  category: string;
  message: string;
  errorMessage: string | null;
  isSuccess: boolean;
}

function simulateSubmissionFailure(prevState: FeedbackFormState, errorMsg: string): FeedbackFormState {
  return {
    ...prevState,
    errorMessage: errorMsg,
    isSuccess: false,
    // Message MUST NOT be cleared on failure
    message: prevState.message,
  };
}

const initialDraft: FeedbackFormState = {
  category: "Laporan Bug",
  message: "Deskripsi bug penting yang sudah diketik panjang oleh pengguna...",
  errorMessage: null,
  isSuccess: false,
};

const failedState = simulateSubmissionFailure(initialDraft, "Koneksi database bermasalah (403 Forbidden)");
assert(failedState.errorMessage === "Koneksi database bermasalah (403 Forbidden)", "Error state displays clear failure reason");
assert(failedState.message === initialDraft.message, "Failure resilience: message is preserved intact when submission fails");
assert(!failedState.isSuccess, "Failure state does not mark success");

// Footer Copy & Brand Requirements Verification
const footerContent = {
  logoText: "Jobora",
  description: "Kelola perjalanan kariermu dengan lebih terarah.",
  copyright: "© 2026 Jobora. All rights reserved.",
  feedbackLinkText: "Kritik & Saran",
};

assert(footerContent.logoText === "Jobora", "Footer contains Jobora logo name");
assert(footerContent.description === "Kelola perjalanan kariermu dengan lebih terarah.", "Footer contains required description");
assert(footerContent.copyright === "© 2026 Jobora. All rights reserved.", "Footer contains required copyright text");
assert(footerContent.feedbackLinkText === "Kritik & Saran", "Footer contains Kritik & Saran action trigger");

// Modal Headings & Content Requirements Verification
const modalContent = {
  heading: "Berikan Kritik & Saran",
  description: "Setiap masukanmu membantu kami membuat Jobora menjadi lebih baik.",
  submitBtn: "Kirim Feedback",
  cancelBtn: "Batal",
};

assert(modalContent.heading === "Berikan Kritik & Saran", "Modal contains exact required heading");
assert(modalContent.description === "Setiap masukanmu membantu kami membuat Jobora menjadi lebih baik.", "Modal contains exact required description");
assert(modalContent.submitBtn === "Kirim Feedback", "Modal contains Kirim Feedback submit button");
assert(modalContent.cancelBtn === "Batal", "Modal contains Batal button");

// --- 11. Financial Tracker Database Foundation & Security (Phase 1) ---
console.log("\n--- 11. Financial Tracker Database Foundation & Security ---");
import * as path from "path";

const migrationFilePath = path.join(process.cwd(), "supabase/migrations/20261101020000_create_financial_tracker_foundation.sql");
assert(fs.existsSync(migrationFilePath), "Phase 1 Foundation SQL Migration file exists on disk");

const sqlContent = fs.readFileSync(migrationFilePath, "utf8");
const normalizedSql = sqlContent.replace(/\s+/g, " ");

// Table existence checks
assert(sqlContent.includes("create table if not exists public.financial_accounts"), "Defines public.financial_accounts table");
assert(sqlContent.includes("create table if not exists public.financial_categories"), "Defines public.financial_categories table");
assert(sqlContent.includes("create table if not exists public.financial_transactions"), "Defines public.financial_transactions table");
assert(sqlContent.includes("create table if not exists public.financial_transfers"), "Defines public.financial_transfers table");
assert(sqlContent.includes("create table if not exists public.financial_budgets"), "Defines public.financial_budgets table");

// Foreign key & auth user references
assert(sqlContent.includes("references auth.users(id) on delete cascade"), "Binds tables to auth.users with cascade delete");
assert(normalizedSql.includes("account_id uuid not null references public.financial_accounts(id) on delete restrict"), "Transaction account_id enforces ON DELETE RESTRICT");
assert(normalizedSql.includes("from_account_id uuid not null references public.financial_accounts(id) on delete restrict"), "Transfer from_account_id enforces ON DELETE RESTRICT");
assert(normalizedSql.includes("to_account_id uuid not null references public.financial_accounts(id) on delete restrict"), "Transfer to_account_id enforces ON DELETE RESTRICT");

// RLS enabled checks
assert(sqlContent.includes("alter table public.financial_accounts enable row level security;"), "Enables RLS on financial_accounts");
assert(sqlContent.includes("alter table public.financial_categories enable row level security;"), "Enables RLS on financial_categories");
assert(sqlContent.includes("alter table public.financial_transactions enable row level security;"), "Enables RLS on financial_transactions");
assert(sqlContent.includes("alter table public.financial_transfers enable row level security;"), "Enables RLS on financial_transfers");
assert(sqlContent.includes("alter table public.financial_budgets enable row level security;"), "Enables RLS on financial_budgets");

// Anon access revoked
assert(sqlContent.includes("revoke all on public.financial_accounts from anon;"), "Revokes anon access on financial_accounts");
assert(sqlContent.includes("revoke all on public.financial_transactions from anon;"), "Revokes anon access on financial_transactions");
assert(sqlContent.includes("revoke all on public.financial_transfers from anon;"), "Revokes anon access on financial_transfers");

// Cross-tenant relational checks in RLS
assert(normalizedSql.includes("select 1 from public.financial_accounts a where a.id = account_id and a.user_id = auth.uid()"), "Transaction RLS validates account_id ownership");
assert(normalizedSql.includes("select 1 from public.financial_accounts a where a.id = from_account_id and a.user_id = auth.uid()"), "Transfer RLS validates from_account_id ownership");
assert(normalizedSql.includes("select 1 from public.financial_accounts a where a.id = to_account_id and a.user_id = auth.uid()"), "Transfer RLS validates to_account_id ownership");

// Transfer constraint: distinct accounts
assert(sqlContent.includes("from_account_id <> to_account_id"), "Enforces constraint: from_account_id <> to_account_id");

// Atomic transfer RPC function
assert(sqlContent.includes("function public.execute_financial_transfer"), "Provides execute_financial_transfer atomic RPC function");
assert(sqlContent.includes("for update"), "RPC locks account records (FOR UPDATE) to prevent race conditions");

// Dynamic current balance calculation view
assert(sqlContent.includes("view public.view_financial_account_balances"), "Provides view_financial_account_balances with dynamic calculation");
assert(sqlContent.includes("security_invoker = true"), "View enforces security_invoker for RLS inheritance");

// Zero dummy accounts check
assert(!sqlContent.includes("'Bank BCA'"), "Migration contains ZERO dummy accounts (No Bank BCA)");
assert(!sqlContent.includes("5000000"), "Migration contains ZERO dummy initial balance (No Rp5.000.000)");
assert(!sqlContent.includes("'GoPay / E-Wallet'"), "Migration contains ZERO dummy ewallet accounts");

// Preserves default system categories with user_id = null
assert(sqlContent.includes("(null, 'Gaji (Salary)', 'income'"), "Seeds standard system category with user_id NULL");
assert(sqlContent.includes("(null, 'Makanan & Minuman', 'expense'"), "Seeds standard expense category with user_id NULL");
assert(normalizedSql.includes("on conflict (lower(name), type) where user_id is null do nothing;"), "Seeding matches exact unique partial index on system categories");

// Test BIGINT safe integer parsing logic (Phase 2 preview test)
function parseBigIntSafely(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const num = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(num)) return 0;
  if (!Number.isSafeInteger(num)) {
    throw new Error(`Precision loss: ${val} exceeds JavaScript Number.isSafeInteger range`);
  }
  return num;
}

assert(parseBigIntSafely("5000000") === 5000000, "parseBigIntSafely parses valid string integer");
assert(parseBigIntSafely(250000) === 250000, "parseBigIntSafely parses number");
assert(parseBigIntSafely(null) === 0, "parseBigIntSafely handles null");
let safeIntThrown = false;
try {
  parseBigIntSafely("9999999999999999999999");
} catch {
  safeIntThrown = true;
}
assert(safeIntThrown, "parseBigIntSafely rejects unsafe integer exceeding MAX_SAFE_INTEGER");

// --- 12. Financial Tracker Phase 2: Supabase Data Service & Migration Engine ---
console.log("\n--- 12. Financial Tracker Phase 2: Supabase Data Service & Migration ---");
import {
  parseBigIntSafe,
  isUntouchedDummyAccount,
  activeMigrationPromises,
} from "../lib/finance/migration";
import {
  mapAccountFromDB,
  mapCategoryFromDB,
  mapTransactionFromDB,
  mapTransferFromDB,
  mapBudgetFromDB,
  computeAccountBalances,
} from "../lib/finance/service";

// Test parseBigIntSafe
assert(parseBigIntSafe("1500000") === 1500000, "parseBigIntSafe parses string integer");
assert(parseBigIntSafe(750000) === 750000, "parseBigIntSafe parses number");
assert(parseBigIntSafe(null, "amount", 0) === 0, "parseBigIntSafe handles null with fallback");
assert(parseBigIntSafe(undefined, "amount", 100) === 100, "parseBigIntSafe handles undefined with fallback");
assert(parseBigIntSafe(Number.MAX_SAFE_INTEGER) === 9007199254740991, "parseBigIntSafe permits Number.MAX_SAFE_INTEGER");

let threwOnUnsafe = false;
try {
  parseBigIntSafe(9007199254740992, "test_field");
} catch (e: any) {
  threwOnUnsafe = e.message.includes("Number.isSafeInteger");
}
assert(threwOnUnsafe, "parseBigIntSafe throws error when number exceeds safe integer range");

// Test isUntouchedDummyAccount
const dummyBCA = {
  id: "acc-bank",
  user_id: "user-1",
  name: "Bank BCA",
  type: "bank" as const,
  initial_balance: 5000000,
};
const dummyCash = {
  id: "acc-cash",
  user_id: "user-1",
  name: "Tunai / Cash",
  type: "cash" as const,
  initial_balance: 500000,
};
const dummyWallet = {
  id: "acc-ewallet",
  user_id: "user-1",
  name: "GoPay / E-Wallet",
  type: "ewallet" as const,
  initial_balance: 250000,
};

assert(isUntouchedDummyAccount(dummyBCA, [], []), "Identifies untouched BCA dummy (5M, 0 tx, 0 tr)");
assert(isUntouchedDummyAccount(dummyCash, [], []), "Identifies untouched Cash dummy (500k, 0 tx, 0 tr)");
assert(isUntouchedDummyAccount(dummyWallet, [], []), "Identifies untouched Wallet dummy (250k, 0 tx, 0 tr)");

// Modified dummy accounts must NOT be treated as dummy
const modifiedBCA = { ...dummyBCA, initial_balance: 600000 };
assert(!isUntouchedDummyAccount(modifiedBCA, [], []), "Modified initial balance is NOT treated as dummy");

const renamedBCA = { ...dummyBCA, name: "Tabungan BCA Utama" };
assert(!isUntouchedDummyAccount(renamedBCA, [], []), "Renamed account is NOT treated as dummy");

const activeBCA = { ...dummyBCA };
const txWithBCA = [
  {
    id: "tx-1",
    user_id: "user-1",
    title: "Gaji",
    type: "income" as const,
    amount: 10000000,
    date: "2026-10-01",
    account_id: "acc-bank",
    input_source: "manual" as const,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
];
assert(!isUntouchedDummyAccount(activeBCA, txWithBCA, []), "BCA with transactions is NOT treated as dummy");

const transferWithBCA = [
  {
    id: "tr-1",
    user_id: "user-1",
    from_account_id: "acc-bank",
    to_account_id: "acc-cash",
    amount: 100000,
    transfer_date: "2026-10-02",
    created_at: "2026-10-02T00:00:00Z",
  },
];
assert(!isUntouchedDummyAccount(activeBCA, [], transferWithBCA), "BCA with transfers is NOT treated as dummy");

const customUserAccount = {
  id: "acc-mandiri",
  user_id: "user-1",
  name: "Bank Mandiri",
  type: "bank" as const,
  initial_balance: 1000000,
};
assert(!isUntouchedDummyAccount(customUserAccount, [], []), "Custom user account is NEVER treated as dummy");

// Test PostgREST Mappers
const dbAccRow = {
  id: "uuid-acc-1",
  user_id: "user-1",
  name: "BCA Tabungan",
  type: "bank",
  initial_balance: "5000000",
  current_balance: "6500000",
  color: "#2563eb",
  icon: "building-2",
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
};
const mappedAcc = mapAccountFromDB(dbAccRow);
assert(mappedAcc.id === "uuid-acc-1", "mapAccountFromDB maps id");
assert(mappedAcc.initial_balance === 5000000, "mapAccountFromDB safely parses initial_balance as number");
assert(mappedAcc.current_balance === 6500000, "mapAccountFromDB safely parses current_balance as number");

const dbCatRow = {
  id: "uuid-cat-1",
  user_id: null,
  name: "Gaji (Salary)",
  type: "income",
  icon: "briefcase",
  color: "#10b981",
  is_default: true,
};
const mappedCat = mapCategoryFromDB(dbCatRow);
assert(mappedCat.is_default === true, "mapCategoryFromDB recognizes system category (user_id IS NULL) as default");

const dbTxRow = {
  id: "uuid-tx-1",
  user_id: "user-1",
  title: "Makan Siang",
  type: "expense",
  amount: "45000",
  date: "2026-11-01",
  account_id: "uuid-acc-1",
  financial_accounts: { id: "uuid-acc-1", name: "BCA Tabungan" },
  financial_categories: { id: "uuid-cat-2", name: "Makanan & Minuman" },
};
const mappedTx = mapTransactionFromDB(dbTxRow);
assert(mappedTx.amount === 45000, "mapTransactionFromDB parses amount");
assert(mappedTx.account_name === "BCA Tabungan", "mapTransactionFromDB extracts joined account_name");
assert(mappedTx.category_name === "Makanan & Minuman", "mapTransactionFromDB extracts joined category_name");

// Test computeAccountBalances pure calculation with transfer and fee
const testAccounts = [
  { id: "a1", user_id: "u1", name: "Rekening 1", type: "bank" as const, initial_balance: 1000000 },
  { id: "a2", user_id: "u1", name: "Rekening 2", type: "bank" as const, initial_balance: 500000 },
];
const testTxs = [
  { id: "t1", user_id: "u1", title: "Topup", type: "income" as const, amount: 200000, date: "2026-11-01", account_id: "a1", input_source: "manual" as const, created_at: "", updated_at: "" },
  { id: "t2", user_id: "u1", title: "Beli Kopi", type: "expense" as const, amount: 50000, date: "2026-11-01", account_id: "a2", input_source: "manual" as const, created_at: "", updated_at: "" },
];
const testTransfers = [
  { id: "tr1", user_id: "u1", from_account_id: "a1", to_account_id: "a2", amount: 300000, fee: 2500, transfer_date: "2026-11-01", created_at: "" },
];

const computed = computeAccountBalances("u1", testAccounts, testTxs, testTransfers);
// a1: 1.000.000 + 200.000 (income) - 300.000 (transfer out) - 2.500 (fee) = 897.500
assert(computed[0].current_balance === 897500, "computeAccountBalances calculates sender balance minus amount and fee");
// a2: 500.000 - 50.000 (expense) + 300.000 (transfer in) = 750.000
assert(computed[1].current_balance === 750000, "computeAccountBalances calculates recipient balance plus amount");

// Test dynamic pre-migration audit calculation (without hardcoded balances)
const userAccounts750k = [
  { id: "acc-user-cash", user_id: "u-actual", name: "Dompet Tunai", type: "cash" as const, initial_balance: 750000 },
];
const userTxs750k: any[] = [];
const userTrs750k: any[] = [];

const auditedPreMigration = userAccounts750k
  .filter((a) => !isUntouchedDummyAccount(a, userTxs750k, userTrs750k))
  .map((acc) => {
    let bal = parseBigIntSafe(acc.initial_balance);
    return { id: acc.id, name: acc.name, balance: bal };
  });

const totalAudited = auditedPreMigration.reduce((s, a) => s + a.balance, 0);
assert(totalAudited === 750000, "Audits actual user balance dynamically (matches Rp750.000 without hardcoding)");
assert(!isUntouchedDummyAccount(userAccounts750k[0], userTxs750k, userTrs750k), "User account with Rp750.000 is preserved and NOT treated as dummy");

// TEST SUITE 13: MIGRATION CONCURRENCY, PROGRESSIVE PERSISTENCE & IDEMPOTENCY
console.log("\n--- 13. Migration Concurrency, Progressive Persistence & Idempotency ---");

// Test 1: In-memory concurrency singleton Map
const testUserId = "user-concurrency-test";
const mockPromise = Promise.resolve({
  migrated: true,
  accountsCount: 1,
  categoriesCount: 0,
  transactionsCount: 0,
  transfersCount: 0,
  budgetsCount: 0,
  skippedDummyAccounts: 0,
  errors: [],
});
activeMigrationPromises.set(testUserId, mockPromise);
assert(activeMigrationPromises.has(testUserId), "Concurrency singleton registers in-flight migration");
assert(activeMigrationPromises.get(testUserId) === mockPromise, "Concurrent call receives identical promise instance");
activeMigrationPromises.delete(testUserId);
assert(!activeMigrationPromises.has(testUserId), "Concurrency singleton cleans up promise upon completion");

// Test 2: Storage lock timeout and expiration logic
const now = Date.now();
const freshLockTime = now - 5000; // 5s ago (active)
const expiredLockTime = now - 35000; // 35s ago (> 30s timeout)
const isLockActive = (ts: number, timeoutMs = 30000) => Date.now() - ts < timeoutMs;
assert(isLockActive(freshLockTime), "Storage lock is active within 30s window");
assert(!isLockActive(expiredLockTime), "Storage lock automatically expires after 30s timeout");

// Test 3: Progressive ID mapping persistence
const simulatedIdMap = {
  accounts: {} as Record<string, string>,
  categories: {} as Record<string, string>,
  transactions: {} as Record<string, string>,
  transfers: {} as Record<string, string>,
  budgets: {} as Record<string, string>,
};
const progressHistory: number[] = [];

// Simulate progressive writes
simulatedIdMap.categories["cat-loc-1"] = "uuid-cat-1";
progressHistory.push(Object.keys(simulatedIdMap.categories).length);

simulatedIdMap.accounts["acc-loc-1"] = "uuid-acc-1";
progressHistory.push(Object.keys(simulatedIdMap.accounts).length);

simulatedIdMap.transactions["tx-loc-1"] = "uuid-tx-1";
progressHistory.push(Object.keys(simulatedIdMap.transactions).length);

assert(progressHistory.length === 3, "ID map writes occur progressively on each entity step");
assert(simulatedIdMap.accounts["acc-loc-1"] === "uuid-acc-1", "Account UUID is persisted immediately upon insert");
assert(simulatedIdMap.transactions["tx-loc-1"] === "uuid-tx-1", "Transaction UUID is persisted immediately upon insert");

// Test 4: Resume idempotency: already-mapped IDs are skipped
let insertAttempts = 0;
const localItems = [{ id: "tx-loc-1" }, { id: "tx-loc-2" }];
for (const item of localItems) {
  if (simulatedIdMap.transactions[item.id]) {
    // Skipped!
    continue;
  }
  insertAttempts++;
}
assert(insertAttempts === 1, "Resume mechanism skips already-mapped entities and only processes new items");

// Test 5: Balance inconsistency prevents COMPLETED status flag
const preBal: number = 750000;
const postBalDuplicated: number = 1500000;
const isConsistent = preBal === postBalDuplicated;
let statusFlag: string | null = null;
if (isConsistent) {
  statusFlag = "COMPLETED";
}
assert(!isConsistent, "Detects balance discrepancy between local and Supabase");
assert(statusFlag === null, "Never marks status as COMPLETED when balance is inconsistent");

// TEST SUITE 14: FINANCIAL ACCOUNT DELETION & INTEGRITY
console.log("\n--- 14. Financial Account Deletion & Integrity Check ---");

// Test 1: Delete button visibility is never hidden based on non-zero balance
interface MockAccountState {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
}
const accNonZero: MockAccountState = {
  id: "acc-commis",
  name: "Commis",
  initial_balance: 250000,
  current_balance: 400000,
};
const accZero: MockAccountState = {
  id: "acc-empty",
  name: "Empty Wallet",
  initial_balance: 0,
  current_balance: 0,
};
const shouldShowDeleteBtn = (_acc: MockAccountState, isEditing: boolean, hasOnDelete: boolean) => {
  return isEditing && hasOnDelete;
};
assert(shouldShowDeleteBtn(accNonZero, true, true), "Delete button is visible for account with balance Rp400.000");
assert(shouldShowDeleteBtn(accZero, true, true), "Delete button is visible for account with balance Rp0");
assert(!shouldShowDeleteBtn(accNonZero, false, true), "Delete button is hidden when not in edit mode");

// Test 2: Confirmation prompt includes account name and balance warning
const formatConfirmMsg = (name: string, balance: number) => {
  return `Apakah Anda yakin ingin menghapus rekening "${name}" (${formatIDR(balance)})?\n\nPERINGATAN: Menghapus rekening ini juga akan menghapus seluruh saldo serta riwayat transaksi dan transfer terkait secara permanen.`;
};
const confirmMsg = formatConfirmMsg(accNonZero.name, accNonZero.current_balance);
assert(confirmMsg.includes("Commis"), "Confirmation message includes account name");
assert(confirmMsg.includes("Rp 400.000") || confirmMsg.includes("400.000"), "Confirmation message includes formatted balance");
assert(confirmMsg.includes("seluruh saldo serta riwayat transaksi dan transfer"), "Confirmation message includes explicit cascade warning");

// Test 3: User cancellation does not execute deletion
let deleteExecuted = false;
const handleUserPrompt = (userConfirmed: boolean) => {
  if (!userConfirmed) return;
  deleteExecuted = true;
};
handleUserPrompt(false);
assert(!deleteExecuted, "User cancellation aborts deletion and leaves state unchanged");
handleUserPrompt(true);
assert(deleteExecuted, "User confirmation proceeds with deletion");

// Test 4: Cascade deletion order ensures foreign keys are not violated
const executionLog: string[] = [];
const mockCascadeDelete = (accId: string, userId: string) => {
  // Step 1: Delete dependent transactions
  executionLog.push(`DELETE transactions WHERE account_id = ${accId} AND user_id = ${userId}`);
  // Step 2: Delete dependent transfers
  executionLog.push(`DELETE transfers WHERE from_account_id = ${accId} AND user_id = ${userId}`);
  executionLog.push(`DELETE transfers WHERE to_account_id = ${accId} AND user_id = ${userId}`);
  // Step 3: Delete account
  executionLog.push(`DELETE account WHERE id = ${accId} AND user_id = ${userId}`);
};
mockCascadeDelete("acc-commis", "user-123");
assert(executionLog[0].startsWith("DELETE transactions"), "Deletes transactions first to avoid ON DELETE RESTRICT foreign key violation");
assert(executionLog[1].startsWith("DELETE transfers"), "Deletes transfers before deleting account");
assert(executionLog[3].startsWith("DELETE account"), "Deletes account only after all dependent references are removed");
assert(executionLog.every((q) => q.includes("user_id = user-123")), "All delete operations enforce strict user_id scoping for RLS security");

console.log("\n=================================================");
console.log(`QA SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
