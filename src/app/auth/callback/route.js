import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function createSupabaseForCallback(request, getResponse) {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        const response = getResponse();

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (oauthError) {
    console.error("[auth/callback] OAuth error:", oauthError);
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed&reason=oauth`
    );
  }

  if (!code && !(tokenHash && type)) {
    console.error("[auth/callback] Missing code or token_hash/type in callback URL");
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed&reason=missing_params`
    );
  }

  const redirectUrl = `${origin}${safeNext}`;
  let response = NextResponse.redirect(redirectUrl);

  const supabase = createSupabaseForCallback(request, () => {
    response = NextResponse.redirect(redirectUrl);
    return response;
  });

  let authError = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession:", error.message);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    authError = error;
    if (error) {
      console.error("[auth/callback] verifyOtp:", error.message);
    }
  }

  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed&reason=exchange`
    );
  }

  return response;
}
