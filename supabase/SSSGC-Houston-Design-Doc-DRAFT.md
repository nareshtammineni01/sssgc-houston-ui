# SSSGC Houston — Website Modernization Design Document

**Status:** DRAFT v2 — Enhanced with full feature set
**Author:** Naresh Tammineni
**Date:** April 1, 2026
**Version:** 0.2

---

## 1. Executive Summary

This document outlines the phased plan to modernize the Sri Sathya Sai Center at Houston website (sssgc-houston.org). We are migrating from a WordPress site hosted on AWS Lightsail to a modern Next.js + Supabase stack, hosted on Vercel. The goal is a mobile-first, member-centric platform that consolidates fragmented workflows (Google Forms, scattered announcements, static pages) into a unified, low-cost, easy-to-maintain system.

**Key outcomes:** A welcoming, mobile-first community hub with member accounts (social login), 722+ searchable bhajans, event management with RSVP, push notifications via email and WhatsApp, photo/video gallery, newcomer guide, Educare & Seva sections, and a simple admin interface that requires zero code knowledge.

---

## 2. Problem Statement

The current WordPress site suffers from several pain points:

- **No member accounts** — everything is public or routed through external Google Forms
- **Poor resource discovery** — 722+ bhajans only browsable alphabetically, no search by keyword/deity/category
- **Fragmented UX** — signups via Google Forms, announcements scattered, embedded iframes
- **Weak mobile experience** — heavy nav and embedded content don't work well on phones
- **No notification system** — members rely on word-of-mouth
- **Static content model** — admins edit WordPress pages directly; slow for weekly updates
- **Hosting cost** — AWS Lightsail at ~$10-20/mo for what could be free-tier

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14+ (App Router) | SSR/SSG, API routes, excellent DX |
| Styling | Tailwind CSS | Utility-first, responsive, fast iteration |
| Backend / Auth / DB | Supabase (free tier) | Postgres, Auth, Storage, Real-time, RLS |
| Hosting | Vercel (free tier) | Native Next.js deployment, global CDN |
| Email | Resend (free tier: 3K/mo) | Transactional + announcement emails |
| WhatsApp | Meta Cloud API (1K free/mo) | Urgent notifications via Edge Functions |
| Domain | sssgc-houston.org | DNS pointed to Vercel |

**Monthly cost target:** Under $100 (realistically ~$1–25 using free tiers)

---

## 4. Design System

### 4.1 Color Palette — Warm Spiritual Theme

| Token | Hex | Usage |
|-------|-----|-------|
| Saffron | #E8860C | Primary accent, CTAs, badges |
| Saffron Light | #FFF3E0 | Backgrounds, highlights |
| Maroon | #6B1D2A | Primary brand, headings, active states |
| Maroon Deep | #4A1219 | Hero backgrounds, dark accents |
| Cream | #FDF8F0 | Page backgrounds |
| Cream Dark | #F5EDE0 | Secondary backgrounds |
| Gold | #C4922A | Decorative, subtle accents |
| Gold Light | #F0DEB4 | Hero text accents |

### 4.2 Typography

- **Display / Headings:** Cormorant Garamond (serif, spiritual, elegant)
- **Body / UI:** DM Sans (clean, modern, readable)

### 4.3 Responsive Breakpoints

| Breakpoint | Width | Navigation Pattern |
|-----------|-------|-------------------|
| Mobile | 375px | Bottom tab bar (Home, Resources, Calendar, Updates, Profile) |
| Tablet | 768px | Collapsed icon-only sidebar rail (64px) |
| Desktop | 1440px | Full sidebar with labels + badge counts |

---

## 5. Complete Sitemap

All pages the site will have, organized by access level:

