# SSSGC Houston UI — Project Context

## What This Is

Website for **Sri Sathya Sai Center at Houston** (sssgc-houston.org) — a 501(c)(3) non-profit spiritual center in Katy, TX. Migrating from WordPress on AWS Lightsail to a modern stack.

**Maintainer:** Naresh (sole technical person). Ask before applying code changes — present plan first, get confirmation.

**Repo:** https://github.com/nareshtammineni01/sssgc-houston-ui.git

## Tech Stack

- **Framework:** Next.js 14 (App Router, `src/` directory)
- **Database & Auth:** Supabase (Postgres + Auth + Storage + Real-time + RLS)
- **Styling:** Tailwind CSS with custom design tokens (see below)
- **Icons:** Lucide React
- **Hosting:** Vercel (free tier target)
- **Email:** Resend (3K/mo free)
- **WhatsApp:** Meta Cloud API (future)

## Design System

Mockup reference files are in the parent folder: `../SriSatyaSai-Houston/`
- `sssgc_houston_desktop_tablet_mockup.html` — Desktop (1440px) + Tablet (768px)
- `sssgc_houston_mobile_mockup.html` — Mobile (375px)

### Colors (warm, maroon-tinted — NOT plain gray)
| Token | Hex | Usage |
|-------|-----|-------|
| Saffron | `#E8860C` | Primary actions, buttons, badges |
| Saffron Light | `#FFF3E0` | Ticker background, highlights |
| Maroon | `#6B1D2A` | Headings, sidebar active state, accents |
| Maroon Deep | `#4A1219` | Hero gradient start |
| Cream | `#FDF8F0` | Page background |
| Gold | `#C4922A` | Secondary accents |
| Gold Light | `#F0DEB4` | Hero greeting text |
| Text Dark | `#2C1810` | Primary text (NOT gray-900) |
| Text Muted | `#7A6B5F` | Secondary text (NOT gray-500) |
| Text Light | `#A89888` | Tertiary/placeholder text |
| Border | `rgba(107,29,42,0.1)` | All borders (NOT gray-200) |

### Typography
- **Headings:** Cormorant Garamond, weight 500 (not bold/700)
- **Body:** DM Sans, 13px base for UI elements
- Sidebar items: 13px, logo text: 14px

### Layout Breakpoints
- **Mobile** (<768px): Bottom tab navigation (64px), no sidebar
- **Tablet** (768–1023px): 64px icon rail, maroon active state
- **Desktop** (1024+): 220px full sidebar, maroon active state, user profile at bottom

### Key UI Patterns (from mockup)
- Sidebar active = maroon background, white text (NOT saffron highlight)
- Logo = gradient circle (saffron → maroon) with "S"
- TopBar = cream search field, 34px circle icon buttons, saffron notification badge
- Hero = gradient background (maroon-deep → maroon → saffron), "Om Sri Sai Ram" greeting
- Pillar cards = centered text with emoji icons, hover lifts card
- Events + Announcements = side-by-side 2-column cards (not stacked)
- Announcements = colored dots (maroon/blue/green) not badges
- Event tags = small colored pills (9px, category-specific colors)
- Cards = white, `border: 1px solid rgba(107,29,42,0.1)`, 12px radius, NO box-shadow

## Database Schema

SQL migrations are in `supabase/migrations/` (run in order):
1. `01_phase1_foundation.sql` — families, profiles, daily_quotes, site_content + RLS + triggers + seeds
2. `02_phase2_announcements.sql` — announcements, notification_preferences, notification_log
3. `03_phase3_resources.sql` — resources (with GIN full-text search), favorites
4. `04_phase4_events.sql` — events (RRULE recurrence), signups, educare_enrollments
5. `05_phase5_gallery_community.sql` — gallery_albums, gallery_photos, volunteer_hours, directory_settings
6. `06_storage_buckets.sql` — 4 buckets: resources, announcements, gallery, avatars

Schema docs: `supabase/SSSGC-Supabase-Schema-DRAFT.md`, `supabase/SUPABASE-SETUP-GUIDE.md`

Key: `handle_new_user()` trigger auto-creates profile on `auth.users` insert. `get_daily_quote()` function returns rotating quote.

## Supabase Client Setup

- **Browser:** `src/lib/supabase/client.ts` — `createBrowserClient`
- **Server (RSC/Route Handlers):** `src/lib/supabase/server.ts` — `createServerClient` with cookies
- **Middleware:** `src/middleware.ts` → `src/lib/supabase/middleware.ts` — session refresh + route protection
- **Auth callback:** `src/app/auth/callback/route.ts` — code exchange for OAuth/magic link
- **Types:** `src/types/database.ts` — manually written, replace with `npx supabase gen types` later

## Route Map

### Public Pages
`/` Home, `/about`, `/new-here`, `/devotion`, `/educare`, `/seva`, `/resources`, `/calendar`, `/gallery`, `/contact`, `/privacy`, `/terms`, `/login`

### Protected (member)
`/dashboard`, `/settings`

### Protected (admin — checked via RLS + profile.role)
`/admin`

## Build Phases

1. **Phase 1 (Foundation)** — ✅ DB schema, ✅ Next.js scaffold, ✅ Layout shell, ✅ Supabase clients
2. **Phase 2 (Announcements/News)** — Admin CRUD for announcements, live ticker, notification prefs
3. **Phase 3 (Resource Library)** — 722+ bhajans, full-text search, filters, favorites
4. **Phase 4 (Calendar/Events)** — RRULE recurrence, signups, Educare enrollment
5. **Phase 5 (Gallery/Community)** — Photo albums, volunteer hours, member directory
6. **Phase 6 (Go-Live)** — DNS, Vercel deploy, Google OAuth, data migration

## Decisions & Notes

- Google OAuth deferred — using email/password for now, will set up before go-live
- No donations feature (center collects in person)
- Photos stored externally (Google Photos/Drive), gallery links to them
- Recurring events use RRULE (RFC 5545) with parent/child override pattern
- Rich text for announcements via WYSIWYG (Tiptap recommended)
- Budget target: under $100/month total (Vercel free + Supabase free + Resend free)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...  (optional, server-side only)
```

Never commit `.env.local` — it's in `.gitignore`.
