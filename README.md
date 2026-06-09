# Personal Bookmarks App

A take-home assignment for EagerMinds — a bookmark manager where users can save, organize, and optionally share their bookmarks publicly.

Live: https://personal-bookmarks-app.vercel.app/

## What it does

You sign up, confirm your email, and land on a dashboard where you can add bookmarks with a title, URL, optional description and tags, and mark them public or private. You can also claim a unique `@handle` — once you do, anyone can visit `yoursite.com/handle` and see your public bookmarks without logging in.

Private bookmarks stay private. Not just in the UI — at the database level too.

## Run Locally

1. Clone the repo and install dependencies:

npm install
npm run dev

2. Create `.env.local`:

NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=onboarding@resend.dev
BREVO_API_KEY=your-brevo-api-key
SENDER_EMAIL=your-verified-sender@email.com

3. Open http://localhost:3000

> To skip email confirmation locally: Supabase Dashboard → 
> Authentication → Providers → Email → turn off "Confirm email"

## Where the AI Got It Wrong

The agent added inline onMouseEnter handlers on the sign-out button inside a Server Component — which just doesn't work. Server Components can't take event handler props. I caught it when the build broke, moved all hover logic into a "use client" component instead.

It also generated the dashboard without null-checking the user object calling user.id directly, which crashed for logged-out visitors Wrote a getRequiredUser() helper that redirects to /login if there's no session and made every protected route use it.

send-welcome.js was placed outside src/ and importing a library not available in the server context — Next.js threw a module-not-found error. Fixed the path and added the package to server ExternalPackages in next.config.js.

The agent set up the public profile page using the authenticated  Supabase client instead of an anonymous one. This meant RLS was running with full user context private bookmarks were leaking even though `is_public = true` was set in the query. I caught it by hitting the Supabase REST API directly with the anon key and seeing private data come back when it shouldn't. Fixed it by creating a separate no-session client specifically for public routes.

The trickiest one: handle updates were silently doing nothing after migration. The auto-create profile trigger was added after existing users had already signed up — so their profiles rows didn't exist. Nothing errored, nothing updated. Fixed by manually backfilling rows for existing users.


## One Thing I'd Improve

Verify a custom domain with Resend so welcome emails reach every user reliably. Right now Resend's test mode only delivers to the account owner's address — Brevo handles fallback delivery for everyone else, but that's a workaround, not a real fix.