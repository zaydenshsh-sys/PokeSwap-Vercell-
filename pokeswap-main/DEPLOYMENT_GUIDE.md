# Deployment walkthrough — Vercel + your existing Supabase project

Do these steps in order. Do not paste any secret key into chat or commit it to GitHub.

## 1. Create the new private GitHub repository
1. On GitHub, create a new **Private** repository (for example `pokeswap-vercel`).
2. Extract this ZIP on your computer.
3. Upload the contents of the extracted `pokeswap-main` folder to the new repository. Upload the files inside the folder, not an extra nested folder.
4. Confirm `package.json`, `src/`, `server/`, `api/`, `supabase/`, and `vercel.json` are at the repository root.

## 2. Prepare the existing Supabase project
1. Open the Supabase project you already created.
2. Open **SQL Editor → New query**.
3. Open `supabase/migrations/20261121032828_create_market_tables.sql` from this project, copy all its SQL, paste it into SQL Editor, and run it once.
4. Open **Storage → New bucket**. Name it exactly `listing-images` and turn **Public bucket** on. The server handles uploads with the service-role key; the public bucket lets the app display image URLs through its API proxy.
5. In **Project Settings → Database → Connection string**, choose **Transaction pooler**. Copy the URI. Use port `6543`; replace the password placeholder with your database password. This is the value for `DATABASE_URL`.
6. In **Project Settings → API** (or API Keys), copy the Project URL and the publishable/anon key. Keep the service-role/secret key private.

## 3. Import the new GitHub repository into Vercel
1. In Vercel, choose **Add New → Project**.
2. Import the new private repository.
3. Framework: Vite. Root directory: `./`.
4. Build command: `npm run build`. Output directory: `dist`. Install command: `npm install`.
5. Add the six environment variables below for **Production, Preview, and Development**:
   - `DATABASE_URL` = Supabase Transaction Pooler URI
   - `SUPABASE_URL` = Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase service-role/secret key (server only)
   - `ADMIN_SETUP_CODE` = a long unique admin code that you choose
   - `VITE_SUPABASE_URL` = same Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase publishable/anon key
6. Deploy.

## 4. Test after deployment
1. Open the deployed URL.
2. Create a test account and sign in.
3. Test profile editing, a listing, image upload, a chat message, and a notification.
4. Test admin unlock using the `ADMIN_SETUP_CODE` you configured.
5. Check Vercel → Deployments → Functions/Logs if an API request fails.

## Important migration notes
- This creates a fresh database schema in the existing Supabase project. It does not import the old Netlify database contents. Do not delete the old Netlify database until you decide whether you need to export/import its data.
- Existing accounts/listings/messages from Netlify will not appear automatically. This SQL is a schema creation script, not a data migration.
- The old custom username/password login is retained; Supabase Auth is not used for user sign-in.
- Realtime now uses Supabase Broadcast and client Presence. Presence is ephemeral and is not a permanent database record.
- The app uses a server-side service-role key. Never prefix that key with `VITE_`, never put it in frontend source, and never commit it.
- This ZIP was source-checked, but dependency installation/build could not be completed in this environment because npm registry installation timed out. The first Vercel build is therefore an important validation step. If it fails, send the build log (remove any secrets) before changing settings.
