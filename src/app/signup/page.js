import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle="Start saving and organizing your bookmarks."
      alternate={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground text-white/35 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
