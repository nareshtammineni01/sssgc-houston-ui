# SSSGC Houston — Supabase Schema Design (DRAFT)

**Status:** DRAFT v2 — Enhanced with full feature set
**Date:** April 1, 2026
**Version:** 0.2

---

## 1. Overview

This document defines the complete Supabase database schema for SSSGC Houston, including tables, Row-Level Security (RLS) policies, indexes, storage buckets, and Edge Function triggers. The schema supports:

- Family-grouped member profiles with roles
- Recurring + manually created events with RSVP
- Rich text (WYSIWYG HTML) announcements with email/WhatsApp notifications
- 722+ searchable bhajans/prayers/resources with favorites
- Admin management with role-based access
- Photo/video gallery with albums
- Daily quotes rotation
- Notification preferences per member
- Educare class enrollment
- Volunteer signup and hours tracking
- Member directory with privacy controls
- Editable static page content

---

## 2. Tables

### 2.1 `families`

Groups members into households. Useful for Educare (parent-child relationships) and family-level communications.

```sql
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_name TEXT NOT NULL,              -- e.g. "Tammineni Family"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 2.2 `profiles` (extends `auth.users`)

Every authenticated user gets a profile. Linked optionally to a family.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,                              -- denormalized from auth.users for convenience
  phone TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  family_role TEXT CHECK (family_role IN ('head', 'spouse', 'child', 'other')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for family lookups
CREATE INDEX idx_profiles_family ON profiles(family_id);

-- Index for role-based queries (admin dashboard)
CREATE INDEX idx_profiles_role ON profiles(role);
```

**Notes:**
- `role` controls access: `member` (default), `admin` (can post/manage), `super_admin` (can manage admins)
- `family_id` is optional — members can exist without a family
- `family_role` clarifies relationship within the family (helpful for Educare enrollment)
- `email` is denormalized from `auth.users` for easier queries (populated via trigger)

---

### 2.3 `announcements`

Admin-posted announcements with rich text (HTML from WYSIWYG editor) and notification tracking.

```sql
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,                      -- HTML content from WYSIWYG editor
  body_plain TEXT,                         -- Plain text version (auto-stripped for WhatsApp/email fallback)
  category TEXT NOT NULL CHECK (category IN ('devotion', 'educare', 'seva', 'general')),
  is_pinned BOOLEAN DEFAULT false,         -- Sticky at top of feed
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notify_email BOOLEAN DEFAULT false,      -- Whether email notification was triggered
  notify_whatsapp BOOLEAN DEFAULT false,   -- Whether WhatsApp notification was triggered
  published_at TIMESTAMPTZ DEFAULT now(),  -- When it goes live (allows scheduling)
  expires_at TIMESTAMPTZ,                  -- Optional: auto-archive after this date
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for feed queries (newest first, pinned first)
CREATE INDEX idx_announcements_feed ON announcements(is_pinned DESC, published_at DESC);

-- Index for category filtering
CREATE INDEX idx_announcements_category ON announcements(category);
```

**Notes:**
- `body` stores HTML from the WYSIWYG editor (e.g., Tiptap or React Quill)
- `body_plain` is auto-generated via a trigger or Edge Function — strips HTML tags for WhatsApp messages and email plain-text fallback
- `is_pinned` keeps important announcements at the top
- `expires_at` allows auto-hiding old announcements without deleting them
- `published_at` enables future scheduling (admin can draft now, publish later)

---

### 2.4 `resources`

All bhajans (722), prayers (48), study circle materials (12), and uploaded documents.

