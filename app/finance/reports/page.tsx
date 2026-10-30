import { getCurrentUser } from "@/lib/auth/user";
import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "guest-user";
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email as string | undefined) ||
    undefined;

  return <ReportsClient userId={userId} userName={userName} />;
}
