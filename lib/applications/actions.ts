"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeDateToISO } from "./format";
import { AddApplicationFormData } from "@/components/applications/AddApplicationModal";

export interface CreateApplicationResult {
  success?: boolean;
  error?: string;
}

export interface UpdateApplicationResult {
  success?: boolean;
  error?: string;
}

export interface DeleteApplicationResult {
  success?: boolean;
  error?: string;
}

export interface ImportApplicationInput {
  company: string;
  position: string;
  type?: string;
  status?: string;
  platform?: string;
  date?: string;
}

export interface ImportResult {
  success?: boolean;
  count?: number;
  error?: string;
}

/**
 * Server Action to create a new application in Supabase:
 * - Verifies user is authenticated server-side.
 * - Resolves platform name (uses customPlatform when "Lainnya (Others)" is selected).
 * - Normalizes date to ISO YYYY-MM-DD.
 * - Revalidates both /dashboard and /applications paths.
 */
export async function createApplication(
  data: AddApplicationFormData
): Promise<CreateApplicationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi autentikasi tidak valid. Silakan login kembali." };
    }

    const company = data.company?.trim();
    const position = data.position?.trim();
    const type = normalizeJobType(data.jobType);
    const status = normalizeStatus(data.initialStatus);
    const platform =
      data.platform === "Lainnya (Others)" && data.customPlatform?.trim()
        ? data.customPlatform.trim()
        : data.platform?.trim() || "Tidak dicatat";
    const date = normalizeDateToISO(data.applyDate || "");

    if (!company || !position || !type || !status) {
      return { error: "Semua kolom wajib harus diisi." };
    }

    const { error: insertError } = await supabase.from("applications").insert({
      user_id: user.id,
      company,
      position,
      type,
      status,
      platform,
      date,
    });

    if (insertError) {
      console.error("Failed to insert application:", insertError);
      return { error: insertError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in createApplication:", err);
    return { error: "Terjadi kesalahan sistem saat menyimpan lamaran." };
  }
}

/**
 * Server Action to update an existing application in Supabase:
 * - Verifies user is authenticated and owns the application.
 * - Normalizes data and updates fields.
 * - Revalidates /dashboard and /applications.
 */
export async function updateApplication(
  id: string,
  data: AddApplicationFormData
): Promise<UpdateApplicationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi autentikasi tidak valid. Silakan login kembali." };
    }

    if (!id) {
      return { error: "ID lamaran tidak valid." };
    }

    const company = data.company?.trim();
    const position = data.position?.trim();
    const type = normalizeJobType(data.jobType);
    const status = normalizeStatus(data.initialStatus);
    const platform =
      data.platform === "Lainnya (Others)" && data.customPlatform?.trim()
        ? data.customPlatform.trim()
        : data.platform?.trim() || "Tidak dicatat";
    const date = normalizeDateToISO(data.applyDate || "");

    if (!company || !position || !type || !status) {
      return { error: "Semua kolom wajib harus diisi." };
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        company,
        position,
        type,
        status,
        platform,
        date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update application:", updateError);
      return { error: updateError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in updateApplication:", err);
    return { error: "Terjadi kesalahan sistem saat memperbarui lamaran." };
  }
}

/**
 * Server Action to quickly update an application's status (used by Kanban drag-and-drop & status actions):
 * - Verifies user is authenticated and owns the application.
 * - Records status history.
 * - Revalidates /dashboard and /applications.
 */
export async function updateApplicationStatus(
  id: string,
  newStatus: string
): Promise<UpdateApplicationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi autentikasi tidak valid. Silakan login kembali." };
    }

    if (!id || !newStatus) {
      return { error: "ID dan status lamaran wajib diisi." };
    }

    const normalizedNewStatus = normalizeStatus(newStatus);

    // Fetch existing status for accurate history recording
    const { data: existingApp } = await supabase
      .from("applications")
      .select("status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const previousStatus = existingApp?.status || "Unknown";

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: normalizedNewStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update application status:", updateError);
      return { error: updateError.message };
    }

    // Record history safely (non-blocking)
    if (previousStatus !== normalizedNewStatus) {
      try {
        await supabase.from("application_status_history").insert({
          user_id: user.id,
          application_id: id,
          previous_status: previousStatus,
          new_status: normalizedNewStatus,
          created_at: new Date().toISOString(),
        });
      } catch (histErr) {
        console.warn("Failed recording status history to Supabase:", histErr);
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in updateApplicationStatus:", err);
    return { error: "Terjadi kesalahan sistem saat memperbarui status lamaran." };
  }
}

/**
 * Server Action to delete an application from Supabase:
 * - Verifies user is authenticated and owns the application.
 * - Deletes the row.
 * - Revalidates /dashboard and /applications.
 */