```sql
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,                            -- Lyrics, text content
  category TEXT NOT NULL CHECK (category IN ('bhajan', 'prayer', 'study_circle', 'document', 'bhajan_resource')),
  keywords TEXT[],                         -- Array of search keywords
  deity TEXT,                              -- Optional: for bhajan filtering (e.g., 'Ganesha', 'Sai Baba')
  file_url TEXT,                           -- Supabase Storage URL for PDFs/audio
  audio_url TEXT,                          -- Separate field for audio embeds
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,            -- For popularity sorting
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index (Postgres GIN)
CREATE INDEX idx_resources_search ON resources
  USING GIN (
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(content, '') || ' ' ||
      COALESCE(array_to_string(keywords, ' '), '') || ' ' ||
      COALESCE(deity, '')
    )
  );

-- Index for category filtering
CREATE INDEX idx_resources_category ON resources(category);

-- Index for deity filtering
CREATE INDEX idx_resources_deity ON resources(deity) WHERE deity IS NOT NULL;
```

**Notes:**
- `audio_url` is separate from `file_url` so a bhajan can have both lyrics (content) + audio + PDF
- `view_count` enables "Most Popular" sorting — incremented via RPC function to avoid race conditions
- Full-text search covers title, content, keywords, and deity in one GIN index
- `keywords` as TEXT[] allows flexible tagging without a separate tags table

---

### 2.5 `favorites`

Logged-in users can bookmark/star resources.

```sql
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, resource_id)
);

-- Index for "my favorites" query
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

---

### 2.6 `events`

Supports both recurring events (weekly bhajan) and one-off events. Recurring events use an RRULE string; individual occurrences can be overridden or deleted.

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('devotion', 'educare', 'seva', 'festival')),
  location TEXT DEFAULT '4515 FM 1463, Katy, TX 77494',  -- Default center address
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  max_capacity INTEGER,                    -- Optional: NULL = unlimited

  -- Recurrence fields
  is_recurring BOOLEAN DEFAULT false,
  rrule TEXT,                              -- RFC 5545 RRULE string, e.g. 'FREQ=WEEKLY;BYDAY=SA'
  recurring_parent_id UUID REFERENCES events(id) ON DELETE CASCADE,
  occurrence_date DATE,                    -- Which occurrence this overrides (NULL for parent/one-off)
  is_cancelled BOOLEAN DEFAULT false,      -- Soft-cancel a single occurrence

  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for calendar queries (date range)
CREATE INDEX idx_events_start ON events(start_time);

-- Index for category filtering
CREATE INDEX idx_events_category ON events(category);

-- Index for recurring event lookups
CREATE INDEX idx_events_parent ON events(recurring_parent_id) WHERE recurring_parent_id IS NOT NULL;
```

**How recurrence works:**

1. **Recurring parent:** Admin creates a "Weekly Bhajan" event with `is_recurring = true` and `rrule = 'FREQ=WEEKLY;BYDAY=SA;DTSTART=20260404T160000Z'`. This row has no `occurrence_date`.

2. **Generate occurrences:** The frontend/API expands the RRULE into individual dates for the calendar view (using a library like `rrule.js`). No rows are created for normal occurrences.

3. **Override one instance:** If Saturday April 11 needs a different time or description, admin creates a new event row with `recurring_parent_id` pointing to the parent and `occurrence_date = '2026-04-11'`. The calendar renders this override instead of the generated one.

4. **Cancel one instance:** Same as override, but with `is_cancelled = true`. Calendar skips that date.

5. **Manual one-off:** Any event with `is_recurring = false` and no `recurring_parent_id` is a standalone event.

---

### 2.7 `event_signups`

RSVP tracking. Replaces Google Forms for event registration.

```sql
CREATE TABLE event_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  attended BOOLEAN,                        -- Post-event: admin marks attendance
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (event_id, user_id)               -- One signup per user per event
);

-- Index for event attendee list
CREATE INDEX idx_signups_event ON event_signups(event_id);

-- Index for "my events" query
CREATE INDEX idx_signups_user ON event_signups(user_id);
```

**Notes:**
- `status` supports waitlisting when `max_capacity` is reached
- `attended` allows admins to track actual attendance post-event
- Unique constraint prevents duplicate signups

---

### 2.8 `notification_log`

Tracks sent notifications for auditing and preventing duplicates.

