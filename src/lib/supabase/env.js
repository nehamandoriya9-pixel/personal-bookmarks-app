/**
 * Reads and normalizes Supabase env vars for all SSR/browser clients.
 * The URL must be the project root (e.g. https://xxx.supabase.co), not /rest/v1/.
 */
export function getSupabaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!raw) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local to your project URL (https://<ref>.supabase.co)."
    );
  }

  const withoutRest = raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");

  let parsed;
  try {
    parsed = new URL(withoutRest);
  } catch {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Use the Project URL from Supabase Dashboard → Settings → API."
    );
  }

  if (!parsed.hostname.endsWith(".supabase.co")) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Expected https://<project-ref>.supabase.co with no path."
    );
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Remove path segments such as /rest/v1 — use the project root URL only."
    );
  }

  return parsed.origin;
}

export function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) {
    return "http://localhost:3000";
  }
  return raw.replace(/\/+$/, "");
}

export function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in .env.local from Supabase Dashboard → Settings → API."
    );
  }

  return key;
}
