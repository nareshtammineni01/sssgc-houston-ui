# SSSGC Houston UI

Website for **Sri Sathya Sai Center at Houston** — a 501(c)(3) non-profit spiritual center in Katy, TX, affiliated to SSSGC, Prasanthi Nilayam. Built with Next.js 14, Supabase, and Tailwind CSS, deployed on Vercel.

Production: [sssgc-houston.org](https://www.sssgc-houston.org)

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)
- A Google Calendar API key (optional, for holiday calendar integration)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/sssgc-houston-ui.git
cd sssgc-houston-ui

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key   # optional
```

### Database Setup

Run the SQL migrations in order in your Supabase SQL Editor (`supabase/migrations/`):

```
01_phase1_foundation.sql       — Profiles, families, daily quotes, site content
02_phase2_announcements.sql    — Announcements, notification preferences
03_phase3_resources.sql        — Resources with full-text search, favorites
04_phase4_events.sql           — Events with RRULE recurrence, signups, Educare enrollments
05_phase5_gallery_community.sql — Gallery, volunteer hours, member directory
06_storage_buckets.sql         — Supabase storage buckets
07_auth_profile_fields.sql     — Additional profile fields
08_restore_database_state.sql  — State restoration
09_fix_rls_recursion.sql       — RLS policy fix
10_update_site_content.sql     — Site content updates
11_family_system.sql           — Family management system
12_event_guest_count.sql       — RSVP guest count (party size 1-10)
13_event_rsvp_deadline.sql     — RSVP deadline/freeze feature
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Features

### Public Pages

- **Home** — Compact hero banner, three-pillar cards (Devotion, Educare, Seva), upcoming events, announcements, daily Sai Baba quote, live ticker
- **About** — Center history and mission
- **I'm New Here** — Welcome guide for first-time visitors
- **Calendar** — Monthly calendar with Google Calendar integration (Hindu holidays, US holidays, SSSGC events). Click any date to see events, RSVP with guest count
- **Announcements** — Pinned and categorized news with detail pages
- **Resources** — 722+ bhajans, prayers, study circle guides with full-text search, filters, and favorites
- **Gallery** — Photo albums organized by category and event date
- **Contact** — Center location, directions, and contact info

### Devotion Section

- **Overview** — Weekly devotion description with quick navigation cards
- **Bhajan/Arathi Signups** — Sign up for devotional service slots
- **Devotional Resources** — Bhajan lyrics, prayer guides, study circle materials, bhajan book
- **Special Events** — Upcoming spiritual celebrations

### Educare Section

- **Overview** — Sri Sathya Sai Educare philosophy (Truth, Right Conduct, Peace, Love, Non-violence)
- **Announcements** — Educare-specific news
- **Meet the Gurus** — Teacher profiles
- **Resources** — Educational materials
- **Online Classes** — Virtual class information
- **Bhajan Tutor Signup** — Sign up to teach bhajans
- **Enrollment** — Educare program enrollment form

### Seva (Service) Section

- **Overview** — "Service to Man is Service to God" with 6 service highlight cards
- **Service Projects** — Food Rescue & Distribution, NTFB Monthly Drive, Medical/Health Care, Shelter Support, Walkathon, Environmental Care

### RSVP System

- **Guest count** — Users select how many people are attending (1-10) via a modal
- **Sign-in required** — Redirects to login page if not authenticated
- **Edit/Cancel** — Signed-up users can adjust guest count or cancel
- **RSVP deadline** — Admins can set a cutoff date; RSVPs freeze after deadline
- **Live counts** — Total headcount (sum of all guest counts) displayed on each event

### Google Calendar Integration

- Fetches Hindu holidays, US holidays, and SSSGC custom calendar events via Google Calendar API v3
- Server-side API route keeps API key hidden from browser
- Cached with 1-hour revalidation + CDN stale-while-revalidate
- Toggle holidays on/off with a single button

### Member Features (requires login)

- **Dashboard** — Personal overview with upcoming events and activity
- **Member Directory** — Searchable directory with privacy controls
- **Seva Hours** — Log and track volunteer service hours
- **Profile Settings** — Update personal info, notification preferences

### Admin Panel (admin/super_admin roles)

