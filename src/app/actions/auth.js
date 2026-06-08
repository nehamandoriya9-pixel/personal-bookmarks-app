"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";
import { getAppUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function getField(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formatAuthError(message) {
  const lower = message.toLowerCase();

  if (lower.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Check your inbox and verify your email.";
  }

  return message;
}

/* ---------------- SIGN UP ---------------- */

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

  const user = data.user;

  /* ---------------- CREATE PROFILE ---------------- */
  // if (user?.id) {
  //   const { error: profileError } = await supabase.from("profiles").insert({
  //     id: user.id,
  //     display_name: displayName || null,
  //     email: user.email,
  //   });

  //   if (profileError) {
  //     console.error("[signup] Profile insert failed:", profileError.message);
  //   }
  // }

  /* ---------------- SEND WELCOME EMAIL ---------------- */
  // if (user?.id && user.email) {
  //   try {
  //     const emailResult = await sendWelcomeEmail({
  //       userId: user.id,
  //       email: user.email,
  //       supabase,
  //     });

  //     if (!emailResult.ok && !emailResult.skipped) {
  //       console.error("[signup] Welcome email failed:", emailResult.error);
  //     }
  //   } catch (err) {
  //     console.error("[signup] Welcome email error:", err);
  //   }
  // }

  revalidatePath("/", "layout");

  /* ---------------- REDIRECT FLOW ---------------- */
  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success: true,
    message:
      "Account created successfully. Please verify your email before signing in.",
  };
}

/* ---------------- SIGN IN ---------------- */

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

/* ---------------- SIGN OUT ---------------- */

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}