### Public Pages (no login required)
- `/` — Home (hero, news ticker, weekly schedule, pillar cards, upcoming events, recent announcements, daily quote, gallery preview)
- `/about` — About Us (center history, three pillars, council/leadership, affiliation with SSSGC Global Council)
- `/new-here` — Newcomer's Guide (what to expect, what to wear, parking, kids welcome, FAQ)
- `/devotion` — Devotion pillar (weekly bhajan info, vedam chanting, study circles, multi-faith prayer)
- `/educare` — Educare pillar (class schedule by age group, 5 human values, teacher bios, registration form)
- `/seva` — Seva pillar (active service projects, schedule, volunteer signup)
- `/resources` — Resource library (search, filter, browse 722 bhajans + 48 prayers + 12 study circle)
- `/resources/[id]` — Resource detail (lyrics, audio player, download, favorite button)
- `/calendar` — Event calendar (monthly grid + list view)
- `/gallery` — Photo & video gallery (Google Photos albums + YouTube embeds)
- `/contact` — Contact form, council members, Google Map embed for 4515 FM 1463 Katy TX
- `/login` — Login + registration
- `/privacy` — Privacy policy
- `/terms` — Terms of service

### Member Pages (login required)
- `/dashboard` — Member dashboard (my events, my favorites, family info, notification preferences)
- `/settings` — Profile settings (edit name/phone/city, manage notification preferences, family linking)

### Admin Pages (admin role required)
- `/admin` — Admin dashboard (stats: members, events, resources, notifications)
- `/admin/announcements` — Create/edit/pin announcements (WYSIWYG editor)
- `/admin/resources` — Upload/manage bhajans, prayers, documents
- `/admin/events` — Create/manage events (recurring + one-off)
- `/admin/gallery` — Manage photo/video albums
- `/admin/members` — View/manage members, families, roles
- `/admin/quotes` — Manage daily quotes rotation

---

## 6. Phased Build Plan

### Phase 1: Foundation + Static Pages (Priority: HIGHEST)

**Goal:** Project skeleton, auth, responsive layout, and all public-facing static pages that give visitors a complete first impression.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 1.1 | Next.js project scaffold | App Router, Tailwind, folder structure, design tokens | ✅ Done |
| 1.2 | Supabase project setup | Create project, configure env vars, client/server helpers | 🔲 To Do |
| 1.3 | Responsive layout shell | Sidebar (desktop) → icon rail (tablet) → bottom nav (mobile) | 🔲 To Do |
| 1.4 | Global footer | Quick links, social icons, center address, SSSGC affiliation badge | 🔲 To Do |
| 1.5 | Home page | Hero, daily quote, weekly schedule, pillar cards, upcoming events placeholder | 🔲 To Do |
| 1.6 | About Us page | Center history, three pillars, council/leadership bios, photo | 🔲 To Do |
| 1.7 | Newcomer's Guide | What to expect, what to wear, parking, kids, FAQ | 🔲 To Do |
| 1.8 | Devotion page | Weekly bhajan info, vedam chanting, study circle overview | 🔲 To Do |
| 1.9 | Educare page | Class schedule by age group, 5 human values, teacher bios | 🔲 To Do |
| 1.10 | Seva page | Active service projects with descriptions, schedule | 🔲 To Do |
| 1.11 | Contact page | Contact form, council members, embedded Google Map | 🔲 To Do |
| 1.12 | Privacy Policy + Terms | Required for auth providers + WhatsApp Business | 🔲 To Do |
| 1.13 | Auth system | Google sign-in, Apple sign-in, email/password via Supabase Auth | 🔲 To Do |
| 1.14 | User registration form | Full name, email, phone (WhatsApp opt-in), city, family linking | 🔲 To Do |
| 1.15 | Profiles + families tables | DB tables with RLS policies | 🔲 To Do |
| 1.16 | Admin role system | Admin vs Member roles, middleware route protection | 🔲 To Do |
| 1.17 | Member dashboard shell | Welcome, placeholder sections for events/favorites/family | 🔲 To Do |
| 1.18 | Global search bar | Visible on all breakpoints, placeholder initially | 🔲 To Do |

**Database tables:** `families`, `profiles`, `daily_quotes`, `site_content`
**Decisions resolved:** ✅ Family grouping = yes, ✅ Rich text = WYSIWYG, ✅ Recurrence = both, ✅ No language column for now

---

### Phase 2: Admin + Announcements + Notifications (Priority: HIGH)

