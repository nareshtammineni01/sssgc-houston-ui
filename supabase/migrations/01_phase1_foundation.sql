-- ============================================================
-- SSSGC Houston — Phase 1: Foundation Tables
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. FAMILIES TABLE
-- Groups members into households (for Educare parent-child)
-- ============================================================
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Admins can create/update/delete families
CREATE POLICY "Admins can manage families" ON families
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 2. PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
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

-- Indexes
CREATE INDEX idx_profiles_family ON profiles(family_id);
CREATE INDEX idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (but cannot change their own role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

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


-- ============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- When a user signs up via Google/Apple/email, auto-create profile
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'given_name',
      ''
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 4. DAILY QUOTES TABLE
-- Rotating Sri Sathya Sai Baba quotes for the homepage
-- ============================================================
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

-- Everyone can read active quotes
CREATE POLICY "Anyone can view active quotes" ON daily_quotes
  FOR SELECT USING (is_active = true);

-- Admins can manage quotes
CREATE POLICY "Admins can manage quotes" ON daily_quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 5. SITE CONTENT TABLE
-- Editable static page content (About, Newcomer Guide, etc.)
-- Admins edit via WYSIWYG, no code changes needed
-- ============================================================
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

-- Everyone can read site content
CREATE POLICY "Anyone can view site content" ON site_content
  FOR SELECT USING (true);

-- Admins can update site content
CREATE POLICY "Admins can manage site content" ON site_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 6. SEED: Initial site content pages
-- Pre-populate with placeholder content for all static pages
-- ============================================================
INSERT INTO site_content (page_key, title, body, meta_description) VALUES
  ('about', 'About Us', '<p>The Sri Sathya Sai Center at Houston is a 501(c)(3) non-profit organization inspired by the teachings of Sri Sathya Sai Baba. We are a non-denominational, spiritual and service-oriented community affiliated with Sri Sathya Sai Global Council.</p>', 'About Sri Sathya Sai Center at Houston - a spiritual community in Katy, TX'),
  ('new-here', 'I''m New Here', '<p>Welcome! We are glad you found us. Our center meets at Kids R Kids Learning Academy, 4515 FM 1463, Katy, TX 77494. All activities are free and open to everyone.</p>', 'New to Sri Sathya Sai Center Houston? Here is what to expect.'),
  ('devotion', 'Devotion', '<p>Weekly bhajan sessions, study circles, multi-faith prayer sessions, and Vedam chanting. We congregate for about 3 hours weekly for devotional activities.</p>', 'Devotion activities at Sri Sathya Sai Center Houston'),
  ('educare', 'Educare', '<p>Sai Spiritual Education for children ages 5–18, offered in-person and remotely. Our curriculum is based on five human values: Truth, Righteousness, Peace, Love, and Nonviolence.</p>', 'Educare spiritual education for children at SSSGC Houston'),
  ('seva', 'Seva (Service)', '<p>Selfless service activities including food rescue and distribution, shelter support, organic garden, animal shelter service, school supplies donation, tutoring, and health camps.</p>', 'Seva service activities at Sri Sathya Sai Center Houston'),
  ('privacy', 'Privacy Policy', '<p>This privacy policy describes how Sri Sathya Sai Center at Houston collects, uses, and protects your personal information.</p>', 'Privacy Policy - SSSGC Houston'),
  ('terms', 'Terms of Service', '<p>By using this website, you agree to the following terms and conditions.</p>', 'Terms of Service - SSSGC Houston');


-- ============================================================
-- 7. SEED: A few starter daily quotes
-- ============================================================
INSERT INTO daily_quotes (quote_text, source) VALUES
  ('Love all, serve all.', 'Sri Sathya Sai Baba'),
  ('Help ever, hurt never.', 'Sri Sathya Sai Baba'),
  ('The end of education is character.', 'Sri Sathya Sai Baba'),
  ('Start the day with love, spend the day with love, fill the day with love, end the day with love. This is the way to God.', 'Sri Sathya Sai Baba'),
  ('Life is a song, sing it. Life is a game, play it. Life is a challenge, meet it. Life is a dream, realize it. Life is a sacrifice, offer it. Life is love, enjoy it.', 'Sri Sathya Sai Baba'),
  ('You must be a lotus, unfolding its petals when the sun rises in the sky, unaffected by the slush where it is born or even the water which sustains it!', 'Sri Sathya Sai Baba'),
  ('Before you speak, ask yourself: Is it kind? Is it necessary? Is it true? Does it improve on the silence?', 'Sri Sathya Sai Baba');


-- ============================================================
-- 8. HELPER: Get today's quote
-- Returns a specific quote if one is set for today,
-- otherwise picks from the rotation pool
-- ============================================================
CREATE OR REPLACE FUNCTION get_daily_quote()
RETURNS TABLE (id UUID, quote_text TEXT, source TEXT) AS $$
BEGIN
  -- First try: quote assigned to today's date
  RETURN QUERY
  SELECT dq.id, dq.quote_text, dq.source
  FROM daily_quotes dq
  WHERE dq.display_date = CURRENT_DATE AND dq.is_active = true
  LIMIT 1;

  -- If no specific quote found, pick from rotation (based on day of year)
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


-- ============================================================
-- DONE! Phase 1 tables are ready.
-- Next: Set up Auth providers (Google, Apple) in Supabase Dashboard
-- ============================================================