```sql
CREATE TABLE notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('announcement', 'event_reminder', 'welcome')),
  reference_id UUID,                       -- ID of the announcement or event
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,                      -- If failed, store the reason
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Index for checking "did we already notify this user about this item?"
CREATE INDEX idx_notification_dedup ON notification_log(recipient_id, reference_type, reference_id);
```

---

### 2.9 `notification_preferences`

Per-member notification settings. Members choose which categories and channels they want.

```sql
CREATE TABLE notification_preferences (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  devotion BOOLEAN DEFAULT true,          -- Receive devotion updates
  educare BOOLEAN DEFAULT true,           -- Receive educare updates
  seva BOOLEAN DEFAULT true,              -- Receive seva updates
  general BOOLEAN DEFAULT true,           -- Receive general announcements
  event_reminders BOOLEAN DEFAULT true,   -- Receive event reminders (24hr before)
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Notes:**
- Created automatically when a user registers (via trigger on profiles insert)
- Members manage this from their Settings page
- Notification system checks these preferences before sending

---

### 2.10 `daily_quotes`

Rotating Sri Sathya Sai Baba quotes displayed on the homepage.

```sql
CREATE TABLE daily_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,               -- The quote itself
  source TEXT,                            -- e.g. "Sathya Sai Speaks Vol. 1" or "Discourse, 1968"
  display_date DATE,                      -- Specific date to show (NULL = in rotation pool)
  is_active BOOLEAN DEFAULT true,         -- Can be deactivated without deleting
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for today's quote lookup
CREATE INDEX idx_quotes_date ON daily_quotes(display_date) WHERE display_date IS NOT NULL;
```

**How it works:**
- If a quote has `display_date = today`, show that one
- Otherwise, pick from the active rotation pool (round-robin by created_at or random)
- Admin manages quotes from `/admin/quotes`

---

### 2.11 `site_content`

Editable static page content. Admins can update About Us, Newcomer's Guide, etc. without code changes.

```sql
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,           -- e.g. 'about', 'new-here', 'devotion', 'educare', 'seva', 'privacy', 'terms'
  title TEXT NOT NULL,
  body TEXT NOT NULL,                      -- HTML from WYSIWYG editor
  meta_description TEXT,                   -- For SEO
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Notes:**
- One row per page. `page_key` is used in code to fetch the right content
- Admin edits via WYSIWYG on the admin panel — no code touching needed
- Seeded with initial content during setup

---

### 2.12 `gallery_albums`

Photo/video album containers.

```sql
CREATE TABLE gallery_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,                     -- e.g. "Diwali Celebrations 2025"
  description TEXT,
  cover_image_url TEXT,                    -- URL of the cover photo
  category TEXT CHECK (category IN ('devotion', 'educare', 'seva', 'festival', 'general')),
  event_date DATE,                         -- When the event/occasion happened
  is_published BOOLEAN DEFAULT true,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for gallery page (newest first)
CREATE INDEX idx_albums_date ON gallery_albums(event_date DESC);
```

---

### 2.13 `gallery_photos`

Individual photos within albums.

```sql
CREATE TABLE gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,                 -- Supabase Storage URL
  thumbnail_url TEXT,                      -- Smaller version for grid view
  caption TEXT,
  sort_order INTEGER DEFAULT 0,            -- For manual ordering within album
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for album photo listing
CREATE INDEX idx_photos_album ON gallery_photos(album_id, sort_order);
```

---

### 2.14 `educare_enrollments`

Children enrolled in Educare (Sai Spiritual Education) classes. Links parent → child → age group.

```sql
CREATE TABLE educare_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('group_1_5_9', 'group_2_10_13', 'group_3_14_18')),
  academic_year TEXT NOT NULL,              -- e.g. '2026-2027'
  enrollment_mode TEXT DEFAULT 'in_person' CHECK (enrollment_mode IN ('in_person', 'remote')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'waitlisted')),
  notes TEXT,                              -- Allergies, special needs, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for parent's children
CREATE INDEX idx_educare_parent ON educare_enrollments(parent_id);

-- Index for class lists by age group
CREATE INDEX idx_educare_group ON educare_enrollments(age_group, academic_year);
```

