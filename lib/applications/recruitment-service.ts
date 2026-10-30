import {
  RecruitmentEvent,
  RecruitmentEventType,
  ApplicationStatusHistory,
} from "@/types/recruitment";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

const STORAGE_KEYS = {
  EVENTS: (userId: string) => `jobora_recruitment_events_${userId}`,
  HISTORY: (userId: string) => `jobora_status_history_${userId}`,
};

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error("Error reading localStorage:", key, e);
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error writing localStorage:", key, e);
  }
}

/**
 * Validates start and end times.
 * Ensures start_time is present and valid, and if end_time exists, it is not earlier than start_time.
 */
export function validateEventTimes(
  startTime: string,
  endTime?: string | null
): { valid: boolean; error?: string } {
  if (!startTime) {
    return { valid: false, error: "Waktu mulai wajib diisi." };
  }

  const start = new Date(startTime).getTime();
  if (isNaN(start)) {
    return { valid: false, error: "Format waktu mulai tidak valid." };
  }

  if (endTime) {
    const end = new Date(endTime).getTime();
    if (isNaN(end)) {
      return { valid: false, error: "Format waktu selesai tidak valid." };
    }
    if (end < start) {
      return {
        valid: false,
        error: "Waktu selesai tidak boleh mendahului waktu mulai.",
      };
    }
  }

  return { valid: true };
}

/* ========================================================
   RECRUITMENT EVENTS
   ======================================================== */

export async function fetchRecruitmentEvents(
  userId: string
): Promise<RecruitmentEvent[]> {
  const localList = getLocalData<RecruitmentEvent[]>(
    STORAGE_KEYS.EVENTS(userId),
    []
  );

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("recruitment_events")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (!error && data) {
      // Supabase table available! Sync to localStorage cache
      setLocalData(STORAGE_KEYS.EVENTS(userId), data as RecruitmentEvent[]);
      return data as RecruitmentEvent[];
    }
  } catch (err) {
    // Graceful fallback to local cache
    console.warn("Using local cache for recruitment events:", err);
  }

  return localList;
}

export async function saveRecruitmentEvent(
  userId: string,
  eventInput: {
    id?: string;
    application_id?: string | null;
    title: string;
    event_type: RecruitmentEventType | string;
    start_time: string;
    end_time?: string | null;
    is_all_day?: boolean;
    location?: string | null;
    notes?: string | null;
    is_completed?: boolean;
  }
): Promise<{ success: boolean; event?: RecruitmentEvent; error?: string }> {
  const timeValidation = validateEventTimes(
    eventInput.start_time,
    eventInput.end_time
  );
  if (!timeValidation.valid) {
    return { success: false, error: timeValidation.error };
  }

  if (!eventInput.title?.trim()) {
    return { success: false, error: "Judul event wajib diisi." };
  }

  const now = new Date().toISOString();
  const isEdit = Boolean(eventInput.id);
  const eventId = eventInput.id || crypto.randomUUID();

  const record: RecruitmentEvent = {
    id: eventId,
    user_id: userId,
    application_id: eventInput.application_id || null,
    title: eventInput.title.trim(),
    event_type: eventInput.event_type || "Other Recruitment Events",
    start_time: eventInput.start_time,
    end_time: eventInput.end_time || null,
    is_all_day: Boolean(eventInput.is_all_day),
    location: eventInput.location?.trim() || null,
    notes: eventInput.notes?.trim() || null,
    is_completed: Boolean(eventInput.is_completed),
    created_at: now,
    updated_at: now,
  };

  // 1. Update localStorage immediately (optimistic & offline support)
  const localList = getLocalData<RecruitmentEvent[]>(
    STORAGE_KEYS.EVENTS(userId),
    []
  );
  let updatedList: RecruitmentEvent[];
  if (isEdit) {
    updatedList = localList.map((item) =>
      item.id === eventId ? { ...item, ...record, created_at: item.created_at } : item
    );
  } else {
    updatedList = [...localList, record];
  }
  setLocalData(STORAGE_KEYS.EVENTS(userId), updatedList);

  // 2. Attempt remote DB sync if available
  try {
    const supabase = createBrowserClient();
    if (isEdit) {
      await supabase
        .from("recruitment_events")
        .update({
          application_id: record.application_id,
          title: record.title,
          event_type: record.event_type,
          start_time: record.start_time,
          end_time: record.end_time,
          is_all_day: record.is_all_day,
          location: record.location,
          notes: record.notes,
          is_completed: record.is_completed,
          updated_at: now,
        })
        .eq("id", eventId)
        .eq("user_id", userId);
    } else {
      await supabase.from("recruitment_events").insert(record);
    }
  } catch (err) {
    console.warn("Supabase event persistence fallback to local storage:", err);
  }

  return { success: true, event: record };
}

