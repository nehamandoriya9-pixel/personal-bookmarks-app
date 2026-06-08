# Personal Bookmarks App

A take-home assignment for EagerMinds — a bookmark manager where users can save, organize, and optionally share their bookmarks publicly.


## What it does

You sign up, confirm your email, and land on a dashboard where you can add bookmarks with a title, URL, optional description and tags, and mark them public or private. You can also claim a unique `@handle` — once you do, anyone can visit `yoursite.com/handle` and see your public bookmarks without logging in.

Private bookmarks stay private. Not just in the UI — at the database level too.

## Current Progress

* GitHub repository created
* Next.js project initialized
* Tailwind CSS configured
* Cursor AI setup completed
* Entire CLI installed and configured
* Project architecture and implementation plan prepared
* Supabase backend integrated (Auth + Database + SSR setup completed)
* Database schema implemented (profiles + bookmarks tables)
* Row Level Security (RLS) configured for secure user-level access
* Authentication system implemented (signup/login/logout)
* Protected dashboard route implemented
* Bookmark CRUD system implemented (create, read, update, delete)
* SSR session handling implemented using Supabase cookies
* Public profile page implemented (`/@handle` route)
* Handle uniqueness enforced at DB level (case-insensitive unique index)
* Dashboard UI rebuilt with stats, filters, inline edit/delete/favorite

## Planned Features

* User authentication (signup/login)
* Welcome email on signup
* Bookmark CRUD (Create, Read, Update, Delete)
* Public and private bookmarks
* Unique user handles
* Public profile pages
* Secure data access using Supabase RLS

## Tech Stack

* Next.js 16 (App Router + Server Actions)
* JavaScript
* Tailwind CSS
* Supabase (PostgreSQL + RLS + Auth)
* Resend (welcome email)
* Vercel
* Entire CLI

## Project Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── auth.js          # signup, login, logout
│   │   └── bookmarks.js     # add, edit, delete, favorite, handle update
│   ├── dashboard/
│   │   ├── layout.js        # just does the auth check + redirect
│   │   └── page.js          # the actual dashboard UI
│   ├── [handle]/
│   │   └── page.js          # public profile — no login needed
│   ├── auth/callback/       # email confirmation redirect
│   ├── login/
│   └── signup/
├── components/
│   ├── AddBookmarkForm.js
│   ├── BookmarkList.js      # inline edit, delete, favorite on hover
│   └── HandleForm.js
└── lib/
    └── supabase/
        ├── auth.js          # getRequiredUser() — used in every protected route
        ├── bookmarks.js     # all DB queries live here
        ├── env.js           # validates env vars on startup
        └── server.js        # creates the Supabase server client
```

---

## Development Process

Before starting implementation, I created a detailed project plan covering:

* Application architecture
* Database schema
* Authentication flow
* Security and Row Level Security (RLS)
* Development phases and milestones

As required by the assignment, Entire CLI was configured to track AI-assisted development sessions.

Most planned features are complete. The only remaining item is welcome email delivery to all users — currently limited by Resend's test mode, which only sends to the verified account owner's email. This needs a custom domain verified at resend.com/domains for production use.

## What Went Wrong & How I Fixed It

This is the honest part.

**The dashboard was crashing for logged-out users.** It was calling `user.id` without checking if `user` was actually there. Fixed by writing a `getRequiredUser()` helper that redirects to `/login` if there's no session — now every protected route and server action calls this first.

**Files were going to the wrong place.** This project uses a `src/` directory, which means the `@/` alias resolves to `src/`, not the project root. New files were placed at the root so all imports were failing with `Module not found`. Moved everything into `src/` and that cleared it.

**Then a filename caught me.** One component was saved as `AddBookMarkForm.js` (capital M) but imported as `AddBookmarkForm.js`. Windows didn't complain because its filesystem is case-insensitive — but Node.js is not. Renamed the file and moved on.

**Double header on the dashboard.** The existing `dashboard/layout.js` had a full header with a sign-out button. The new `page.js` also had its own header. Both were rendering because layouts wrap pages in Next.js App Router. Stripped `layout.js` down to just the auth check and nothing else.

**`onMouseEnter` breaking in a Server Component.** Had inline hover handlers on the sign-out button in `page.js`. Server Components can't take event handler props — that's a client-only thing. Removed them from the server component; hover effects are only used inside `"use client"` components now.

**The `bookmarks` table didn't exist yet.** Got a `PGRST205` error — Supabase couldn't find the table. The migration just hadn't been run. Ran it, but the first attempt failed with `42P07` because `profiles` already existed from an earlier migration. Ran just the `bookmarks` portion the second time and it worked.

**Profiles table was empty.** Even after the migration, `handle` updates were silently doing nothing because there were no rows in `profiles` to update. The trigger that auto-creates a profile on signup was added after the existing users had already signed up, so they had no profiles. Fixed by inserting rows for all existing users manually:

```sql
insert into public.profiles (id, email, display_name)
select id, email, null from auth.users
on conflict (id) do nothing;
```

**Welcome emails only going to one address.** Resend in test mode only sends to the verified account owner's email — anyone else just doesn't get it. The code is correct and executes without errors; it's a Resend plan limitation. Needs a verified domain for production.

**Hit Supabase's email rate limit.** Was creating new test accounts repeatedly while debugging the confirmation flow. Once I understood what was happening, switched to reusing existing accounts and turned off email confirmation for local testing.


## Security

Privacy is not a UI detail — it is enforced at the database level.

**RLS Policies:**

| Table       | Who can do what                                           
| `bookmarks` | Owner: full CRUD. Anyone: read-only if `is_public = true` 
| `profiles`  | Anyone: read. Owner: update their own row                 

On top of RLS, every server action that modifies a bookmark also adds `.eq("user_id", user.id)` — so even a hypothetical RLS misconfiguration cannot leak or modify another user's data.

Verified manually — hitting the Supabase REST API directly with the anon key returns nothing for private bookmarks, and only `is_public = true` rows for public ones.


## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open: `http://localhost:3000`

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your-resend-key
```

### Supabase auth (local development)

For the simplest local flow (signup → dashboard without email confirmation):

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Turn **off** "Confirm email"
3. Restart `npm run dev` after changing `.env.local`

If email confirmation is **enabled**, signup shows a "check your email" message and login displays a clear error until the user confirms.

## Status

Work in Progress — core features complete, welcome email delivery pending domain verification on Resend.