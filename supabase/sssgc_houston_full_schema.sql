-- ============================================================
-- SSSGC Houston — Complete Database Schema (Unified)
--
-- This is the SINGLE source of truth for the entire database.
-- It combines all phases (1-5), storage, auth fields, and
-- includes all bug fixes (RLS recursion, search_path, etc.)
--
-- To set up a FRESH Supabase project, run this file once
-- in the Supabase SQL Editor.
--
-- Last updated: 2026-04-03
-- ============================================================


-- ████████████████████████████████████████████████████████████
-- SECTION 1: HELPER FUNCTIONS
-- These must be created FIRST — policies reference them.
-- ████████████████████████████████████████████████████████████

-- Admin check (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Super admin check
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get own role (avoids RLS recursion in UPDATE policies)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ████████████████████████████████████████████████████████████
-- SECTION 2: CORE TABLES (Phase 1)
-- Families, Profiles, Daily Quotes, Site Content
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- 2A. FAMILIES
-- Groups members into households
-- ------------------------------------------------------------
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_name TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY "Users can create family" ON families
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (
    id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY "Admins can view all families" ON families
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage families" ON families
  FOR ALL USING (public.is_admin());

-- Auto-generate invite codes
CREATE OR REPLACE FUNCTION generate_family_invite_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE code TEXT; exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'SSSGC-' || upper(substr(md5(random()::text), 1, 5));
    SELECT EXISTS(SELECT 1 FROM families WHERE invite_code = code) INTO exists_already;
    IF NOT exists_already THEN RETURN code; END IF;
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION set_family_invite_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN NEW.invite_code := generate_family_invite_code(); END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_set_family_invite_code BEFORE INSERT ON families
  FOR EACH ROW EXECUTE FUNCTION set_family_invite_code();

-- Family members (dependents without accounts)
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'child', 'parent', 'sibling', 'other')),
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', NULL)),
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family members" ON family_members
  FOR SELECT USING (family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Users can add family members" ON family_members
  FOR INSERT WITH CHECK (added_by = auth.uid() AND family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Users can update own family members" ON family_members
  FOR UPDATE USING (added_by = auth.uid());
CREATE POLICY "Users can delete own family members" ON family_members
  FOR DELETE USING (added_by = auth.uid());
CREATE POLICY "Admins can manage all family members" ON family_members
  FOR ALL USING (public.is_admin());

-- Family RPCs
CREATE OR REPLACE FUNCTION create_my_family(p_family_name TEXT) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_family_id UUID; v_invite_code TEXT; v_user_id UUID := auth.uid();
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND family_id IS NOT NULL) THEN
    RETURN json_build_object('error', 'You already belong to a family');
  END IF;
  INSERT INTO families (family_name, head_id) VALUES (p_family_name, v_user_id)
    RETURNING id, invite_code INTO v_family_id, v_invite_code;
  UPDATE profiles SET family_id = v_family_id, family_role = 'head', updated_at = now() WHERE id = v_user_id;
  RETURN json_build_object('family_id', v_family_id, 'invite_code', v_invite_code);
END; $$;

CREATE OR REPLACE FUNCTION join_family_by_code(p_invite_code TEXT) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_family_id UUID; v_user_id UUID := auth.uid();
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND family_id IS NOT NULL) THEN
    RETURN json_build_object('error', 'You already belong to a family. Leave your current family first.');
  END IF;
  SELECT id INTO v_family_id FROM families WHERE invite_code = upper(trim(p_invite_code));
  IF v_family_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid invite code. Please check and try again.');
  END IF;
  UPDATE profiles SET family_id = v_family_id, family_role = 'spouse', updated_at = now() WHERE id = v_user_id;
  RETURN json_build_object('family_id', v_family_id, 'success', true);
END; $$;