export async function deleteRecruitmentEvent(
  userId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Update localStorage
  const localList = getLocalData<RecruitmentEvent[]>(
    STORAGE_KEYS.EVENTS(userId),
    []
  );
  const updatedList = localList.filter((item) => item.id !== eventId);
  setLocalData(STORAGE_KEYS.EVENTS(userId), updatedList);

  // 2. Try remote DB
  try {
    const supabase = createBrowserClient();
    await supabase
      .from("recruitment_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("Supabase event delete fallback:", err);
  }

  return { success: true };
}

export async function toggleEventCompletion(
  userId: string,
  eventId: string
): Promise<{ success: boolean; is_completed?: boolean; error?: string }> {
  const localList = getLocalData<RecruitmentEvent[]>(
    STORAGE_KEYS.EVENTS(userId),
    []
  );
  const target = localList.find((item) => item.id === eventId);
  if (!target) {
    return { success: false, error: "Event tidak ditemukan." };
  }

  const nextStatus = !target.is_completed;
  const now = new Date().toISOString();

  const updatedList = localList.map((item) =>
    item.id === eventId
      ? { ...item, is_completed: nextStatus, updated_at: now }
      : item
  );
  setLocalData(STORAGE_KEYS.EVENTS(userId), updatedList);

  try {
    const supabase = createBrowserClient();
    await supabase
      .from("recruitment_events")
      .update({ is_completed: nextStatus, updated_at: now })
      .eq("id", eventId)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("Supabase toggle completion fallback:", err);
  }

  return { success: true, is_completed: nextStatus };
}

/* ========================================================
   STATUS HISTORY
   ======================================================== */

export async function fetchStatusHistory(
  userId: string,
  applicationId: string
): Promise<ApplicationStatusHistory[]> {
  const localAll = getLocalData<ApplicationStatusHistory[]>(
    STORAGE_KEYS.HISTORY(userId),
    []
  );
  const localAppHistory = localAll.filter(
    (h) => h.application_id === applicationId
  );

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("application_status_history")
      .select("*")
      .eq("user_id", userId)
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as ApplicationStatusHistory[];
    }
  } catch (err) {
    console.warn("Using local cache for status history:", err);
  }

  return localAppHistory.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function recordStatusChange(
  userId: string,
  applicationId: string,
  previousStatus: string,
  newStatus: string
): Promise<ApplicationStatusHistory> {
  const record: ApplicationStatusHistory = {
    id: crypto.randomUUID(),
    user_id: userId,
    application_id: applicationId,
    previous_status: previousStatus,
    new_status: newStatus,
    created_at: new Date().toISOString(),
  };

  // 1. Local storage
  const localAll = getLocalData<ApplicationStatusHistory[]>(
    STORAGE_KEYS.HISTORY(userId),
    []
  );
  setLocalData(STORAGE_KEYS.HISTORY(userId), [record, ...localAll]);

  // 2. Supabase
  try {
    const supabase = createBrowserClient();
    await supabase.from("application_status_history").insert(record);
  } catch (err) {
    console.warn("Supabase record status change fallback:", err);
  }

  return record;
}

/**
 * Returns the nearest upcoming event for an application.
 */
export function getNearestEventForApplication(
  events: RecruitmentEvent[],
  applicationId: string,
  referenceTime = Date.now()
): RecruitmentEvent | null {
  const upcoming = events.filter(
    (e) =>
      e.application_id === applicationId &&
      !e.is_completed &&
      new Date(e.start_time).getTime() >= referenceTime - 3600000 // up to 1 hour past
  );

  if (upcoming.length === 0) return null;

  upcoming.sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return upcoming[0];
}
