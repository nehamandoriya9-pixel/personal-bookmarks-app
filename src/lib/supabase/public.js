import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Anon key only — no user session, RLS applies strictly
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}