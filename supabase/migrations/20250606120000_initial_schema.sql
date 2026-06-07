-- =============================================================================
-- Personal Bookmarks App — initial schema
-- Run this file once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run only on a fresh project; use separate migrations for changes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- gen_random_uuid() is used for bookmark primary keys.
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles
-- One row per auth user. id mirrors auth.users.id.
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email       text        NOT NULL UNIQUE,
  display_name text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Application profile for each authenticated user.';
COMMENT ON COLUMN public.profiles.email IS 'Copied from auth.users.email at signup.';

-- -----------------------------------------------------------------------------
-- bookmarks
-- Owned by a single user via user_id → profiles.id.
-- -----------------------------------------------------------------------------
CREATE TABLE public.bookmarks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title       text        NOT NULL,
  url         text        NOT NULL,
  description text,
  tags        text[]      NOT NULL DEFAULT '{}',
  is_favorite boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT bookmarks_title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT bookmarks_url_not_empty CHECK (char_length(trim(url)) > 0)
);

COMMENT ON TABLE public.bookmarks IS 'User-owned bookmarks.';
COMMENT ON COLUMN public.bookmarks.tags IS 'Free-form labels; empty array when none.';

-- Index for dashboard queries: list bookmarks by owner, newest first.
CREATE INDEX bookmarks_user_id_created_at_idx
  ON public.bookmarks (user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Deny-by-default: no policy = no access for anon/authenticated roles.
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks FORCE ROW LEVEL SECURITY;

-- profiles: users may read and update only their own row.
-- Inserts are performed by the signup trigger (SECURITY DEFINER), not by clients.

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- bookmarks: full CRUD limited to the owning user.

CREATE POLICY "bookmarks_select_own"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "bookmarks_insert_own"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "bookmarks_update_own"
  ON public.bookmarks
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "bookmarks_delete_own"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Signup trigger
-- Automatically creates a profiles row when a user registers via Supabase Auth.
-- Runs as SECURITY DEFINER so it can insert before the user has a session.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(trim(NEW.raw_user_meta_data ->> 'display_name'), '')
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates public.profiles row after auth.users insert.';

-- Drop first so this migration can be re-tested in dev if the trigger already exists.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