export async function deleteApplication(
  id: string
): Promise<DeleteApplicationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi autentikasi tidak valid. Silakan login kembali." };
    }

    if (!id) {
      return { error: "ID lamaran tidak valid." };
    }

    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to delete application:", deleteError);
      return { error: deleteError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in deleteApplication:", err);
    return { error: "Terjadi kesalahan sistem saat menghapus lamaran." };
  }
}

function normalizeJobType(type?: string): string {
  if (!type) return "Full-time";
  const t = type.trim();
  const lower = t.toLowerCase();

  // Management Trainee (MT) is a Full-time accelerated track
  if (lower.includes("management trainee") || lower.includes("mt")) {
    return "Full-time";
  }
  if (lower.includes("intern") || lower.includes("magang")) {
    return "Internship";
  }
  if (
    lower.includes("contract") ||
    lower.includes("kontrak") ||
    lower.includes("part-time") ||
    lower.includes("part time")
  ) {
    return "Contract";
  }
  if (
    lower.includes("freelance") ||
    lower.includes("lepas") ||
    lower.includes("project")
  ) {
    return "Freelance";
  }

  // Exact matching for valid enum types in DB
  if (
    t === "Full-time" ||
    t === "Internship" ||
    t === "Contract" ||
    t === "Freelance"
  ) {
    return t;
  }

  // Default fallback to "Full-time" to satisfy applications_type_check
  return "Full-time";
}

function normalizeStatus(status?: string): string {
  if (!status) return "Submitted";
  const s = status.trim();
  const lower = s.toLowerCase();

  if (
    s === "Submitted" ||
    s === "Test" ||
    s === "Task" ||
    s === "Interview HR" ||
    s === "Interview User" ||
    s === "LGD" ||
    s === "FGD" ||
    s === "Offering" ||
    s === "Rejected" ||
    s === "Ghosted" ||
    s === "Withdrawn"
  ) {
    return s;
  }

  if (
    lower === "emailed back" ||
    lower === "applied" ||
    lower === "terkirim" ||
    lower === "melamar" ||
    lower === "submitted"
  ) {
    return "Submitted";
  }
  if (lower.includes("test") || lower.includes("tes")) {
    return "Test";
  }
  if (lower.includes("task") || lower.includes("tugas")) {
    return "Task";
  }
  if (lower.includes("user")) {
    return "Interview User";
  }
  if (
    lower.includes("interview") ||
    lower.includes("wawancara") ||
    lower.includes("hr")
  ) {
    return "Interview HR";
  }
  if (lower.includes("lgd")) {
    return "LGD";
  }
  if (lower.includes("fgd")) {
    return "FGD";
  }
  if (lower.includes("offer") || lower.includes("diterima")) {
    return "Offering";
  }
  if (lower.includes("reject") || lower.includes("ditolak")) {
    return "Rejected";
  }
  if (lower.includes("ghost")) {
    return "Ghosted";
  }
  if (lower.includes("withdraw") || lower.includes("batal")) {
    return "Withdrawn";
  }

  return "Submitted";
}

function normalizePlatform(platform?: string): string {
  if (!platform) return "LinkedIn";
  const p = platform.trim();
  const lower = p.toLowerCase();

  if (
    lower.includes("company website") ||
    lower.includes("karir") ||
    lower.includes("portal") ||
    lower.includes("website")
  ) {
    return "Career Portal";
  }
  if (lower.includes("linkedin")) return "LinkedIn";
  if (lower.includes("kalibrr")) return "Kalibrr";
  if (lower.includes("jobstreet")) return "JobStreet";
  if (lower.includes("glints")) return "Glints";
  if (
    lower.includes("email") ||
    lower.includes("google") ||
    lower.includes("form") ||
    lower.includes("other") ||
    lower.includes("lain")
  ) {
    return "Lainnya (Others)";
  }
  return p;
}

/**
 * Server Action to import multiple applications in bulk (from CSV / JSON).
 */
export async function importApplications(
  items: ImportApplicationInput[]
): Promise<ImportResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Sesi autentikasi tidak valid. Silakan login kembali." };
    }

    if (!items || items.length === 0) {
      return { error: "Tidak ada data yang diimpor." };
    }

    const validRows = items
      .filter((row) => row.company?.trim() && row.position?.trim())
      .map((row) => ({
        user_id: user.id,
        company: row.company.trim(),
        position: row.position.trim(),
        type: normalizeJobType(row.type),
        status: normalizeStatus(row.status),
        platform: normalizePlatform(row.platform),
        date: normalizeDateToISO(row.date || ""),
      }));

    if (validRows.length === 0) {
      return {
        error:
          "Semua baris data tidak valid. Pastikan kolom company dan position terisi.",
      };
    }

    const { error: insertError } = await supabase
      .from("applications")
      .insert(validRows);

    if (insertError) {
      console.error("Failed to bulk insert applications:", insertError);
      return { error: insertError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true, count: validRows.length };
  } catch (err: unknown) {
    console.error("Unexpected error in importApplications:", err);
    return { error: "Terjadi kesalahan sistem saat mengimpor data lamaran." };
  }
}

