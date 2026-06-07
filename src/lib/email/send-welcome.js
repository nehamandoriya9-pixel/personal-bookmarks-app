import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, getResendFromEmail } from "@/lib/resend";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildWelcomeHtml(email, dashboardUrl) {
  const safeEmail = escapeHtml(email);
  const safeUrl = escapeHtml(dashboardUrl);

  return `
    <h1>Welcome to Bookmarks App</h1>
    <p>Thanks for signing up!</p>
    <p>Your account email: <strong>${safeEmail}</strong></p>
    <p>
      <a href="${safeUrl}">Open Dashboard</a>
    </p>
  `.trim();
}

function isMissingWelcomeColumn(error) {
  return Boolean(
    error?.message?.includes("welcome_email_sent_at") ||
      error?.code === "42703"
  );
}

async function wasWelcomeEmailSent(client, userId) {
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("welcome_email_sent_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    if (isMissingWelcomeColumn(profileError)) {
      console.warn(
        "[welcome-email] profiles.welcome_email_sent_at missing — run migration 20250606140000_welcome_email_sent.sql in Supabase SQL Editor."
      );
    } else {
      console.error("[welcome-email] Profile lookup failed:", profileError.message);
    }
  } else if (profile?.welcome_email_sent_at) {
    return { alreadySent: true, canUseProfileColumn: true };
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user?.user_metadata?.welcome_email_sent) {
    return { alreadySent: true, canUseProfileColumn: !profileError };
  }

  return {
    alreadySent: false,
    canUseProfileColumn: !profileError && !isMissingWelcomeColumn(profileError),
  };
}

async function markWelcomeEmailSent(client, userId, canUseProfileColumn) {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (user?.id === userId) {
    const { error: metadataError } = await client.auth.updateUser({
      data: { welcome_email_sent: true },
    });

    if (metadataError) {
      console.error(
        "[welcome-email] Could not set user metadata flag:",
        metadataError.message
      );
    }
  }

  if (!canUseProfileColumn) {
    return;
  }

  const { error: updateError } = await client
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", userId)
    .is("welcome_email_sent_at", null);

  if (updateError && !isMissingWelcomeColumn(updateError)) {
    console.error(
      "[welcome-email] Could not mark profile as sent:",
      updateError.message
    );
  }
}

/**
 * Sends the welcome email once per user. Never throws — returns a result object.
 */
export async function sendWelcomeEmail({ userId, email, supabase }) {
  if (!userId || !email) {
    console.error("[welcome-email] Missing userId or email");
    return { ok: false, error: "Missing userId or email" };
  }

  try {
    const client = supabase ?? (await createClient());
    const { alreadySent, canUseProfileColumn } = await wasWelcomeEmailSent(
      client,
      userId
    );

    if (alreadySent) {
      return { ok: true, skipped: true };
    }

    const dashboardUrl = `${getAppUrl()}/dashboard`;
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: email,
      subject: "Welcome to Bookmarks App",
      html: buildWelcomeHtml(email, dashboardUrl),
    });

    if (error) {
      console.error("[welcome-email] Resend error:", error.message ?? error);
      return { ok: false, error: error.message ?? "Resend send failed" };
    }

    await markWelcomeEmailSent(client, userId, canUseProfileColumn);
    return { ok: true };
  } catch (err) {
    console.error("[welcome-email] Unexpected error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Send failed",
    };
  }
}
