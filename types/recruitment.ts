export type RecruitmentEventType =
  | "HR Interview"
  | "User Interview"
  | "Technical Interview"
  | "Assessment Deadline"
  | "Application Deadline"
  | "Follow-up Reminder"
  | "Other Recruitment Events";

export interface RecruitmentEvent {
  id: string;
  user_id: string;
  application_id?: string | null;
  title: string;
  event_type: RecruitmentEventType | string;
  start_time: string; // ISO 8601 (YYYY-MM-DDTHH:mm:ss)
  end_time?: string | null;
  is_all_day: boolean;
  location?: string | null;
  notes?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStatusHistory {
  id: string;
  user_id: string;
  application_id: string;
  previous_status: string;
  new_status: string;
  created_at: string;
}

export interface KanbanColumnConfig {
  id: string;
  status: string; // The database status value mapped to this column
  title: string;  // Display label
  badgeClass: string;
  badgeColor: string;
  badgeBg: string;
}
