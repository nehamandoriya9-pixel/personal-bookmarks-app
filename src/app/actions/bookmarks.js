"use server";

import { revalidatePath } from "next/cache";
import { getRequiredUser } from "@/lib/supabase/auth";
import {
  createBookmark,
  updateBookmark as dbUpdateBookmark,
  deleteBookmark as dbDeleteBookmark,
} from "@/lib/supabase/bookmarks";
import { createClient } from "@/lib/supabase/server";

// ── Helpers ───────────────────────────────────────────────────

function field(formData, name) {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

function parseUrl(raw) {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, error: "Please enter a valid URL (e.g. https://example.com)." };
  }
}

function parseTags(raw) {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function validateHandle(handle) {
  if (!handle) return { ok: false, error: "Handle cannot be empty." };
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(handle))
    return {
      ok: false,
      error: "Handle must be 3–30 characters: letters, numbers, hyphens, underscores only.",
    };
  return { ok: true };
}

// ── Bookmark actions ──────────────────────────────────────────

export async function addBookmark(prevState, formData) {
  const { user } = await getRequiredUser();

  const title = field(formData, "title");
  const rawUrl = field(formData, "url");
  const description = field(formData, "description") || null;
  const tags = parseTags(field(formData, "tags"));
  const is_favorite = formData.get("is_favorite") === "on";
  const is_public = formData.get("is_public") === "on";

  if (!title) return { error: "Title is required." };
  if (!rawUrl) return { error: "URL is required." };

  const { ok, url, error: urlErr } = parseUrl(rawUrl);
  if (!ok) return { error: urlErr };

  try {
    await createBookmark({ userId: user.id, title, url, description, tags, is_favorite, is_public });
  } catch {
    return { error: "Failed to save bookmark. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function editBookmark(prevState, formData) {
  // getRequiredUser ensures session is valid
  const { supabase, user } = await getRequiredUser();

  const id = field(formData, "id");
  const title = field(formData, "title");
  const rawUrl = field(formData, "url");
  const description = field(formData, "description") || null;
  const tags = parseTags(field(formData, "tags"));
  const is_favorite = formData.get("is_favorite") === "on";
  const is_public = formData.get("is_public") === "on";

  if (!id) return { error: "Missing bookmark ID." };
  if (!title) return { error: "Title is required." };
  if (!rawUrl) return { error: "URL is required." };

  const { ok, url, error: urlErr } = parseUrl(rawUrl);
  if (!ok) return { error: urlErr };

  // Ownership check — belt-and-suspenders on top of RLS
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { error: "Bookmark not found or access denied." };

  try {
    await dbUpdateBookmark(id, { title, url, description, tags, is_favorite, is_public });
  } catch {
    return { error: "Failed to update bookmark." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeBookmark(formData) {
  const { supabase, user } = await getRequiredUser();

  const id = field(formData, "id");
  if (!id) return;

  // Ownership check on top of RLS
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return; // silently ignore — not theirs

  try {
    await dbDeleteBookmark(id);
  } catch {
    // swallow — revalidate regardless
  }

  revalidatePath("/dashboard");
}

export async function toggleFavorite(formData) {
  const { supabase, user } = await getRequiredUser();

  const id = field(formData, "id");
  const current = formData.get("is_favorite") === "true";

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return;

  try {
    await dbUpdateBookmark(id, { is_favorite: !current });
  } catch {
    // swallow
  }

  revalidatePath("/dashboard");
}

// ── Profile / handle ──────────────────────────────────────────

export async function updateHandle(prevState, formData) {
  const { supabase, user } = await getRequiredUser();

  const handle = field(formData, "handle").toLowerCase();

  const { ok, error: handleErr } = validateHandle(handle);
  if (!ok) return { error: handleErr };

  // Check uniqueness before attempting upsert
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .ilike("handle", handle)
    .neq("id", user.id)
    .maybeSingle();

  if (taken) return { error: `@${handle} is already taken.` };

  const { error } = await supabase
    .from("profiles")
    .update({ handle })
    .eq("id", user.id);

  if (error) return { error: "Failed to save handle." };

  revalidatePath("/dashboard");
  return { success: true, handle };
}