"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function getField(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formatAuthError(message) {
  const lower = message.toLowerCase();

  if (lower.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Check your inbox for the confirmation link, then sign in again.";
  }

  return message;
}

export async function signUp(prevState, formData) {
  const email = getField(formData, "email");
  const password = getField(formData, "password");
  const displayName = getField(formData, "display_name");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : {},
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  revalidatePath("/", "layout");

  // Email confirmation disabled → session returned → go to dashboard.
  if (data.session) {
    redirect("/dashboard");
  }

  // Email confirmation enabled → no session yet → stay on signup with instructions.
  return {
    success: true,
    message:
      "Account created. Check your email for a confirmation link, then sign in.",
  };
}

export async function signIn(prevState, formData) {
  const email = getField(formData, "email");
  const password = getField(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: formatAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
