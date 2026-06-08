import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public"; 
// All columns we select — update this if you add columns to the table
const BOOKMARK_COLUMNS =
  "id, user_id, title, url, description, tags, is_favorite, is_public, created_at, updated_at";

/**
 * Fetch all bookmarks for a user (private + public).
 * RLS ensures only the owner ever sees their own rows.
 * @param {string} userId
 */
export async function getBookmarks(userId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select(BOOKMARK_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch only the public bookmarks for a given user (used on /@handle page).
 * This uses the anon client, so RLS `is_public = true` policy applies.
 * @param {string} userId
 */
export async function getPublicBookmarks(userId) {
  const supabase = createPublicClient(); // ← authenticated client nahi

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, title, url, description, tags, created_at")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * @param {{
 *   userId: string,
 *   title: string,
 *   url: string,
 *   description?: string | null,
 *   tags?: string[],
 *   is_favorite?: boolean,
 *   is_public?: boolean,
 * }} data
 */
export async function createBookmark(data) {
  const supabase = await createClient();

  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: data.userId,
      title: data.title,
      url: data.url,
      description: data.description ?? null,
      tags: data.tags ?? [],
      is_favorite: data.is_favorite ?? false,
      is_public: data.is_public ?? false,
    })
    .select(BOOKMARK_COLUMNS)
    .single();

  if (error) throw error;
  return bookmark;
}

/**
 * @param {string} id
 * @param {{
 *   title?: string,
 *   url?: string,
 *   description?: string | null,
 *   tags?: string[],
 *   is_favorite?: boolean,
 *   is_public?: boolean,
 * }} updates
 */
export async function updateBookmark(id, updates) {
  const supabase = await createClient();

  const payload = {};
  if (updates.title !== undefined)       payload.title = updates.title;
  if (updates.url !== undefined)         payload.url = updates.url;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.tags !== undefined)        payload.tags = updates.tags;
  if (updates.is_favorite !== undefined) payload.is_favorite = updates.is_favorite;
  if (updates.is_public !== undefined)   payload.is_public = updates.is_public;

  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .update(payload)
    .eq("id", id)
    .select(BOOKMARK_COLUMNS)
    .single();

  if (error) throw error;
  return bookmark;
}

/**
 * @param {string} id
 */
export async function deleteBookmark(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  if (error) throw error;
}