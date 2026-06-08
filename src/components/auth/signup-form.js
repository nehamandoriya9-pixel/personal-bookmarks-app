"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import { OrbitInput } from "@/components/OrbitInput";

const initialState = { error: null, success: false, message: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state?.success) {
    return (
      <div className="space-y-4">
        <p
         className="
           rounded-2xl
    border border-white/20
    bg-gradient-to-br
    from-white/20
    via-white/10
    to-white/5
    backdrop-blur-2xl
    p-3
    text-center
    text-[15px]
    font-medium
    leading-relaxed
    tracking-tight
    text-white/65
    shadow-[0_10px_40px_rgba(255,255,255,0.08)]
       "
        >
          {state.message}
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-foreground hover:underline text-white/35 translate-x-3"
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

      <label htmlFor="display_name" className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-white/60">Display name</span>
        <span className="text-xs text-white/30">Optional</span>
        <OrbitInput
          id="display_name"
          name="display_name"
          type="text"
          placeholder="Name"
          autoComplete="name"
          maxLength={100}
          icon={<i className="ti ti-user" aria-hidden="true" />}
        />
      </label>

      <label htmlFor="email" className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-white/60">Email</span>
        <OrbitInput
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          icon={<i className="ti ti-mail" aria-hidden="true" />}
        />
      </label>

      <label htmlFor="password" className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-white/60">Password</span>
        <OrbitInput
          id="password"
          name="password"
          type="password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
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
    {pending ? "Creating account..." : "Create account"}
  </span>
</button>
    </form>
  );
}