**Goal:** Admins can post announcements with rich text, send email/WhatsApp, and manage notification preferences.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 2.1 | Admin dashboard | Stats: member count, event count, resource count, notifications sent | 🔲 To Do |
| 2.2 | WYSIWYG announcement editor | Rich text editor (Tiptap) with category, pin, schedule, notify toggles | 🔲 To Do |
| 2.3 | Announcement feed | Public feed: categorized, timestamped, filterable by pillar, pinned on top | 🔲 To Do |
| 2.4 | Live news ticker | Homepage scrolling banner via Supabase real-time | 🔲 To Do |
| 2.5 | Notification preferences | Members choose categories: Devotion, Educare, Seva, All. Channel: email, WhatsApp, both | 🔲 To Do |
| 2.6 | Email notifications | Send via Resend API, respect member preferences | 🔲 To Do |
| 2.7 | WhatsApp notifications | Send via Meta Cloud API, respect member preferences | 🔲 To Do |
| 2.8 | Daily quote system | Admin manages rotating Swami quotes, displayed on homepage | 🔲 To Do |
| 2.9 | Quick actions grid | Admin shortcuts: post announcement, upload doc, add event, manage members | 🔲 To Do |

**Database tables:** `announcements`, `notification_preferences`, `notification_log`, `daily_quotes`

---

### Phase 3: Resource Library + WordPress Migration (Priority: HIGH)

**Goal:** Migrate all 722 bhajans, 48 prayers, 12 study circle items. Build search, browse, and favorites.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 3.1 | WordPress content export | Extract via WP REST API or XML export | 🔲 To Do |
| 3.2 | Migration script | Parse WP data → insert into Supabase `resources` table | 🔲 To Do |
| 3.3 | Resource list/table view | Desktop: sortable table. Mobile: compact cards | 🔲 To Do |
| 3.4 | Filter tabs | All, Bhajans (722), Prayers (48), Study Circle (12), Documents | 🔲 To Do |
| 3.5 | Full-text search | Postgres GIN index on title + content + keywords + deity | 🔲 To Do |
| 3.6 | Resource detail view | Lyrics display, audio player embed, download, share button | 🔲 To Do |
| 3.7 | Favorites / bookmarks | Star resources, view in dashboard "My Favorites" section | 🔲 To Do |
| 3.8 | Admin upload interface | Add/edit resources with WYSIWYG, category, file upload | 🔲 To Do |

**Database tables:** `resources`, `favorites`

---

### Phase 4: Calendar, Events & Volunteer Signup (Priority: HIGH)

**Goal:** Visual calendar, RSVP, recurring events, and volunteer signup for Seva projects.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 4.1 | Monthly calendar grid | Color-coded dots (Devotion=maroon, Festival=saffron, Seva=green, Educare=blue) | 🔲 To Do |
| 4.2 | Event list view | Below calendar, grouped by week | 🔲 To Do |
| 4.3 | Recurring events | RRULE support for weekly bhajans, with override/cancel per instance | 🔲 To Do |
| 4.4 | Admin: Add/edit event | Form with recurrence, category, capacity, location | 🔲 To Do |
| 4.5 | RSVP / signup | Members RSVP for events (replaces Google Forms), waitlist if full | 🔲 To Do |
| 4.6 | Educare registration | Parents register children for classes (replaces Google Form) | 🔲 To Do |
| 4.7 | Volunteer signup | Sign up for Seva projects from the Seva page | 🔲 To Do |
| 4.8 | Automated reminders | Email + WhatsApp 24hrs before events | 🔲 To Do |
| 4.9 | Weekly schedule widget | "This Week at the Center" on homepage — auto-generated from events | 🔲 To Do |

**Database tables:** `events`, `event_signups`, `educare_enrollments`, `volunteer_signups`

---

### Phase 5: Gallery & Community Features (Priority: MEDIUM)

**Goal:** Photo/video gallery, member directory, volunteer hours tracking.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 5.1 | Photo gallery | Admin creates albums, uploads from Google Photos/Drive, grid layout | 🔲 To Do |
| 5.2 | Video gallery | Embed YouTube videos from @srisathyasaicenterathouston channel | 🔲 To Do |
| 5.3 | Admin gallery manager | Create albums, upload photos, reorder, set cover image | 🔲 To Do |
| 5.4 | Member directory | Opt-in directory with privacy controls (show name only / phone / hide) | 🔲 To Do |
| 5.5 | Volunteer hours tracking | Members log seva hours, admins approve, useful for youth service credits | 🔲 To Do |
| 5.6 | Homepage gallery preview | Auto-rotating recent photos on the home page | 🔲 To Do |

