import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getApplications } from "@/lib/applications/queries";
import { ApplicationsView } from "./ApplicationsView";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const applications = await getApplications();

  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email as string | undefined) ||
    undefined;

  return <ApplicationsView userName={userName} applications={applications} />;
}
