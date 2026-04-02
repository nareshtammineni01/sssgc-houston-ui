# SSSGC Houston UI

Next.js 14 website for Sri Sathya Sai Center at Houston.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your Supabase keys
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Styling:** Tailwind CSS with custom SSSGC design tokens
- **Icons:** Lucide React
- **Hosting:** Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with AppShell
│   ├── page.tsx            # Home page
│   ├── about/              # About Us
│   ├── new-here/           # I'm New Here
│   ├── devotion/           # Devotion
│   ├── educare/            # Educare
│   ├── seva/               # Seva (Service)
│   ├── resources/          # Resource library (bhajans, docs)
│   ├── calendar/           # Event calendar
│   ├── gallery/            # Photo gallery
│   ├── login/              # Auth (sign in / sign up)
│   ├── dashboard/          # Member dashboard
│   ├── settings/           # Profile settings
│   ├── admin/              # Admin panel
│   ├── contact/            # Contact info
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   └── auth/callback/      # OAuth callback handler
├── components/
│   └── layout/             # Responsive shell (Sidebar, IconRail, BottomNav, TopBar, Footer)
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   └── utils.ts            # Utility functions
├── types/
│   └── database.ts         # TypeScript types for Supabase tables
└── middleware.ts            # Auth session refresh + route protection
```

## Design Tokens

| Token   | Value     | Usage              |
| ------- | --------- | ------------------ |
| Saffron | `#E8860C` | Primary actions    |
| Maroon  | `#6B1D2A` | Headings, accents  |
| Cream   | `#FDF8F0` | Background         |
| Gold    | `#C4922A` | Secondary accents  |

## Responsive Breakpoints

- **Mobile** (<768px): Bottom tab navigation
- **Tablet** (768-1023px): Icon rail sidebar
- **Desktop** (1024+): Full sidebar with labels