**Database tables:** `gallery_albums`, `gallery_photos`, `member_directory_settings`, `volunteer_hours`

---

### Phase 6: Migration & Go-Live (Priority: MEDIUM)

**Goal:** DNS cutover, WordPress retirement, and post-launch monitoring.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 6.1 | End-to-end testing | All flows: signup, login, browse, search, RSVP, admin, gallery | 🔲 To Do |
| 6.2 | Content verification | Verify all 722 bhajans + 48 prayers + 12 study circle items | 🔲 To Do |
| 6.3 | Mobile testing | Test on real devices (iPhone, Android, iPad) | 🔲 To Do |
| 6.4 | Accessibility check | Color contrast, keyboard navigation, screen reader basics | 🔲 To Do |
| 6.5 | SEO setup | Meta tags, Open Graph, sitemap.xml, robots.txt | 🔲 To Do |
| 6.6 | DNS cutover | Point sssgc-houston.org → Vercel | 🔲 To Do |
| 6.7 | SSL verification | Confirm HTTPS on custom domain | 🔲 To Do |
| 6.8 | Retire Lightsail | Cancel AWS after 2-week verification period | 🔲 To Do |
| 6.9 | Post-launch monitoring | Vercel analytics, Supabase usage, error tracking | 🔲 To Do |

---

## 7. Database Schema

> Full schema details are in the companion document: **SSSGC-Supabase-Schema-DRAFT.md**
> Below is a summary of all tables across all phases.

