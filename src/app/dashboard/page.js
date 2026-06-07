import Link from "next/link";
import { getRequiredUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const { supabase, user } = await getRequiredUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name || profile?.email || user.email;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Signed in as</p>
        <p className="text-lg font-medium">{displayName}</p>
      </div>

      <p className="text-sm text-zinc-500">
        Bookmark management will be added in the next phase.
      </p>

      <Link
        href="/"
        className="inline-block rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-foreground"
      >
        Back to home
      </Link>
    </div>
  );
}
