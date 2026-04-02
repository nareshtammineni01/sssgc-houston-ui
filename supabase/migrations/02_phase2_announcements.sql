-- ============================================================
-- SSSGC Houston — Phase 2: Announcements & Notifications
-- Run AFTER Phase 1 is complete
-- ============================================================

-- ============================================================
-- 1. ANNOUNCEMENTS TABLE
-- Rich text (HTML) announcements with categories and pinning
-- ============================================================
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,                      -- HTML from WYSIWYG editor (Tiptap)
  body_plain TEXT,                         -- Auto-generated plain text for WhatsApp/email
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

-- Everyone can read published announcements
CREATE POLICY "Anyone can view announcements" ON announcements
  FOR SELECT USING (published_at <= now());

-- Admins can create announcements
CREATE POLICY "Admins can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admins can manage their own announcements
CREATE POLICY "Admins can manage own announcements" ON announcements
  FOR UPDATE USING (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete own announcements" ON announcements
  FOR DELETE USING (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Super admins can manage any announcement
CREATE POLICY "Super admins can manage all announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );


-- ============================================================
-- 2. AUTO-STRIP HTML TO PLAIN TEXT (Trigger)
-- Generates body_plain from body for WhatsApp/email fallback
-- ============================================================
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


-- ============================================================
-- 3. NOTIFICATION PREFERENCES TABLE
-- Per-member settings: which categories + which channels
-- ============================================================
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

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all preferences (for targeting)
CREATE POLICY "Admins can view all preferences" ON notification_preferences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 4. AUTO-CREATE NOTIFICATION PREFERENCES ON PROFILE INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_add_notif_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_prefs();


-- ============================================================
-- 5. NOTIFICATION LOG TABLE
-- Audit trail: every email/WhatsApp sent
-- ============================================================
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

-- Only admins can view notification logs
CREATE POLICY "Admins can view notification log" ON notification_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 6. ENABLE REAL-TIME for announcements (live news ticker)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;


-- ============================================================
-- DONE! Phase 2 tables are ready.
-- ============================================================
