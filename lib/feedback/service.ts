import { createClient } from "@/lib/supabase/client";
import { FeedbackCategory, FeedbackInput, FeedbackSubmissionResult } from "@/types/feedback";

export type { FeedbackCategory, FeedbackInput, FeedbackSubmissionResult };

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "Kritik",
  "Saran",
  "Laporan Bug",
];

export const MAX_FEEDBACK_LENGTH = 5000;

/**
 * Validates feedback input fields.
 */
export function validateFeedback(
  category: string,
  message: string
): { valid: boolean; error?: string } {
  if (!category || !FEEDBACK_CATEGORIES.includes(category as FeedbackCategory)) {
    return {
      valid: false,
      error: "Pilih salah satu jenis feedback yang valid (Kritik, Saran, atau Laporan Bug).",
    };
  }

  const trimmedMessage = message ? message.trim() : "";
  if (!trimmedMessage) {
    return {
      valid: false,
      error: "Pesan feedback wajib diisi.",
    };
  }

  if (trimmedMessage.length > MAX_FEEDBACK_LENGTH) {
    return {
      valid: false,
      error: `Pesan feedback melebihi batas maksimal ${MAX_FEEDBACK_LENGTH} karakter (saat ini ${trimmedMessage.length} karakter).`,
    };
  }

  return { valid: true };
}

/**
 * Submits feedback directly to public.feedback using the existing Supabase client.
 * Retrieves the currently logged-in user session, sets user_id, category, and message.
 */
export async function submitFeedback(
  input: FeedbackInput
): Promise<FeedbackSubmissionResult> {
  const validation = validateFeedback(input.category, input.message);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    const supabase = createClient();

    // 1. Ambil user yang sedang login dari session / auth Supabase
    let userId: string | null = null;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      userId = userData.user.id;
    } else {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        userId = sessionData.session.user.id;
      }
    }

    if (!userId) {
      return {
        success: false,
        error:
          "Sesi login tidak ditemukan. Harap pastikan Anda telah login sebelum mengirim feedback.",
      };
    }

    // 2. Insert ke tabel public.feedback sesuai struktur tabel: user_id, category, message
    const payload = {
      user_id: userId,
      category: input.category,
      message: input.message.trim(),
    };

    const response = await supabase.from("feedback").insert(payload);
    const insertError = response.error;
    const status = response.status;

    if (insertError) {
      const errorDetails = {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        status: status,
      };

      console.error("Supabase feedback insert error:", errorDetails);

      let userFacingError = insertError.message || "Gagal menyimpan feedback ke database.";
      if (
        insertError.code === "42501" ||
        insertError.message?.toLowerCase().includes("permission denied")
      ) {
        userFacingError = `Izin akses ditolak database (Kode: ${insertError.code}). ${
          insertError.hint ||
          "Tabel feedback membutuhkan izin INSERT untuk role authenticated di Supabase."
        }`;
      }

      return {
        success: false,
        error: userFacingError,
        errorDetails,
      };
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error("Unexpected error submitting feedback:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan sistem saat mengirim feedback. Silakan coba lagi.",
    };
  }
}
