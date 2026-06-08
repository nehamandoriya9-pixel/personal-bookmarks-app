import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  const callbackReason =
    typeof params?.reason === "string" ? params.reason : "";

  let authError = null;
  if (params?.error === "auth_callback_failed") {
    if (callbackReason === "missing_params") {
      authError =
        "Invalid confirmation link. In Supabase, add http://localhost:3000/auth/callback to Authentication → URL Configuration → Redirect URLs.";
    } else if (callbackReason === "exchange") {
      authError =
        "Confirmation link expired or was already used. Sign in with your email and password, or sign up again.";
    } else {
      authError =
        "Email confirmation failed. Check Supabase redirect URLs include your app URL + /auth/callback, then try signing in.";
    }
  }

  const authMessage =
    params?.message === "confirm_email"
      ? "Confirm your email, then sign in below."
      : null;

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your bookmarks dashboard."
      alternate={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground text-white/35 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm authError={authError} authMessage={authMessage} />
    </AuthShell>
  );
}
