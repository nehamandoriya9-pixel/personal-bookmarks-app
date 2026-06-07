# Personal Bookmarks App

A bookmark management application built for the EagerMinds Software Developer take-home assignment.

## Project Overview

This application allows users to create and manage personal bookmarks, control their visibility (public/private), and share public bookmarks through a unique profile handle.

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

## Planned Features

* User authentication (signup/login)
* Welcome email on signup
* Bookmark CRUD (Create, Read, Update, Delete)
* Public and private bookmarks
* Unique user handles
* Public profile pages
* Secure data access using Supabase RLS

## Tech Stack

* Next.js 16
* JavaScript
* Tailwind CSS
* Supabase
* Resend
* Vercel
* Entire CLI

## Development Process

Before starting implementation, I created a detailed project plan covering:

* Application architecture
* Database schema
* Authentication flow
* Security and Row Level Security (RLS)
* Development phases and milestones

As required by the assignment, Entire CLI was configured to track AI-assisted development sessions.

## What Went Wrong & How I Fixed It (Most Important Part)

## What Went Wrong & How I Fixed It (Most Important Part)

During development, I ran into a few critical issues that came from AI-generated setup and SSR complexity.

The biggest issue was that the dashboard crashed when `user` was `null`, which caused `user.id` to throw an error. I fixed this by adding a proper authentication check and redirecting unauthenticated users to `/login`.

Another major issue was unstable Supabase SSR session handling. The login state was not persisting across page refreshes. I fixed this by correctly implementing Supabase SSR using `createServerClient` with cookie-based session handling.

I also faced an intermittent Supabase configuration error ("Invalid path specified in request URL"), which was caused by inconsistent environment configuration and duplicate Supabase client usage. This was resolved by standardizing the Supabase client setup and fixing `.env.local` values.

When I started integrating Resend for welcome emails, signup was working and users were being created successfully in Supabase, but the welcome email was not arriving. After debugging the logs, I found two issues. First, the code was checking for a `welcome_email_sent_at` column that did not exist in the `profiles` table, which required a schema update. Second, Resend was running in testing mode without a verified custom domain. In this mode, Resend only allows emails to be sent to the account owner's verified email address and blocks delivery to other recipient addresses. The welcome email logic itself was executing correctly, but email delivery was limited by Resend's testing restrictions. For production use, a verified domain must be added to Resend so welcome emails can be delivered to any user email address. This issue only affected welcome email delivery and did not impact signup, login, dashboard access, authentication, or bookmark functionality.

I also hit Supabase email rate limits during testing because I was repeatedly creating test accounts while debugging the email flow. Once I identified the cause, I switched to a smaller testing cycle and reused accounts where possible.

Finally, I fixed a redirect loop issue between `/login`, `/signup`, and `/dashboard` by correcting authentication flow logic and preventing repeated redirects during session checks.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Supabase auth (local development)

For the simplest local flow (signup → dashboard without email confirmation):

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Turn **off** “Confirm email”
3. Restart `npm run dev` after changing `.env.local`

If email confirmation is **enabled**, signup shows a “check your email” message and login displays a clear error until the user confirms.

## Status

Work in Progress