---

### 2.15 `volunteer_signups`

Members signing up for specific Seva (service) projects.

```sql
CREATE TABLE volunteer_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,              -- e.g. 'Food Rescue', 'Shelter Support', 'Organic Garden'
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,  -- Optional: linked to a specific event
  status TEXT DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user's volunteer history
CREATE INDEX idx_volunteer_user ON volunteer_signups(user_id);
```

---

### 2.16 `volunteer_hours`

Logged seva hours per member. Useful for youth needing community service credits.

```sql
CREATE TABLE volunteer_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,             -- e.g. 2.50 hours
  service_date DATE NOT NULL,
  description TEXT,                        -- What was done
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user's hours summary
CREATE INDEX idx_hours_user ON volunteer_hours(user_id, service_date);

-- Index for admin approval queue
CREATE INDEX idx_hours_pending ON volunteer_hours(status) WHERE status = 'pending';
```

---

### 2.17 `member_directory_settings`

Privacy controls for the opt-in member directory.

```sql
CREATE TABLE member_directory_settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  show_in_directory BOOLEAN DEFAULT false, -- Opt-in: not visible by default
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  show_city BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Database Functions (RPCs)

### 3.1 Search resources (full-text)

```sql
CREATE OR REPLACE FUNCTION search_resources(search_query TEXT)
RETURNS SETOF resources AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM resources
  WHERE to_tsvector('english',
    COALESCE(title, '') || ' ' ||
    COALESCE(content, '') || ' ' ||
    COALESCE(array_to_string(keywords, ' '), '') || ' ' ||
    COALESCE(deity, '')
  ) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(content, '') || ' ' ||
      COALESCE(array_to_string(keywords, ' '), '') || ' ' ||
      COALESCE(deity, '')
    ),
    plainto_tsquery('english', search_query)
  ) DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 3.2 Increment resource view count (avoids race conditions)

```sql
CREATE OR REPLACE FUNCTION increment_view_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql VOLATILE;
```

### 3.3 Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: runs after every new signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 3.4 Auto-strip HTML for plain text (announcements)

```sql
CREATE OR REPLACE FUNCTION strip_html_to_plain()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic HTML tag stripping for WhatsApp/email plain text fallback
  NEW.body_plain := regexp_replace(NEW.body, '<[^>]+>', '', 'g');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_strip_html
  BEFORE INSERT OR UPDATE OF body ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION strip_html_to_plain();
```

---

## 4. Row-Level Security (RLS) Policies

RLS is the authorization layer. Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and explicit policies.

### 4.1 `families`

```sql
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Members can view their own family
CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Admins can view all families
CREATE POLICY "Admins can view all families" ON families
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admins can create/update families
CREATE POLICY "Admins can manage families" ON families
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.2 `profiles`

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Super admins can update any profile (including role changes)
CREATE POLICY "Super admins can manage profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
```

### 4.3 `announcements`

```sql
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone (including anonymous) can read published announcements
CREATE POLICY "Anyone can view announcements" ON announcements
  FOR SELECT USING (published_at <= now());

-- Admins can create announcements
CREATE POLICY "Admins can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admins can update/delete their own announcements
CREATE POLICY "Admins can manage own announcements" ON announcements
  FOR ALL USING (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Super admins can manage any announcement
CREATE POLICY "Super admins can manage all announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
```

### 4.4 `resources`

```sql
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Everyone (including anonymous) can read resources
CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

-- Admins can create/update/delete resources
CREATE POLICY "Admins can manage resources" ON resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.5 `favorites`

```sql
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (user_id = auth.uid());

-- Users can add/remove their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (user_id = auth.uid());
```

### 4.6 `events`

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Everyone can view non-cancelled events
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (is_cancelled = false);

-- Admins can manage all events
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.7 `event_signups`

```sql
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;

-- Users can view their own signups
CREATE POLICY "Users can view own signups" ON event_signups
  FOR SELECT USING (user_id = auth.uid());

