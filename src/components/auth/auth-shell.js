import Link from "next/link";

export function AuthShell({ title, subtitle, children, alternate }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-foreground"
          >
            Personal Bookmarks
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {children}
        </div>

        {alternate ? (
          <p className="mt-6 text-center text-sm text-zinc-500">{alternate}</p>
        ) : null}
      </div>
    </main>
  );
}
