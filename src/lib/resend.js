import { Resend } from "resend";

const DEV_SENDER = "Bookmarks App <onboarding@resend.dev>";

let resendClient;

export function getResendApiKey() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing RESEND_API_KEY. Add it to .env.local (server-only).");
  }
  return key;
}

/**
 * Returns RESEND_FROM_EMAIL. Falls back to Resend's test sender when
 * yourdomain.com or other unverified domains are configured in development.
 */
export function getResendFromEmail() {
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!from) {
    console.warn(
      `[resend] RESEND_FROM_EMAIL is unset — using dev sender ${DEV_SENDER}`
    );
    return DEV_SENDER;
  }

  if (/yourdomain\.com/i.test(from)) {
    console.warn(
      `[resend] RESEND_FROM_EMAIL uses an unverified domain — using dev sender ${DEV_SENDER}`
    );
    return DEV_SENDER;
  }

  return from;
}

export function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(getResendApiKey());
  }
  return resendClient;
}
