import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  const authError =
    params?.error === "auth_callback_failed"
      ? "Email confirmation failed. Please try signing in again."
      : null;

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
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm authError={authError} authMessage={authMessage} />
    </AuthShell>
  );
}
