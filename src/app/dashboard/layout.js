import { getRequiredUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Dashboard · Mark",
};

export default async function DashboardLayout({ children }) {
  await getRequiredUser();
  return <>{children}</>;
}