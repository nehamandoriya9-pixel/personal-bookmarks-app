import { signOut } from "@/actions/auth";
import { getRequiredUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({ children }) {
  await getRequiredUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">Personal Bookmarks</p>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