-- Users can signup/cancel themselves
CREATE POLICY "Users can manage own signups" ON event_signups
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all signups (attendee lists)
CREATE POLICY "Admins can view all signups" ON event_signups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admins can update attendance
CREATE POLICY "Admins can update signups" ON event_signups
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.8 `notification_log`

```sql
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view notification logs
CREATE POLICY "Admins can view notification log" ON notification_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Service role only for inserts (via API routes / Edge Functions)
-- No user-facing insert policy needed
```

### 4.9 `notification_preferences`

```sql
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own preferences
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all preferences (for notification targeting)
CREATE POLICY "Admins can view all preferences" ON notification_preferences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.10 `daily_quotes`

```sql
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- Everyone can read active quotes
CREATE POLICY "Anyone can view active quotes" ON daily_quotes
  FOR SELECT USING (is_active = true);

-- Admins can manage quotes
CREATE POLICY "Admins can manage quotes" ON daily_quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.11 `site_content`

```sql
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read site content (public pages)
CREATE POLICY "Anyone can view site content" ON site_content
  FOR SELECT USING (true);

-- Admins can update site content
CREATE POLICY "Admins can manage site content" ON site_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.12 `gallery_albums` + `gallery_photos`

```sql
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Everyone can view published albums and their photos
CREATE POLICY "Anyone can view published albums" ON gallery_albums
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view photos in published albums" ON gallery_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gallery_albums WHERE id = album_id AND is_published = true)
  );

-- Admins can manage albums and photos
CREATE POLICY "Admins can manage albums" ON gallery_albums
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage photos" ON gallery_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.13 `educare_enrollments`

```sql
ALTER TABLE educare_enrollments ENABLE ROW LEVEL SECURITY;

-- Parents can view their own children's enrollments
CREATE POLICY "Parents can view own enrollments" ON educare_enrollments
  FOR SELECT USING (parent_id = auth.uid());

-- Parents can create enrollments for their children
CREATE POLICY "Parents can enroll children" ON educare_enrollments
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- Admins can view/manage all enrollments
CREATE POLICY "Admins can manage enrollments" ON educare_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.14 `volunteer_signups` + `volunteer_hours`

```sql
ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own signups and hours
CREATE POLICY "Users can manage own volunteer signups" ON volunteer_signups
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own hours" ON volunteer_hours
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all signups and approve hours
CREATE POLICY "Admins can view all volunteer signups" ON volunteer_signups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage all hours" ON volunteer_hours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

### 4.15 `member_directory_settings`

```sql
ALTER TABLE member_directory_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own directory settings
CREATE POLICY "Users can manage own directory settings" ON member_directory_settings
  FOR ALL USING (user_id = auth.uid());

-- Logged-in members can view directory entries of those who opted in
CREATE POLICY "Members can view opted-in directory entries" ON member_directory_settings
  FOR SELECT USING (
    show_in_directory = true AND auth.uid() IS NOT NULL
  );
```

---

## 5. Storage Buckets

Supabase Storage for file uploads (PDFs, audio, images, photos).

```
Buckets:
├── resources/               -- Bhajan PDFs, audio files, documents
│   ├── bhajans/
│   ├── prayers/
│   └── documents/
├── announcements/           -- Images embedded in WYSIWYG announcements
├── gallery/                 -- Photo gallery images
│   ├── albums/{album_id}/   -- Full-size photos per album
│   └── thumbnails/{album_id}/ -- Auto-generated thumbnails
├── avatars/                 -- User profile pictures
│   └── {user_id}/
```

### Bucket policies

