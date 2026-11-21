# PokéSwap — Vercel + Supabase edition

This edition keeps the React/Vite UI and existing username/password account model while replacing Netlify-only infrastructure.

## Architecture
- React + Vite frontend
- Express API hosted as a Vercel Node.js Function (`api/index.ts`)
- Supabase PostgreSQL accessed through Drizzle (`DATABASE_URL`)
- Supabase Storage bucket named `listing-images`
- Supabase Realtime Broadcast/Presence for live UI events and chat typing/presence

## Required Vercel environment variables
Set these for Production, Preview, and Development as appropriate:
- `DATABASE_URL`: Supabase Postgres **Transaction pooler** connection string (port 6543; use your database password)
- `SUPABASE_URL`: Supabase project URL (server)
- `SUPABASE_SERVICE_ROLE_KEY`: service-role/secret key (server only; never use a `VITE_` prefix)
- `ADMIN_SETUP_CODE`: a long, private admin unlock code
- `VITE_SUPABASE_URL`: same project URL, exposed to the browser
- `VITE_SUPABASE_ANON_KEY`: publishable/anon key, safe for browser use

Do not commit real credentials or put the service-role key in frontend variables.

## Supabase setup
1. In the existing Supabase project, open SQL Editor.
2. Run the SQL in `supabase/migrations/20261121032828_create_market_tables.sql`.
3. Open Storage and create a bucket named `listing-images`. Set it to **Public** so listing images can be displayed by the existing app. Uploads still go through the server using the service-role key.
4. In Project Settings → Database → Connection string, select **Transaction pooler** and copy the URI. Replace its password placeholder with your database password and set it as `DATABASE_URL` in Vercel.
5. Copy the project URL and publishable/anon key to the matching variables. Keep the service-role key server-only.

## Local development
- `npm install`
- Copy `.env.example` to `.env` and fill it locally (never commit `.env`).
- `npm run dev` starts Vite. For API development use `vercel dev` after installing the Vercel CLI.
- `npm run build` builds the frontend.

## Notes / limitations to verify before public launch
- Vercel functions are stateless. Supabase Realtime replaces the old persistent WebSocket server. Online presence is client-tracked; the server-side user-list helper does not persist online state between function invocations.
- The old Netlify data is not automatically copied. This migration SQL creates an empty schema; users/listings/messages must be imported separately if you need to preserve existing data.
- Review Supabase Storage bucket visibility and database backups before production use.
- The existing custom username/password session model is retained. Passwords remain scrypt-hashed in the app database; Supabase Auth is not used.
