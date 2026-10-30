export type ApplicationStatus =
  | "Submitted"
  | "Test"
  | "Task"
  | "Interview HR"
  | "Interview User"
  | "LGD"
  | "FGD"
  | "Offering"
  | "Rejected";

export interface Application {
  id: string;
  user_id: string;
  company: string;
  position: string;
  type: string;
  date: string; // YYYY-MM-DD
  status: ApplicationStatus | string;
  platform: string;
  screenshot_url?: string | null;
  created_at: string;
  updated_at: string;
}