CREATE OR REPLACE FUNCTION leave_family() RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id UUID := auth.uid(); v_family_id UUID; v_family_role TEXT;
BEGIN
  SELECT family_id, family_role INTO v_family_id, v_family_role FROM profiles WHERE id = v_user_id;
  IF v_family_id IS NULL THEN RETURN json_build_object('error', 'You are not part of any family.'); END IF;
  UPDATE profiles SET family_id = NULL, family_role = NULL, updated_at = now() WHERE id = v_user_id;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE family_id = v_family_id) THEN
    DELETE FROM family_members WHERE family_id = v_family_id;
    DELETE FROM families WHERE id = v_family_id;
  ELSIF v_family_role = 'head' THEN
    UPDATE profiles SET family_role = 'head', updated_at = now()
      WHERE id = (SELECT id FROM profiles WHERE family_id = v_family_id LIMIT 1);
  END IF;
  RETURN json_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION admin_link_family(p_profile_id UUID, p_family_id UUID, p_role TEXT DEFAULT 'spouse') RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN json_build_object('error', 'Admin access required'); END IF;
  UPDATE profiles SET family_id = p_family_id, family_role = p_role, updated_at = now() WHERE id = p_profile_id;
  RETURN json_build_object('success', true);
END; $$;


-- ------------------------------------------------------------
-- 2B. PROFILES
-- Extends auth.users with app-specific fields
-- ------------------------------------------------------------
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  family_role TEXT CHECK (family_role IN ('head', 'spouse', 'child', 'other')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_family ON profiles(family_id);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = public.get_my_role()
  );

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Super admins can manage profiles" ON profiles
  FOR UPDATE USING (public.is_super_admin());

CREATE POLICY "Allow profile insert" ON profiles
  FOR INSERT WITH CHECK (true);


-- ------------------------------------------------------------
-- 2C. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- Captures all fields from signup metadata
-- SET search_path = public is REQUIRED for auth schema context
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first TEXT;
  v_last  TEXT;
  v_full  TEXT;