```sql
-- resources bucket: public read, admin write
CREATE POLICY "Public can read resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resources' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- announcements bucket: public read, admin write
CREATE POLICY "Public can read announcement images" ON storage.objects
  FOR SELECT USING (bucket_id = 'announcements');

CREATE POLICY "Admins can upload announcement images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'announcements' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- gallery bucket: public read, admin write
CREATE POLICY "Public can view gallery photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- avatars bucket: public read, owner write
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 6. Supabase Real-time

Enable real-time subscriptions for live features:

```sql
-- Enable real-time on announcements (for live news ticker)
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- Enable real-time on event_signups (for live RSVP count)
ALTER PUBLICATION supabase_realtime ADD TABLE event_signups;
```

---

## 7. Edge Functions (Outline)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-email` | Called from `/api/notify` | Sends email via Resend API, respects notification_preferences |
| `send-whatsapp` | Called from `/api/notify` | Sends WhatsApp via Meta Cloud API, respects notification_preferences |
| `event-reminders` | Cron (daily at 8am CST) | Checks events starting in 24hrs, sends reminders to opted-in members |
| `strip-html` | DB trigger on announcements | Already handled via PL/pgSQL trigger above |
| `rotate-daily-quote` | Cron (daily at midnight CST) | Selects next quote for the day if no specific display_date is set |

---

## 8. API Routes (Next.js)

These are the custom API endpoints — everything else uses direct Supabase client queries.

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/search` | GET | Full-text search via `search_resources()` RPC | Public |
| `/api/notify` | POST | Trigger email + WhatsApp for an announcement | Admin only |
| `/api/events/expand` | GET | Expand RRULE into event instances for date range | Public |
| `/api/resources/view` | POST | Increment view count via RPC | Public |
| `/api/contact` | POST | Contact form submission (sends email via Resend) | Public |
| `/api/gallery/upload` | POST | Bulk photo upload with thumbnail generation | Admin only |

---

## 9. Entity Relationship Summary

```
families         1───* profiles
profiles         1───1 notification_preferences
profiles         1───1 member_directory_settings
profiles         1───* announcements (author)
profiles         1───* resources (author)
profiles         1───* events (author)
profiles         *───* resources (via favorites)
profiles         *───* events (via event_signups)
profiles         1───* educare_enrollments (parent)
profiles         1───* volunteer_signups
profiles         1───* volunteer_hours
events           1───* events (recurring_parent → overrides)
events           1───* event_signups
events           0───* volunteer_signups
gallery_albums   1───* gallery_photos
announcements    ───> notification_log
events           ───> notification_log
```

---

## 10. Table Summary (All 17 Tables)

| # | Table | Phase | Purpose |
|---|-------|-------|---------|
| 1 | `families` | 1 | Household grouping |
| 2 | `profiles` | 1 | Member profiles |
| 3 | `daily_quotes` | 1 | Homepage rotating quotes |
| 4 | `site_content` | 1 | Editable static page content |
| 5 | `announcements` | 2 | Rich text announcements |
| 6 | `notification_preferences` | 2 | Per-member notification settings |
| 7 | `notification_log` | 2 | Sent notification audit trail |
| 8 | `resources` | 3 | Bhajans, prayers, documents |
| 9 | `favorites` | 3 | User bookmarks |
| 10 | `events` | 4 | Recurring + one-off events |
| 11 | `event_signups` | 4 | RSVP with waitlist + attendance |
| 12 | `educare_enrollments` | 4 | Child class registration |
| 13 | `volunteer_signups` | 4 | Seva project signups |
| 14 | `gallery_albums` | 5 | Photo albums |
| 15 | `gallery_photos` | 5 | Individual photos |
| 16 | `volunteer_hours` | 5 | Logged seva hours |
| 17 | `member_directory_settings` | 5 | Privacy controls for directory |

---

## 11. Open Items / Future Considerations

- **Audit log** — Track admin actions (who posted what, when)
- **Content versioning** — Edit history for resources or announcements
- **Multi-center support** — `center_id` foreign key on events/announcements for scaling to other cities
- **Donation tracking** — If online donations are added later
- **Push notifications** — Web push via service workers (PWA)
- **Educare teacher management** — Teachers table with class assignments
- **Analytics events** — Track page views, popular resources, engagement metrics

---

*This schema is a draft (v0.2). Review the table structures, RLS policies, and recurrence approach before we apply anything to Supabase.*
