import { getCurrentUser } from "@/lib/auth/user";
import { OverviewClient } from "./OverviewClient";

export const dynamic = "force-dynamic";

export default async function FinanceOverviewPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "guest-user";
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email as string | undefined) ||
    undefined;

  return <OverviewClient userId={userId} userName={userName} />;
}