BEGIN
  v_first := COALESCE(
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'given_name',
    ''
  );
  v_last := COALESCE(
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'family_name',
    ''
  );
  v_full := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NULLIF(TRIM(v_first || ' ' || v_last), ''),
    ''
  );

  INSERT INTO public.profiles (
    id, first_name, last_name, full_name, email, phone,
    address1, address2, city, state, zip, avatar_url
  )
  VALUES (
    NEW.id,
    NULLIF(v_first, ''),
    NULLIF(v_last, ''),
    v_full,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'address1', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'address2', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'city', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'state', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'zip', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ------------------------------------------------------------
-- 2D. DAILY QUOTES
-- Rotating Sri Sathya Sai Baba quotes for the homepage
-- ------------------------------------------------------------
CREATE TABLE daily_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  source TEXT,
  display_date DATE,
  is_active BOOLEAN DEFAULT true,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quotes_date ON daily_quotes(display_date) WHERE display_date IS NOT NULL;

ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quotes" ON daily_quotes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quotes" ON daily_quotes
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 2E. SITE CONTENT
-- Editable static page content (About, Newcomer Guide, etc.)
-- ------------------------------------------------------------
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  meta_description TEXT,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content" ON site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site content" ON site_content
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 2F. GET DAILY QUOTE (RPC)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_daily_quote()
RETURNS TABLE (id UUID, quote_text TEXT, source TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT dq.id, dq.quote_text, dq.source
  FROM daily_quotes dq
  WHERE dq.display_date = CURRENT_DATE AND dq.is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT dq.id, dq.quote_text, dq.source
    FROM daily_quotes dq
    WHERE dq.display_date IS NULL AND dq.is_active = true
    ORDER BY dq.created_at
    OFFSET (EXTRACT(DOY FROM CURRENT_DATE)::int %
            (SELECT COUNT(*) FROM daily_quotes WHERE display_date IS NULL AND is_active = true))
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;


-- ████████████████████████████████████████████████████████████
-- SECTION 3: ANNOUNCEMENTS & NOTIFICATIONS (Phase 2)
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- 3A. ANNOUNCEMENTS
-- Rich text (HTML) announcements with categories and pinning
-- ------------------------------------------------------------
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  body_plain TEXT,
  category TEXT NOT NULL CHECK (category IN ('devotion', 'educare', 'seva', 'general')),
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notify_email BOOLEAN DEFAULT false,
  notify_whatsapp BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcements_feed ON announcements(is_pinned DESC, published_at DESC);
CREATE INDEX idx_announcements_category ON announcements(category);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements" ON announcements
  FOR SELECT USING (published_at <= now());

CREATE POLICY "Admins can create announcements" ON announcements
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update own announcements" ON announcements
  FOR UPDATE USING (author_id = auth.uid() AND public.is_admin());

CREATE POLICY "Admins can delete own announcements" ON announcements
  FOR DELETE USING (author_id = auth.uid() AND public.is_admin());

CREATE POLICY "Super admins manage all announcements" ON announcements
  FOR ALL USING (public.is_super_admin());


-- ------------------------------------------------------------
-- 3B. AUTO-STRIP HTML TO PLAIN TEXT (Trigger)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION strip_html_to_plain()
RETURNS TRIGGER AS $$
BEGIN
  NEW.body_plain := regexp_replace(NEW.body, '<[^>]+>', '', 'g');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_strip_html
  BEFORE INSERT OR UPDATE OF body ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION strip_html_to_plain();


-- ------------------------------------------------------------
-- 3C. NOTIFICATION PREFERENCES
-- Per-member settings: which categories + which channels
-- ------------------------------------------------------------
CREATE TABLE notification_preferences (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  devotion BOOLEAN DEFAULT true,
  educare BOOLEAN DEFAULT true,
  seva BOOLEAN DEFAULT true,
  general BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all preferences" ON notification_preferences
  FOR SELECT USING (public.is_admin());


-- ------------------------------------------------------------
-- 3D. AUTO-CREATE NOTIFICATION PREFERENCES ON PROFILE INSERT
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_default_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_add_notif_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_prefs();


-- ------------------------------------------------------------
-- 3E. NOTIFICATION LOG
-- Audit trail: every email/WhatsApp sent
-- ------------------------------------------------------------
CREATE TABLE notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('announcement', 'event_reminder', 'welcome')),
  reference_id UUID,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_dedup ON notification_log(recipient_id, reference_type, reference_id);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification log" ON notification_log
  FOR SELECT USING (public.is_admin());


-- ------------------------------------------------------------
-- 3F. ENABLE REAL-TIME for announcements (live ticker)
-- ------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;


-- ████████████████████████████████████████████████████████████
-- SECTION 4: RESOURCE LIBRARY (Phase 3)
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- 4A. RESOURCES
-- Bhajans, Prayers, Study Circle, Documents
-- ------------------------------------------------------------
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('bhajan', 'prayer', 'study_circle', 'document', 'bhajan_resource')),
  keywords TEXT[],
  deity TEXT,
  file_url TEXT,
  audio_url TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  fts TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(content, '') || ' ' ||
      COALESCE(deity, '')
    )
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resources_search ON resources USING GIN (fts);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_deity ON resources(deity) WHERE deity IS NOT NULL;

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage resources" ON resources
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 4B. FAVORITES
-- Users can bookmark/star resources
-- ------------------------------------------------------------
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, resource_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (user_id = auth.uid());


-- ------------------------------------------------------------
-- 4C. SEARCH & VIEW COUNT RPCs
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_resources(search_query TEXT)
RETURNS SETOF resources AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM resources
  WHERE fts @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(fts, plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION increment_view_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- ████████████████████████████████████████████████████████████
-- SECTION 5: CALENDAR, EVENTS & VOLUNTEERS (Phase 4)
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- 5A. EVENTS
-- Supports recurring (RRULE) + one-off + override/cancel
-- ------------------------------------------------------------
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('devotion', 'educare', 'seva', 'festival')),
  location TEXT DEFAULT '4515 FM 1463, Katy, TX 77494',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  max_capacity INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  rrule TEXT,
  recurring_parent_id UUID REFERENCES events(id) ON DELETE CASCADE,
  occurrence_date DATE,
  is_cancelled BOOLEAN DEFAULT false,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_start ON events(start_time);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_parent ON events(recurring_parent_id) WHERE recurring_parent_id IS NOT NULL;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (is_cancelled = false);

CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 5B. EVENT SIGNUPS (RSVP)
-- ------------------------------------------------------------
CREATE TABLE event_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  attended BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_signups_event ON event_signups(event_id);
CREATE INDEX idx_signups_user ON event_signups(user_id);

ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signups" ON event_signups
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own signups" ON event_signups
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all signups" ON event_signups
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update signups" ON event_signups
  FOR UPDATE USING (public.is_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE event_signups;


-- ------------------------------------------------------------
-- 5C. EDUCARE ENROLLMENTS
-- Child class registration
-- ------------------------------------------------------------
CREATE TABLE educare_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('group_1_5_9', 'group_2_10_13', 'group_3_14_18')),
  academic_year TEXT NOT NULL,
  enrollment_mode TEXT DEFAULT 'in_person' CHECK (enrollment_mode IN ('in_person', 'remote')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'waitlisted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_educare_parent ON educare_enrollments(parent_id);
CREATE INDEX idx_educare_group ON educare_enrollments(age_group, academic_year);

ALTER TABLE educare_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own enrollments" ON educare_enrollments
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can enroll children" ON educare_enrollments
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Admins can manage enrollments" ON educare_enrollments
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 5D. VOLUNTEER SIGNUPS
-- Seva project registrations
-- ------------------------------------------------------------
CREATE TABLE volunteer_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_volunteer_user ON volunteer_signups(user_id);

ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own volunteer signups" ON volunteer_signups
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all volunteer signups" ON volunteer_signups
  FOR SELECT USING (public.is_admin());


-- ████████████████████████████████████████████████████████████
-- SECTION 6: GALLERY & COMMUNITY (Phase 5)
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- 6A. GALLERY ALBUMS
-- ------------------------------------------------------------
CREATE TABLE gallery_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT CHECK (category IN ('devotion', 'educare', 'seva', 'festival', 'general')),
  event_date DATE,
  is_published BOOLEAN DEFAULT true,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_albums_date ON gallery_albums(event_date DESC);

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published albums" ON gallery_albums
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage albums" ON gallery_albums
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 6B. GALLERY PHOTOS
-- ------------------------------------------------------------
CREATE TABLE gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_album ON gallery_photos(album_id, sort_order);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos in published albums" ON gallery_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gallery_albums WHERE id = album_id AND is_published = true)
  );

CREATE POLICY "Admins can manage photos" ON gallery_photos
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 6C. VOLUNTEER HOURS
-- Logged seva hours per member
-- ------------------------------------------------------------
CREATE TABLE volunteer_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  service_date DATE NOT NULL,
  description TEXT,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hours_user ON volunteer_hours(user_id, service_date);
CREATE INDEX idx_hours_pending ON volunteer_hours(status) WHERE status = 'pending';

ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own hours" ON volunteer_hours
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all hours" ON volunteer_hours
  FOR ALL USING (public.is_admin());


-- ------------------------------------------------------------
-- 6D. MEMBER DIRECTORY SETTINGS
-- Privacy controls for opt-in member directory
-- ------------------------------------------------------------
CREATE TABLE member_directory_settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  show_in_directory BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_email BOOLEAN DEFAULT false,
  show_city BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE member_directory_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own directory settings" ON member_directory_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Members can view opted-in entries" ON member_directory_settings
  FOR SELECT USING (show_in_directory = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all directory settings" ON member_directory_settings
  FOR SELECT USING (public.is_admin());


-- ------------------------------------------------------------
-- 6E. AUTO-CREATE DIRECTORY SETTINGS ON PROFILE INSERT
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_default_directory_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.member_directory_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_add_directory_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_directory_settings();


-- ████████████████████████████████████████████████████████████
-- SECTION 7: STORAGE BUCKETS
-- ████████████████████████████████████████████████████████████

INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Resources bucket: public read, admin write
CREATE POLICY "Public can read resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resources' AND public.is_admin());

CREATE POLICY "Admins can update resources files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resources' AND public.is_admin());

CREATE POLICY "Admins can delete resources files" ON storage.objects
  FOR DELETE USING (bucket_id = 'resources' AND public.is_admin());

-- Announcements bucket: public read, admin write
CREATE POLICY "Public can read announcement images" ON storage.objects
  FOR SELECT USING (bucket_id = 'announcements');

CREATE POLICY "Admins can upload announcement images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'announcements' AND public.is_admin());

CREATE POLICY "Admins can delete announcement images" ON storage.objects
  FOR DELETE USING (bucket_id = 'announcements' AND public.is_admin());

-- Gallery bucket: public read, admin write
CREATE POLICY "Public can view gallery photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

CREATE POLICY "Admins can delete gallery photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND public.is_admin());

-- Avatars bucket: public read, owner write
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );


