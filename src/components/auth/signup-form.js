"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";

const initialState = { error: null, success: false, message: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state?.success) {
    return (
      <div className="space-y-4">
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          role="status"
        >
          {state.message}
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-foreground hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Display name</span>
        <span className="text-xs text-zinc-500">Optional</span>
        <input
          name="display_name"
          type="text"
          autoComplete="name"
          maxLength={100}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-foreground outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-foreground outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-foreground outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
