# SSSGC Houston UI — Project Context

## What This Is

Website for **Sri Sathya Sai Center at Houston** (sssgc-houston.org) — a 501(c)(3) non-profit spiritual center in Katy, TX, affiliated to SSSGC, Prasanthi Nilayam. Migrating from WordPress on AWS Lightsail to a modern stack.

**Maintainer:** Naresh (sole technical person). Ask before applying code changes — present plan first, get confirmation.

## Tech Stack

- **Framework:** Next.js 14 (App Router, `src/` directory)
- **Database & Auth:** Supabase (Postgres + Auth + Storage + Real-time + RLS)
- **Styling:** Tailwind CSS with custom design tokens (see below)
- **Icons:** Lucide React
- **Rich Text Editor:** Tiptap (announcements)
- **Calendar Integration:** Google Calendar API v3 (Hindu, US, SSSGC holidays)
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
| Gold | `#C4922A` | Secondary accents, card borders |
| Gold Border | `rgba(196,146,42,0.3)` | Card border accents |
| Gold Light | `#F0DEB4` | Hero greeting text |
| Text Dark | `#2C1810` | Primary text (NOT gray-900) |
| Text Muted | `#7A6B5F` | Secondary text (NOT gray-500) |
| Text Light | `#A89888` | Tertiary/placeholder text |
| Border | `rgba(107,29,42,0.1)` | All borders (NOT gray-200) |

### Typography
- **Headings:** Cormorant Garamond, weight 500 (not bold/700)
- **Body:** DM Sans, 15-17px for content pages (elderly-friendly), 13px for UI chrome
- Sidebar items: 13px, logo text: 14px

### Layout Breakpoints
- **Mobile** (<768px): Bottom tab navigation (64px), no sidebar
- **Tablet** (768–1023px): 64px icon rail, maroon active state
- **Desktop** (1024+): 220px full sidebar, maroon active state, user profile at bottom

### Key UI Patterns
- Sidebar active = maroon background, white text (NOT saffron highlight)
- Expandable sidebar dropdowns for Devotion (3 children), Educare (5 children), Seva (1 child: Service Projects)
- Logo = gradient circle (saffron → maroon) with "S"
- TopBar = cream search field, 34px circle icon buttons, saffron notification badge
- Hero = compact gradient banner (maroon-deep → maroon → saffron), "Om Sri Sai Ram" greeting, ~180px height
- Pillar cards = centered text with emoji icons, hover lifts card
- Events + Announcements = side-by-side 2-column cards (not stacked)
- Announcements = colored dots (maroon/blue/green) not badges
- Event tags = small colored pills (9px, category-specific colors)
- Cards = white, `border: 1px solid rgba(107,29,42,0.1)`, 12px radius, NO box-shadow
- Section overview pages = Sai Baba blockquote (saffron left border), intro paragraph, quick navigation cards with gold icons and "Explore →" hover animation
- Service highlight cards = horizontal icon+title layout, gold borders, 2-column grid

## Database Schema

SQL migrations are in `supabase/migrations/` (run in order):

| # | File | Description |
|---|------|-------------|
| 1 | `01_phase1_foundation.sql` | families, profiles, daily_quotes, site_content + RLS + triggers + seeds |
| 2 | `02_phase2_announcements.sql` | announcements, notification_preferences, notification_log |
| 3 | `03_phase3_resources.sql` | resources (with GIN full-text search), favorites |
| 4 | `04_phase4_events.sql` | events (RRULE recurrence), event_signups, educare_enrollments |
| 5 | `05_phase5_gallery_community.sql` | gallery_albums, gallery_photos, volunteer_hours, directory_settings |
| 6 | `06_storage_buckets.sql` | 4 buckets: resources, announcements, gallery, avatars |
| 7 | `07_auth_profile_fields.sql` | Additional profile fields (first_name, last_name) |
| 8 | `08_restore_database_state.sql` | State restoration |
| 9 | `09_fix_rls_recursion.sql` | RLS policy fix for recursive queries |
| 10 | `10_update_site_content.sql` | Site content updates |
| 11 | `11_family_system.sql` | Family management system |
| 12 | `12_event_guest_count.sql` | `guest_count` column on event_signups (1-10, default 1) |
| 13 | `13_event_rsvp_deadline.sql` | `rsvp_deadline` column on events (timestamptz, nullable) |

Key functions: `handle_new_user()` trigger auto-creates profile on `auth.users` insert. `get_daily_quote()` returns rotating quote.

### RSVP System (event_signups)
- `guest_count` (int, 1-10): number of people attending per signup
- `status`: 'confirmed' | 'waitlisted' | 'cancelled'
- `attended` (boolean): for future attendance tracking
- Unique constraint on `(event_id, user_id)` — upsert with `onConflict: 'event_id,user_id'`
- Total headcount = SUM(guest_count) of confirmed signups
- `rsvp_deadline` on events table: after this timestamp, no new RSVPs or changes allowed

## Supabase Client Setup

