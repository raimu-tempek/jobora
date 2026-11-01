import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.email as string | undefined) ||
    undefined;

  return <CategoriesClient userId={userId} userName={userName} />;
}