-- ████████████████████████████████████████████████████████████
-- SECTION 8: SEED DATA
-- ████████████████████████████████████████████████████████████

-- ------------------------------------------------------------
-- 8A. Site content pages
-- ------------------------------------------------------------
INSERT INTO site_content (page_key, title, body, meta_description) VALUES
  ('about', 'About Us', '<p>The Sri Sathya Sai Center at Houston is a 501(c)(3) non-profit organization inspired by the teachings of Sri Sathya Sai Baba. We are a non-denominational, spiritual and service-oriented community affiliated with Sri Sathya Sai Global Council.</p>', 'About Sri Sathya Sai Center at Houston - a spiritual community in Katy, TX'),
  ('new-here', 'I''m New Here', '<p>Welcome! We are glad you found us. Our center meets at Kids R Kids Learning Academy, 4515 FM 1463, Katy, TX 77494. All activities are free and open to everyone.</p>', 'New to Sri Sathya Sai Center Houston? Here is what to expect.'),
  ('devotion', 'Devotion', '<p>Weekly bhajan sessions, study circles, multi-faith prayer sessions, and Vedam chanting. We congregate for about 3 hours weekly for devotional activities.</p>', 'Devotion activities at Sri Sathya Sai Center Houston'),
  ('educare', 'Educare', '<p>Sai Spiritual Education for children ages 5–18, offered in-person and remotely. Our curriculum is based on five human values: Truth, Righteousness, Peace, Love, and Nonviolence.</p>', 'Educare spiritual education for children at SSSGC Houston'),
  ('seva', 'Seva (Service)', '<p>Selfless service activities including food rescue and distribution, shelter support, organic garden, animal shelter service, school supplies donation, tutoring, and health camps.</p>', 'Seva service activities at Sri Sathya Sai Center Houston'),
  ('privacy', 'Privacy Policy', '<p>This privacy policy describes how Sri Sathya Sai Center at Houston collects, uses, and protects your personal information.</p>', 'Privacy Policy - SSSGC Houston'),
  ('terms', 'Terms of Service', '<p>By using this website, you agree to the following terms and conditions.</p>', 'Terms of Service - SSSGC Houston');

-- ------------------------------------------------------------
-- 8B. Daily quotes
-- ------------------------------------------------------------
INSERT INTO daily_quotes (quote_text, source) VALUES
  ('Love all, serve all.', 'Sri Sathya Sai Baba'),
  ('Help ever, hurt never.', 'Sri Sathya Sai Baba'),
  ('The end of education is character.', 'Sri Sathya Sai Baba'),
  ('Start the day with love, spend the day with love, fill the day with love, end the day with love. This is the way to God.', 'Sri Sathya Sai Baba'),
  ('Life is a song, sing it. Life is a game, play it. Life is a challenge, meet it. Life is a dream, realize it. Life is a sacrifice, offer it. Life is love, enjoy it.', 'Sri Sathya Sai Baba'),
  ('You must be a lotus, unfolding its petals when the sun rises in the sky, unaffected by the slush where it is born or even the water which sustains it!', 'Sri Sathya Sai Baba'),
  ('Before you speak, ask yourself: Is it kind? Is it necessary? Is it true? Does it improve on the silence?', 'Sri Sathya Sai Baba');


-- ████████████████████████████████████████████████████████████
-- DONE! Complete SSSGC Houston database is ready.
--
-- Next steps:
-- 1. Configure Auth providers in Supabase Dashboard
-- 2. Set environment variables in Vercel
-- 3. Deploy the Next.js app
-- ████████████████████████████████████████████████████████████
