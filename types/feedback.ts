export type FeedbackCategory = "Kritik" | "Saran" | "Laporan Bug";

export interface FeedbackInput {
  category: FeedbackCategory;
  message: string;
}

export interface FeedbackRecord {
  id?: string;
  user_id: string;
  category: FeedbackCategory;
  message: string;
  created_at?: string;
}

export interface FeedbackSubmissionResult {
  success: boolean;
  error?: string;
}
