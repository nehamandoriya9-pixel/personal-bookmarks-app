import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function redirectWithCookies(url, supabaseResponse) {
  const redirectResponse = NextResponse.redirect(url);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

/**
 * Refreshes the Supabase auth session, syncs cookies, and enforces route access.
 * Route decisions use getUser() — same validation as Server Components — to avoid
 * redirect loops when JWT cookies exist but the session is invalid/unconfirmed.
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    }
  );

  // Refresh session cookies. Do not add logic between createServerClient and getClaims().
  await supabase.auth.getClaims();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isAuthCallback) {
    return supabaseResponse;
  }

  if (!user && isProtectedRoute) {
    // Clear stale auth cookies so /login is not bounced back to /dashboard.
    await supabase.auth.signOut();

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirectWithCookies(url, supabaseResponse);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}
