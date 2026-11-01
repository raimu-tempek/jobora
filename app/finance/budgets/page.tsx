import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { BudgetsClient } from "./BudgetsClient";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email as string | undefined) ||
    undefined;

  return <BudgetsClient userId={userId} userName={userName} />;
}