- **Browser:** `src/lib/supabase/client.ts` — `createBrowserClient`
- **Server (RSC/Route Handlers):** `src/lib/supabase/server.ts` — `createServerClient` with cookies
- **Middleware:** `src/middleware.ts` → `src/lib/supabase/middleware.ts` — session refresh + route protection
- **Auth callback:** `src/app/auth/callback/route.ts` — code exchange for OAuth/magic link
- **Types:** `src/types/database.ts` — manually written, replace with `npx supabase gen types` later

## Google Calendar Integration

- **Utility:** `src/lib/google-calendar.ts` — fetches from multiple calendar sources in parallel via `Promise.allSettled`
- **API Route:** `src/app/api/google-calendar/route.ts` — GET endpoint, keeps API key server-side
- **Calendar Sources:**
  - Hindu holidays: `en.hinduism#holiday@group.v.calendar.google.com`
  - US holidays: `en.usa#holiday@group.v.calendar.google.com`
  - SSSGC custom: `ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com`
- **Caching:** `next: { revalidate: 3600 }` + CDN `s-maxage=3600, stale-while-revalidate=86400`
- **Google Cloud Console:** API key with Application restrictions "None", API restrictions "Google Calendar API" only

## Route Map

### Public Pages
`/` Home, `/about`, `/new-here`, `/calendar`, `/announcements`, `/announcements/[id]`, `/resources`, `/resources/[id]`, `/gallery`, `/gallery/[id]`, `/contact`, `/privacy`, `/terms`, `/login`, `/signup`, `/forgot-password`, `/reset-password`

### Devotion Section
`/devotion` Overview, `/devotion/bhajan-signups`, `/devotion/resources`, `/devotion/special-events`

### Educare Section
`/educare` Overview, `/educare/announcements`, `/educare/meet-the-gurus`, `/educare/resources`, `/educare/online-classes`, `/educare/bhajan-tutor-signup`, `/educare/enroll`

### Seva Section
`/seva` Overview, `/service` Service Projects

### Protected (member)
`/dashboard`, `/dashboard/directory`, `/dashboard/seva-hours`, `/settings`, `/profile`

### Protected (admin — checked via RLS + profile.role)
`/admin` Dashboard, `/admin/announcements` CRUD, `/admin/events` CRUD, `/admin/events/[id]/signups` Attendee list + CSV export, `/admin/resources` CRUD, `/admin/gallery` CRUD, `/admin/members` Management, `/admin/quotes` Daily quotes

## Build Phases

1. **Phase 1 (Foundation)** — ✅ DB schema, ✅ Next.js scaffold, ✅ Layout shell, ✅ Supabase clients
2. **Phase 2 (Announcements/News)** — ✅ Admin CRUD, ✅ live ticker, ✅ notification prefs
3. **Phase 3 (Resource Library)** — ✅ 722+ bhajans, ✅ full-text search, ✅ filters, ✅ favorites
4. **Phase 4 (Calendar/Events)** — ✅ RRULE recurrence, ✅ RSVP with guest count, ✅ RSVP deadline, ✅ admin attendee export, ✅ Google Calendar integration
5. **Phase 5 (Gallery/Community)** — ✅ Photo albums, ✅ volunteer hours, ✅ member directory
6. **Phase 6 (Go-Live)** — DNS, Vercel deploy, Google OAuth, data migration

## Recent Implementations

### RSVP System (Phase 4 enhancement)
- Modal-based RSVP flow with guest count selector (1-10 people)
- Sign-in required — redirects to `/login?redirect=/calendar`
- Edit mode: signed-up users can adjust guest count or cancel via the same modal
- RSVP deadline: admin sets optional cutoff; after deadline, RSVPs are frozen (no new, no edit, no cancel)
- Admin signups page (`/admin/events/[id]/signups`): attendee table + stats cards + CSV export
- Total headcount = sum of all guest_count values across confirmed signups

### Section Redesigns
- **Devotion, Educare, Seva** all follow the same pattern: overview page with Sai Baba quote, intro text, quick navigation cards linking to sub-pages
- **Expandable sidebar** with dropdowns for all three sections
- **Footer** includes "Affiliated to SSSGC, Prasanthi Nilayam"
- **Hero section** compacted to ~180px to reduce wasted space on home page

### Google Calendar API
- Replaced static Hindu calendar data with live Google Calendar API
- Server-side route (`/api/google-calendar`) hides API key
- Toggle button for holidays on/off
- Color-coded dots and legend for different calendar sources

## Decisions & Notes

- Google OAuth deferred — using email/password for now, will set up before go-live
- No donations feature (center collects in person)
- Photos stored externally (Google Photos/Drive), gallery links to them
- Recurring events use RRULE (RFC 5545) with parent/child override pattern
- Rich text for announcements via Tiptap editor
- Budget target: under $100/month total (Vercel free + Supabase free + Resend free)
- Font sizes 15-17px for content pages to accommodate elderly users

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...  (optional, server-side only)
GOOGLE_CALENDAR_API_KEY=AIza...     (optional, for calendar holidays)
```

Never commit `.env.local` — it's in `.gitignore`.
