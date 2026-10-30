import { createClient } from "@/lib/supabase/server";
import { Application } from "@/types/application";

/**
 * Server-side query fetching all applications for the logged-in user.
 * Explicitly filters by user_id in addition to relying on RLS.
 * Ordered by date descending.
 */
export async function getApplications(): Promise<Application[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      return [];
    }

    return (data as Application[]) || [];
  } catch (err) {
    console.error("Unexpected error fetching applications:", err);
    return [];
  }
}
