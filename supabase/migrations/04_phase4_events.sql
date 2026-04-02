-- ============================================================
-- SSSGC Houston — Phase 4: Calendar, Events & Volunteer Signup
-- Run AFTER Phase 3 is complete
-- ============================================================

-- ============================================================
-- 1. EVENTS TABLE
-- Supports recurring (RRULE) + one-off + override/cancel
-- ============================================================
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('devotion', 'educare', 'seva', 'festival')),
  location TEXT DEFAULT '4515 FM 1463, Katy, TX 77494',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  max_capacity INTEGER,                    -- NULL = unlimited

  -- Recurrence fields
  is_recurring BOOLEAN DEFAULT false,
  rrule TEXT,                              -- e.g. 'FREQ=WEEKLY;BYDAY=SA'
  recurring_parent_id UUID REFERENCES events(id) ON DELETE CASCADE,
  occurrence_date DATE,                    -- Which occurrence this overrides
  is_cancelled BOOLEAN DEFAULT false,

  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_start ON events(start_time);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_parent ON events(recurring_parent_id) WHERE recurring_parent_id IS NOT NULL;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Everyone can view non-cancelled events
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (is_cancelled = false);

-- Admins can view all events (including cancelled)
CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admins can manage events
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 2. EVENT SIGNUPS TABLE (RSVP)
-- Replaces Google Forms for event registration
-- ============================================================
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

-- Users can view their own signups
CREATE POLICY "Users can view own signups" ON event_signups
  FOR SELECT USING (user_id = auth.uid());

-- Users can signup/cancel themselves
CREATE POLICY "Users can manage own signups" ON event_signups
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all signups
CREATE POLICY "Admins can view all signups" ON event_signups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Admins can update attendance
CREATE POLICY "Admins can update signups" ON event_signups
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Enable real-time for live RSVP counts
ALTER PUBLICATION supabase_realtime ADD TABLE event_signups;


-- ============================================================
-- 3. EDUCARE ENROLLMENTS TABLE
-- Child class registration (replaces Google Form)
-- ============================================================
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

-- Parents can view their own children's enrollments
CREATE POLICY "Parents can view own enrollments" ON educare_enrollments
  FOR SELECT USING (parent_id = auth.uid());

-- Parents can enroll their children
CREATE POLICY "Parents can enroll children" ON educare_enrollments
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments" ON educare_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 4. VOLUNTEER SIGNUPS TABLE
-- Seva project registrations
-- ============================================================
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

-- Users can manage their own signups
CREATE POLICY "Users can manage own volunteer signups" ON volunteer_signups
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all signups
CREATE POLICY "Admins can view all volunteer signups" ON volunteer_signups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- DONE! Phase 4 tables are ready.
-- ============================================================
