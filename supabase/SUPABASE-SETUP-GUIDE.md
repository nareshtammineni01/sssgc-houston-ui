# SSSGC Houston — Supabase Setup Guide

Follow these steps to get the database up and running.

---

## Step 1: Create Supabase Project

1. Go to **https://supabase.com** → "Start your project"
2. Sign up with **GitHub** (easiest) or email
3. Click **"New Project"**
4. Fill in:
   - **Organization:** "SSSGC Houston"
   - **Project name:** `sssgc-houston`
   - **Database password:** (save this!)
   - **Region:** US East (N. Virginia)
   - **Plan:** Free
5. Click **"Create new project"** — wait ~2 min

---

## Step 2: Save Your Project Keys

Go to **Settings → API** in the Supabase dashboard.

Copy and save these 3 values (you'll need them for the Next.js app):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...  (safe for browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...      (SECRET - server only)
```

---

## Step 3: Run SQL Scripts (in order!)

Go to **SQL Editor** in the Supabase dashboard (left sidebar).

Run these files **one at a time, in order**. Copy-paste each file's contents and click "Run":

| Order | File | What it creates |
|-------|------|-----------------|
| 1 | `sql/01_phase1_foundation.sql` | families, profiles, daily_quotes, site_content + triggers + seed data |
| 2 | `sql/06_storage_buckets.sql` | Storage buckets (resources, announcements, gallery, avatars) |

That's all you need for Phase 1! The remaining scripts are for later phases:

| Phase | File | Run when... |
|-------|------|-------------|
| 2 | `sql/02_phase2_announcements.sql` | Starting announcements & notifications |
| 3 | `sql/03_phase3_resources.sql` | Starting resource library + WordPress migration |
| 4 | `sql/04_phase4_events.sql` | Starting calendar, events, Educare, volunteer signup |
| 5 | `sql/05_phase5_gallery_community.sql` | Starting gallery, volunteer hours, member directory |

---

## Step 4: Verify Tables Were Created

After running script 1, go to **Table Editor** in the Supabase dashboard. You should see:

- ✅ `families` (0 rows)
- ✅ `profiles` (0 rows)
- ✅ `daily_quotes` (7 rows — seeded with Swami quotes)
- ✅ `site_content` (7 rows — seeded with placeholder pages)

---

## Step 5: Set Up Auth Providers

Go to **Authentication → Providers** in the Supabase dashboard.

### Email/Password (already enabled by default)
- ✅ Should be enabled already
- Optionally enable "Confirm email" to require email verification

### Google Sign-In
1. Go to **Google Cloud Console** → https://console.cloud.google.com
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials" → OAuth Client ID**
5. Application type: **Web application**
6. Name: "SSSGC Houston"
7. Authorized redirect URIs: add `https://your-project-id.supabase.co/auth/v1/callback`
8. Copy the **Client ID** and **Client Secret**
9. Back in Supabase: **Authentication → Providers → Google**
10. Toggle ON, paste Client ID and Client Secret, Save

### Apple Sign-In (optional — requires $99/yr Apple Developer account)
1. Go to **Apple Developer** → https://developer.apple.com
2. Register an App ID with "Sign In with Apple" capability
3. Create a Services ID for web authentication
4. Generate a private key
5. Back in Supabase: **Authentication → Providers → Apple**
6. Enter the required credentials

> **Note:** If you don't have an Apple Developer account, skip this for now. Google + email/password is enough to start. You can add Apple later.

---

## Step 6: Make Yourself a Super Admin

After your first login/signup, you need to promote yourself to `super_admin`:

Go to **SQL Editor** and run:

```sql
-- Replace with your actual email
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'nareshtammineni01@gmail.com';
```

---

## Step 7: Verify Everything Works

### Quick checks in the Supabase dashboard:

1. **Table Editor** → `site_content` → should have 7 rows
2. **Table Editor** → `daily_quotes` → should have 7 quotes
3. **SQL Editor** → run `SELECT * FROM get_daily_quote();` → should return one quote
4. **Authentication → Providers** → Google should be enabled
5. **Storage** → should show 4 buckets (resources, announcements, gallery, avatars)

---

## What's Next?

Once the database is up:
1. We set up the **Next.js project** with Supabase client libraries
2. Build the **auth flow** (login/register with Google + email)
3. Build the **responsive layout shell** (sidebar/icon rail/bottom nav)
4. Wire up the **static pages** pulling content from `site_content` table

---

*Last updated: April 1, 2026*
