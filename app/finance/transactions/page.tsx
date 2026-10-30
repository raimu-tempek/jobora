import { getCurrentUser } from "@/lib/auth/user";
import { TransactionsClient } from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  const userId = user?.id || "guest-user";
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.email as string | undefined) ||
    undefined;

  return <TransactionsClient userId={userId} userName={userName} />;
}
