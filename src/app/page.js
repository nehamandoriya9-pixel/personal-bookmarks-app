import Link from "next/link";
import { getOptionalUser } from "@/lib/supabase/auth";

export default async function Home() {
  const { user } = await getOptionalUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
        Personal Bookmarks
      </h1>
      <p className="mt-4 max-w-lg text-zinc-500">
        Save, organize, and manage your bookmarks in one private dashboard.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
