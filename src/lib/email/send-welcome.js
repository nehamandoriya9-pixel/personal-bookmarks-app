// import SibApiV3Sdk from "sib-api-v3-sdk";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, getResendFromEmail } from "@/lib/resend";

/* -----------------------------
   Utils
------------------------------*/

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildWelcomeHtml(email, dashboardUrl) {
  return `
    <h1>Welcome to Bookmarks App</h1>
    <p>Thanks for signing up!</p>
    <p>Your account email: <strong>${escapeHtml(email)}</strong></p>
    <p>
      <a href="${escapeHtml(dashboardUrl)}">Open Dashboard</a>
    </p>
  `.trim();
}

function isMissingWelcomeColumn(error) {
  return Boolean(
    error?.message?.includes("welcome_email_sent_at") ||
    error?.code === "42703"
  );
}

/* -----------------------------
   Brevo fallback sender
------------------------------*/

async function sendViaBrevo({ to, subject, html }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        email: process.env.SENDER_EMAIL,
        name: "Personal Bookmarks App",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* -----------------------------
   Check if already sent
------------------------------*/

async function wasWelcomeEmailSent(client, userId) {
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("welcome_email_sent_at")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.welcome_email_sent_at) {
    return { alreadySent: true, canUseProfileColumn: true };
  }

  if (profileError && isMissingWelcomeColumn(profileError)) {
    console.warn(
      "[welcome-email] Missing column: welcome_email_sent_at (run migration)"
    );
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user?.user_metadata?.welcome_email_sent) {
    return { alreadySent: true, canUseProfileColumn: true };
  }

  return {
    alreadySent: false,
    canUseProfileColumn: !profileError,
  };
}

/* -----------------------------
   Mark as sent
------------------------------*/

async function markWelcomeEmailSent(client, userId, canUseProfileColumn) {
  const {
    data: { user },
  } = await client.auth.getUser();

  // update auth metadata
  if (user?.id === userId) {
    await client.auth.updateUser({
      data: { welcome_email_sent: true },
    });
  }

  // update profile column if available
  if (!canUseProfileColumn) return;

  const { error } = await client
    .from("profiles")
    .update({
      welcome_email_sent_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .is("welcome_email_sent_at", null);

  if (error && !isMissingWelcomeColumn(error)) {
    console.error("[welcome-email] profile update failed:", error.message);
  }
}

/* -----------------------------
   Main function
------------------------------*/

export async function sendWelcomeEmail({ userId, email, supabase }) {
  if (!userId || !email) {
    return {
      ok: false,
      error: "Missing userId or email",
    };
  }

  try {
    const client = supabase ?? (await createClient());

    const { alreadySent, canUseProfileColumn } =
      await wasWelcomeEmailSent(client, userId);

    if (alreadySent) {
      return { ok: true, skipped: true };
    }

    const dashboardUrl = `${getAppUrl()}/dashboard`;
    const html = buildWelcomeHtml(email, dashboardUrl);

    let provider = "resend";

    /* -----------------------------
       Try Resend first
    ------------------------------*/
    try {
      const resend = getResendClient();

      const { error } = await resend.emails.send({
        from: getResendFromEmail(),
        to: email,
        subject: "Welcome to Bookmarks App",
        html,
      });

      if (error) throw new Error(error.message);

      console.log("[welcome-email] sent via Resend");
    } catch (resendErr) {
      console.warn(
        "[welcome-email] Resend failed → falling back to Brevo",
        resendErr
      );

      provider = "brevo";

      /* -----------------------------
         Fallback: Brevo
      ------------------------------*/
      await sendViaBrevo({
        to: email,
        subject: "Welcome to Bookmarks App",
        html,
      });

      console.log("[welcome-email] sent via Brevo");
    }

    /* -----------------------------
       Mark as sent
    ------------------------------*/
    await markWelcomeEmailSent(client, userId, canUseProfileColumn);

    return {
      ok: true,
      provider,
    };
  } catch (err) {
    console.error("[welcome-email] Unexpected error:", err);

    return {
      ok: false,
      error: err instanceof Error ? err.message : "Send failed",
    };
  }
}