### Core Tables (Phase 1)
- `families` — Household grouping
- `profiles` — Member profiles extending `auth.users`, linked to families
- `daily_quotes` — Rotating Swami quotes for homepage
- `site_content` — Editable static page content (About, Newcomer's Guide, etc.)

### Announcements & Notifications (Phase 2)
- `announcements` — Rich text (HTML) posts with category, pinning, scheduling
- `notification_preferences` — Per-member: which categories, which channels
- `notification_log` — Audit trail of sent emails/WhatsApp messages

### Resources (Phase 3)
- `resources` — Bhajans, prayers, study circle materials, documents
- `favorites` — User bookmarks on resources

### Events & Signups (Phase 4)
- `events` — Recurring (RRULE) + one-off events with override/cancel
- `event_signups` — RSVP with status (confirmed/waitlisted/cancelled) + attendance
- `educare_enrollments` — Child class registration (parent → child → class)
- `volunteer_signups` — Seva project signups

### Gallery & Community (Phase 5)
- `gallery_albums` — Photo albums with cover image
- `gallery_photos` — Individual photos linked to albums
- `member_directory_settings` — Privacy preferences for directory visibility
- `volunteer_hours` — Logged seva hours per member

---

## 8. Suggested Project Structure

```
sssgc-houston/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar/bottom nav/footer
│   ├── page.tsx                      # Home (hero, ticker, schedule, pillars, events, quote, gallery)
│   ├── about/page.tsx                # About Us (history, pillars, leadership)
│   ├── new-here/page.tsx             # Newcomer's Guide
│   ├── login/page.tsx                # Login + registration
│   ├── dashboard/page.tsx            # Member dashboard
│   ├── settings/page.tsx             # Profile + notification preferences
│   ├── devotion/page.tsx             # Devotion pillar page
│   ├── educare/page.tsx              # Educare pillar page (classes, values, registration)
│   ├── seva/page.tsx                 # Seva pillar page (projects, volunteer signup)
│   ├── resources/
│   │   ├── page.tsx                  # Resource library (search, filter, list/table)
│   │   └── [id]/page.tsx             # Resource detail view
│   ├── calendar/page.tsx             # Event calendar + list
│   ├── gallery/
│   │   ├── page.tsx                  # Gallery albums grid
│   │   └── [albumId]/page.tsx        # Album detail (photo grid + lightbox)
│   ├── contact/page.tsx              # Contact form + map
│   ├── privacy/page.tsx              # Privacy policy
│   ├── terms/page.tsx                # Terms of service
│   ├── admin/
│   │   ├── page.tsx                  # Admin dashboard
│   │   ├── announcements/page.tsx    # WYSIWYG announcement editor
│   │   ├── resources/page.tsx        # Upload/manage resources
│   │   ├── events/page.tsx           # Manage events (recurring + one-off)
│   │   ├── gallery/page.tsx          # Manage albums + photos
│   │   ├── members/page.tsx          # Manage members + families
│   │   └── quotes/page.tsx           # Manage daily quotes
│   └── api/
│       ├── notify/route.ts           # Email + WhatsApp notification endpoint
│       ├── search/route.ts           # Full-text search endpoint
│       └── events/expand/route.ts    # Expand RRULE into event instances
├── components/
│   ├── layout/                       # Sidebar, IconRail, BottomNav, TopBar, Footer
│   ├── home/                         # Hero, NewsTicker, WeeklySchedule, PillarCards, DailyQuote, GalleryPreview
│   ├── resources/                    # ResourceTable, ResourceList, SearchBar, FilterTabs
│   ├── calendar/                     # MonthGrid, EventList, RSVPButton
│   ├── gallery/                      # AlbumGrid, PhotoGrid, Lightbox
│   ├── admin/                        # AnnouncementEditor (Tiptap), EventForm, ResourceForm
│   └── ui/                           # Button, Card, Badge, Modal, Input, Select, Tabs
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   ├── resend.ts                     # Email helpers
│   └── whatsapp.ts                   # Meta Cloud API helpers
├── tailwind.config.ts                # Custom colors (saffron, maroon, cream, gold)
└── middleware.ts                     # Auth route protection
```

---

## 9. Key Constraints & Non-Negotiables

- **Budget:** Under $100/mo (target $1–25 using free tiers)
- **Admin UX:** No code editing — everything through forms, toggles, and WYSIWYG editors
- **Mobile-first:** Must work beautifully on phones, tablets, and desktops
- **Social login:** Google and Apple sign-in required
- **Existing domain:** sssgc-houston.org must be preserved
- **One maintainer:** The site is managed by one technical person (Naresh)
- **WhatsApp:** Urgent notifications must go out via WhatsApp
- **Gallery source:** Photos from Google Photos / Google Drive
- **No donations integration** for now (can add later)

---

## 10. Decisions Made

| Decision | Answer | Date |
|----------|--------|------|
| Family grouping | Yes — `families` table with `family_role` | 2026-04-01 |
| Event recurrence | Both — RRULE for recurring + manual override/cancel per instance | 2026-04-01 |
| Language column on resources | No — not needed for now, can add later | 2026-04-01 |
| Announcement format | Rich text — WYSIWYG (Tiptap) editor, HTML stored, auto-stripped for WhatsApp | 2026-04-01 |
| Donations | Skipped for now — no online donation feature | 2026-04-01 |
| Gallery source | Google Photos / Google Drive — admin uploads to Supabase Storage | 2026-04-01 |
| Frontend framework | Next.js 14+ (App Router) — confirmed after alternatives review | 2026-04-01 |

---

## 11. Open Questions (Remaining)

1. **Supabase project:** Created yet? What region?
2. **Apple Developer account:** Available ($99/yr)?
3. **Google OAuth:** GCP project set up?
4. **WordPress access:** WP admin or REST API access for export?
5. **WhatsApp Business:** Meta Business account verified?
6. **Resend domain:** DNS access for verification records?
7. **Existing repo:** Already have a Next.js scaffold, or starting fresh?
8. **Council members:** Names/roles for About Us page — who provides this content?
9. **WYSIWYG editor:** Tiptap (recommended, open-source) vs React Quill vs alternatives?

---

## 12. Next Steps

1. **Review this design doc + schema doc** — confirm the feature set and table structures
2. **Resolve open questions** above (especially Supabase project + auth providers)
3. **Begin Phase 1** — layout shell, static pages, auth system
4. **Review after Phase 1** — demo on mobile/desktop, adjust before Phase 2

---

*This is a living document. Updated on 2026-04-01 with full feature set (v0.2).*