function getPastDateISO(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

/**
 * Server Action to seed 18 realistic sample applications spanning the last 6 months.
 * Populates historical data so the activity chart, KPIs, and breakdowns display clearly.
 */
export async function seedSampleApplications(): Promise<ImportResult> {
  const sampleData: ImportApplicationInput[] = [
    // Month 5 ago (~140-150 days)
    {
      company: "Tokopedia",
      position: "Senior Frontend Engineer",
      type: "Full-time",
      status: "Interview HR",
      platform: "LinkedIn",
      date: getPastDateISO(145),
    },
    {
      company: "GoTo Financial",
      position: "Backend Engineer (Go)",
      type: "Full-time",
      status: "Offering",
      platform: "LinkedIn",
      date: getPastDateISO(138),
    },

    // Month 4 ago (~110-125 days)
    {
      company: "Traveloka",
      position: "Product Manager",
      type: "Full-time",
      status: "Rejected",
      platform: "Website Perusahaan",
      date: getPastDateISO(120),
    },
    {
      company: "Shopee",
      position: "Software Engineer",
      type: "Full-time",
      status: "Test",
      platform: "Glints",
      date: getPastDateISO(112),
    },
    {
      company: "Blibli",
      position: "UI/UX Designer",
      type: "Full-time",
      status: "Interview User",
      platform: "JobStreet",
      date: getPastDateISO(104),
    },

    // Month 3 ago (~80-95 days)
    {
      company: "Tiket.com",
      position: "Frontend Engineer (React)",
      type: "Remote",
      status: "Offering",
      platform: "LinkedIn",
      date: getPastDateISO(85),
    },
    {
      company: "Bank Mandiri",
      position: "IT Specialist",
      type: "Kontrak",
      status: "Rejected",
      platform: "JobStreet",
      date: getPastDateISO(78),
    },
    {
      company: "BCA Digital",
      position: "Mobile Developer (Android)",
      type: "Full-time",
      status: "Interview HR",
      platform: "LinkedIn",
      date: getPastDateISO(72),
    },

    // Month 2 ago (~50-65 days)
    {
      company: "Telkomsel",
      position: "Data Analyst",
      type: "Full-time",
      status: "Task",
      platform: "Kalibrr",
      date: getPastDateISO(62),
    },
    {
      company: "Astra International",
      position: "System Analyst",
      type: "Full-time",
      status: "Rejected",
      platform: "Website Perusahaan",
      date: getPastDateISO(55),
    },
    {
      company: "Grab",
      position: "Backend Engineer",
      type: "Remote",
      status: "Interview User",
      platform: "LinkedIn",
      date: getPastDateISO(48),
    },
    {
      company: "Midtrans",
      position: "QA Automation Engineer",
      type: "Full-time",
      status: "Interview HR",
      platform: "LinkedIn",
      date: getPastDateISO(42),
    },

    // Month 1 ago (~20-35 days)
    {
      company: "Halodoc",
      position: "Fullstack Developer",
      type: "Remote",
      status: "Test",
      platform: "Glints",
      date: getPastDateISO(32),
    },
    {
      company: "Ruangguru",
      position: "Tech Lead",
      type: "Kontrak",
      status: "Task",
      platform: "JobStreet",
      date: getPastDateISO(25),
    },
    {
      company: "Xendit",
      position: "Integration Engineer",
      type: "Full-time",
      status: "Submitted",
      platform: "LinkedIn",
      date: getPastDateISO(18),
    },

    // Current month (< 15 days)
    {
      company: "Dana",
      position: "Security Engineer",
      type: "Full-time",
      status: "Interview User",
      platform: "LinkedIn",
      date: getPastDateISO(11),
    },
    {
      company: "Kredivo",
      position: "DevOps Engineer",
      type: "Full-time",
      status: "Submitted",
      platform: "Glints",
      date: getPastDateISO(6),
    },
    {
      company: "eFishery",
      position: "IoT & Cloud Engineer",
      type: "Remote",
      status: "Submitted",
      platform: "LinkedIn",
      date: getPastDateISO(2),
    },
  ];

  return importApplications(sampleData);
}
