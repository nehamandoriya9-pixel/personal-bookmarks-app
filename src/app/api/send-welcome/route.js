import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/send-welcome
 * Authenticated users can trigger their own welcome email (idempotent).
 * Primary trigger is the signup Server Action; this route is for server-side reuse.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendWelcomeEmail({
    userId: user.id,
    email: user.email,
    supabase,
  });

  if (!result.ok && !result.skipped) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
