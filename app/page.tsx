import { getCurrentUser } from "@/lib/auth/user";
import LandingPage from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  return <LandingPage user={user} />;
}
