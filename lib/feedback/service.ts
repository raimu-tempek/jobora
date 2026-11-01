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

    // 1. Ambil user yang sedang login dari session Supabase
    let userId: string | null = null;
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      userId = sessionData.session.user.id;
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        userId = userData.user.id;
      }
    }

    if (!userId) {
      return {
        success: false,
        error:
          "Sesi login tidak ditemukan. Harap pastikan Anda telah login sebelum mengirim feedback.",
      };
    }

    // 2. Insert ke tabel public.feedback
    const { error: insertError } = await supabase.from("feedback").insert({
      user_id: userId,
      category: input.category,
      message: input.message.trim(),
    });

    if (insertError) {
      console.error("Supabase feedback insert error:", insertError);
      return {
        success: false,
        error:
          insertError.message ||
          "Gagal menyimpan feedback ke database. Silakan coba kembali.",
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
