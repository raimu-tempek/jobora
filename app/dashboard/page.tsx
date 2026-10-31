import { getCurrentUser } from "@/lib/auth/user";
import { getApplications } from "@/lib/applications/queries";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [user, applications] = await Promise.all([
    getCurrentUser(),
    getApplications(),
  ]);

  const userName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    (user?.email as string | undefined) ||
    undefined;

  return <DashboardView userName={userName} applications={applications} />;
}
