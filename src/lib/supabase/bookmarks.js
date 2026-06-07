import { createClient } from "@/lib/supabase/server";

const BOOKMARK_COLUMNS =
  "id, user_id, title, url, description, tags, is_favorite, created_at";

/**
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
 * @param {{
 *   userId: string,
 *   title: string,
 *   url: string,
 *   description?: string | null,
 *   tags?: string[],
 *   is_favorite?: boolean,
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
 * }} updates
 */
export async function updateBookmark(id, updates) {
  const supabase = await createClient();

  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.url !== undefined) payload.url = updates.url;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.is_favorite !== undefined) payload.is_favorite = updates.is_favorite;

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
