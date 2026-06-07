-- =============================================================================
-- Welcome email idempotency column
-- Run in Supabase Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.welcome_email_sent_at IS
  'Set after the Resend welcome email is sent successfully.';
