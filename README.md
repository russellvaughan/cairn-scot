# Cairn — Deployment Guide

## What's in this repo

This is the complete frontend for Cairn, built with Vite + React + TypeScript. It runs entirely on mock data — no backend required to run the demo. Backend setup is covered in the steps below.

---

## Step 1: Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository called `cairn`
2. Open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial frontend"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/cairn.git
git push -u origin main
```

Replace `YOURUSERNAME` with your GitHub username.

---

## Step 2: Deploy frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `cairn` repository
4. Vercel will auto-detect Vite — leave all settings as default
5. Click **Deploy**

Your app will be live at a URL like `cairn-abc123.vercel.app` within 2 minutes.

Every time you push to GitHub, Vercel redeploys automatically.

---

## Step 3: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **New Project**
3. **Important:** Select region **West EU (London)** — this keeps all data in the UK
4. Give it a strong database password and save it somewhere safe
5. Wait for the project to finish provisioning (~2 minutes)

---

## Step 4: Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Open the `schema.sql` file from this repo and paste the entire contents
3. Click **Run**
4. You should see "Success" with no errors

This now includes:
- Core Cairn tables + RLS policies
- `achievement_media` table for photo/video attachments
- Private Supabase Storage bucket (`achievement-media`) and media storage policies

---

## Step 5: Seed the CfE framework data

1. Still in the SQL Editor, open a new tab
2. Open the `cfe-seed.sql` file and paste the entire contents
3. Click **Run**
4. This inserts all 220+ Experiences and Outcomes — takes about 5 seconds

To verify it worked, run this in a new SQL editor tab:
```sql
SELECT curriculum_area, COUNT(*) FROM cfe_outcomes GROUP BY curriculum_area;
```
You should see 8 rows, one for each curriculum area.

---

## Step 6: Set up authentication

1. In Supabase, go to **Authentication → Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication → Email Templates**
4. Update the "Magic Link" template subject to: `Sign in to Cairn`

For production you'll want to connect a custom email domain via Resend. For now the default Supabase emails work fine for testing.

---

## Step 7: Connect frontend to Supabase

1. In Supabase, open your project and click **Connect** (top bar), or go to **Project Settings → API**
2. Copy the **Project URL**
3. In **Project Settings → API Keys**, copy your **Publishable key** (`sb_publishable_...`)
4. In Vercel, go to your project → **Settings → Environment Variables**
5. Add these variables:

```
VITE_SUPABASE_URL = your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY = your-publishable-key
```

6. Go to **Deployments** and click **Redeploy** to pick up the new variables

Notes:
- If your code still uses `VITE_SUPABASE_ANON_KEY`, you can temporarily set that to the same publishable value.
- Do not use `secret` or `service_role` keys in frontend or Vercel public env vars.

---

## Step 8: Set up the backend API (for AI features)

The AI curriculum mapping runs on a small backend. You have two options:

**Option A — Vercel Serverless Functions (simplest)**
Add an `api/` folder to this repo with Hono routes. Vercel deploys these automatically as serverless functions alongside the frontend. No separate server needed.

**Option B — Railway (if you need more control)**
1. Go to [railway.app](https://railway.app)
2. Create a new project from your GitHub repo
3. Set the root directory to `/server` (once you build the backend)
4. Add environment variables including `ANTHROPIC_API_KEY`

For MVP, Option A is recommended. It keeps everything in one repo and one deployment.

---

## Step 9: Add the Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add it as an environment variable in Vercel:

```
ANTHROPIC_API_KEY = sk-ant-...
```

**Never commit this key to GitHub.** It should only ever live in environment variables.

---

## Step 10: Test the full flow

1. Open your deployed Vercel URL on your phone
2. Tap **Teacher demo** to try the teacher flow
3. Tap **Parent demo** to try the parent flow
4. Try logging an achievement and watch the AI suggestions appear
5. Add to your phone's home screen (Safari: Share → Add to Home Screen)

---

## Media uploads (photos/videos)

For MVP, media uploads can go directly from frontend to Supabase Storage (no separate upload API required).

Use this order when attaching media to an achievement:
1. Create an `achievement_media` row first (with `achievement_id`, `school_id`, `uploaded_by`, and `storage_path`)
2. Upload the file to Supabase Storage bucket `achievement-media` using that exact `storage_path`
3. Read media using signed URLs (private bucket), not public URLs

Notes:
- Max file size is `250MB`
- Allowed images: `image/jpeg`, `image/png`, `image/webp`, `image/heic`
- Allowed videos: `video/mp4`, `video/quicktime`, `video/webm`

---

## What's mock data vs real

Right now the app runs on mock data defined in `src/data/mock.ts`. As you build the backend, you'll replace these one by one:

| Mock file | Replace with |
|---|---|
| `mockPupils` | Supabase `pupils` table |
| `mockAchievements` | Supabase `achievements` table |
| `mockAchievements` media fields | Supabase `achievement_media` + Storage bucket `achievement-media` |
| `mockAiSuggestions` | Real Anthropic API call |
| `formatDate`, `getDaysSince` | Keep these — they're utility functions |

---

## Development locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`

---

## Questions

The full system prompt for building the backend is in `cairn-system-prompt-v2.md`. Hand that to any AI coding tool (Cursor, Claude, etc.) at the start of a new session and it will know everything about the product, the data model, the privacy requirements, and the build sequence.