- **Dashboard** — Stats overview: members, families, events, resources, announcements
- **Announcements** — Create, edit, publish, pin announcements with Tiptap rich text editor
- **Events** — Create/edit events with recurrence (RRULE), max capacity, RSVP deadline
- **Event RSVPs** — View attendee list with name, email, phone, guest count, RSVP date. Export to CSV
- **Resources** — Manage bhajans, documents, and media
- **Gallery** — Upload and manage photo albums
- **Members** — View and manage member accounts, assign roles, manage families
- **Daily Quotes** — Schedule rotating Sai Baba quotes

### Navigation

- **Responsive sidebar** — Full labels on desktop, icon rail on tablet, bottom tabs on mobile
- **Expandable dropdowns** — Devotion, Educare, and Seva have expandable sub-navigation. Clicking a parent navigates to its overview and expands children

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, server + client components) |
| Database | Supabase (Postgres + Auth + Storage + Real-time + RLS) |
| Styling | Tailwind CSS with custom SSSGC design tokens |
| Icons | Lucide React |
| Rich Text | Tiptap (announcements editor) |
| Calendar | Google Calendar API v3 |
| Hosting | Vercel (free tier) |
| Email | Resend (3K/month free) |

---

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| Saffron | `#E8860C` | Primary actions, buttons, badges |
| Maroon | `#6B1D2A` | Headings, sidebar active state, accents |
| Cream | `#FDF8F0` | Page background |
| Gold | `#C4922A` | Secondary accents, card borders |
| Text Dark | `#2C1810` | Primary text |
| Text Muted | `#7A6B5F` | Secondary text |

Typography: Cormorant Garamond for headings (weight 500), DM Sans for body. Font sizes are 15-17px for body text to accommodate elderly users.

### Responsive Breakpoints

- **Mobile** (<768px): Bottom tab navigation
- **Tablet** (768-1023px): 64px icon rail sidebar
- **Desktop** (1024+): 220px full sidebar with labels

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home page
│   ├── about/                  # About Us
│   ├── new-here/               # I'm New Here
│   ├── calendar/               # Event calendar + RSVP
│   ├── announcements/          # News listing + detail
│   ├── devotion/               # Devotion overview + 3 sub-pages
│   ├── educare/                # Educare overview + 5 sub-pages + enrollment
│   ├── seva/                   # Seva overview
│   ├── service/                # Service Projects
│   ├── resources/              # Resource library
│   ├── gallery/                # Photo gallery
│   ├── dashboard/              # Member dashboard + directory + seva hours
│   ├── settings/               # Profile settings
│   ├── admin/                  # Admin panel (6 modules + event signups)
│   ├── login/                  # Auth (sign in / sign up)
│   ├── signup/                 # Registration
│   ├── forgot-password/        # Password reset request
│   ├── reset-password/         # Password reset form
│   ├── contact/                # Contact info
│   ├── privacy/                # Privacy policy
│   ├── terms/                  # Terms of service
│   └── auth/callback/          # OAuth callback handler
├── components/
│   ├── layout/                 # AppShell: Sidebar, IconRail, BottomNav, TopBar, Footer
│   ├── home/                   # LiveTicker
│   └── ui/                     # Shared UI components (FloatingField, etc.)
├── lib/
│   ├── supabase/               # Supabase clients (browser, server, middleware)
│   ├── google-calendar.ts      # Google Calendar API utility
│   └── utils.ts                # Utility functions (formatDate, formatTime, cn)
├── types/
│   └── database.ts             # TypeScript types for all Supabase tables
├── hooks/                      # React hooks
├── data/                       # Static data constants
└── middleware.ts               # Auth session refresh + route protection
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-side admin operations |
| `GOOGLE_CALENDAR_API_KEY` | No | Google Calendar API for holidays |

Never commit `.env.local` — it's in `.gitignore`.

---

## Roles

| Role | Access |
|------|--------|
| `member` | RSVP to events, view resources, manage profile, log seva hours |
| `admin` | All member permissions + manage events, announcements, resources, gallery, view RSVPs/export |
| `super_admin` | All admin permissions + manage user roles, manage families |

---

## Deployment (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard (Settings > Environment Variables)
3. Add `GOOGLE_CALENDAR_API_KEY` to Vercel env vars for calendar integration
4. Deploy — Vercel auto-builds on push to `main`

---

## License

Private — Sri Sathya Sai Center at Houston. All rights reserved.
