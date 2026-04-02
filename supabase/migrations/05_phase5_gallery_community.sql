-- ============================================================
-- SSSGC Houston — Phase 5: Gallery & Community Features
-- Run AFTER Phase 4 is complete
-- ============================================================

-- ============================================================
-- 1. GALLERY ALBUMS TABLE
-- ============================================================
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
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 2. GALLERY PHOTOS TABLE
-- ============================================================
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
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 3. VOLUNTEER HOURS TABLE
-- Logged seva hours per member
-- ============================================================
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
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 4. MEMBER DIRECTORY SETTINGS TABLE
-- Privacy controls for opt-in member directory
-- ============================================================
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
  FOR SELECT USING (
    show_in_directory = true AND auth.uid() IS NOT NULL
  );


-- ============================================================
-- 5. AUTO-CREATE DIRECTORY SETTINGS ON PROFILE INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_directory_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO member_directory_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_add_directory_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_directory_settings();


-- ============================================================
-- DONE! Phase 5 tables are ready.
-- ============================================================
