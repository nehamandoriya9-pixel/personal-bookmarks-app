"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { OrbitInput } from "@/components/OrbitInput";

const initialState = { error: null, success: false, message: null };

export function LoginForm({ authError, authMessage }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  const error = state?.error ?? authError;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {authMessage && !error ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          role="status"
        >
          {authMessage}
        </p>
      ) : null}

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-white/60 translate-x-2">Email</span>
        <OrbitInput
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          icon={<i className="ti ti-mail" aria-hidden="true" />}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-white/60 translate-x-2">Password</span>
        <OrbitInput
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          minLength={6}
          icon={<i className="ti ti-lock" aria-hidden="true" />}
        />
      </label>

      <button
  type="submit"
  disabled={pending}
  className="
    group relative overflow-hidden
    rounded-full
    px-6 py-3
    text-sm font-medium text-white

    bg-white/[0.04]
    backdrop-blur-xl
    border border-white/10

    transition-all duration-500

    hover:bg-white/[0.08]
    hover:border-white/20
    hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)]

    active:scale-[0.98]
    disabled:opacity-50
  "
>
  {/* Glass Shine */}
  <span
    className="
      absolute inset-0
      -translate-x-[120%]
      bg-gradient-to-r
      from-transparent
      via-white/15
      to-transparent
      group-hover:translate-x-[120%]
      transition-transform duration-1000
    "
  />
   <span className="relative z-10">
        {pending ? "Signing in…" : "Sign in"}
        </span>
      </button>
    </form>
  );
}