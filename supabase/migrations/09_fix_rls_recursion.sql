-- ============================================================
-- SSSGC Houston — Fix RLS Infinite Recursion (42P17)
--
-- ROOT CAUSE: Every admin-check policy queries `profiles`,
-- but profiles RLS also queries profiles → infinite loop.
--
-- FIX: SECURITY DEFINER helper functions that bypass RLS.
-- ============================================================


-- ============================================================
-- 1. Helper functions (bypass RLS via SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to get own role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- 2. PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all inserts" ON profiles;
DROP POLICY IF EXISTS "Permissive insert" ON profiles;

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


-- ============================================================
-- 3. FAMILIES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own family" ON families;
DROP POLICY IF EXISTS "Admins can view all families" ON families;
DROP POLICY IF EXISTS "Admins can manage families" ON families;

CREATE POLICY "Users can view own family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY "Admins can view all families" ON families
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage families" ON families
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 4. DAILY_QUOTES
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active quotes" ON daily_quotes;
DROP POLICY IF EXISTS "Admins can manage quotes" ON daily_quotes;

CREATE POLICY "Anyone can view active quotes" ON daily_quotes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quotes" ON daily_quotes
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 5. SITE_CONTENT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view site content" ON site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON site_content;

CREATE POLICY "Anyone can view site content" ON site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site content" ON site_content
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 6. ANNOUNCEMENTS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can manage own announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete own announcements" ON announcements;
DROP POLICY IF EXISTS "Super admins can manage all announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update own announcements" ON announcements;
DROP POLICY IF EXISTS "Super admins manage all announcements" ON announcements;

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


-- ============================================================
-- 7. NOTIFICATION_PREFERENCES
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON notification_preferences;

CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all preferences" ON notification_preferences
  FOR SELECT USING (public.is_admin());


-- ============================================================
-- 8. NOTIFICATION_LOG
-- ============================================================
DROP POLICY IF EXISTS "Admins can view notification log" ON notification_log;

CREATE POLICY "Admins can view notification log" ON notification_log
  FOR SELECT USING (public.is_admin());


-- ============================================================
-- 9. RESOURCES
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;

CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage resources" ON resources
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 10. FAVORITES (no admin policies — skip)
-- ============================================================


-- ============================================================
-- 11. EVENTS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can view all events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (is_cancelled = false);

CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 12. EVENT_SIGNUPS
-- ============================================================
DROP POLICY IF EXISTS "Users can view own signups" ON event_signups;
DROP POLICY IF EXISTS "Users can manage own signups" ON event_signups;
DROP POLICY IF EXISTS "Admins can view all signups" ON event_signups;
DROP POLICY IF EXISTS "Admins can update signups" ON event_signups;

CREATE POLICY "Users can view own signups" ON event_signups
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own signups" ON event_signups
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all signups" ON event_signups
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update signups" ON event_signups
  FOR UPDATE USING (public.is_admin());


-- ============================================================
-- 13. EDUCARE_ENROLLMENTS
-- ============================================================
DROP POLICY IF EXISTS "Parents can view own enrollments" ON educare_enrollments;
DROP POLICY IF EXISTS "Parents can enroll children" ON educare_enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON educare_enrollments;

CREATE POLICY "Parents can view own enrollments" ON educare_enrollments
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can enroll children" ON educare_enrollments
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Admins can manage enrollments" ON educare_enrollments
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 14. VOLUNTEER_SIGNUPS
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own volunteer signups" ON volunteer_signups;
DROP POLICY IF EXISTS "Admins can view all volunteer signups" ON volunteer_signups;

CREATE POLICY "Users can manage own volunteer signups" ON volunteer_signups
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all volunteer signups" ON volunteer_signups
  FOR SELECT USING (public.is_admin());


-- ============================================================
-- 15. GALLERY_ALBUMS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view published albums" ON gallery_albums;
DROP POLICY IF EXISTS "Admins can manage albums" ON gallery_albums;

CREATE POLICY "Anyone can view published albums" ON gallery_albums
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage albums" ON gallery_albums
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 16. GALLERY_PHOTOS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view photos in published albums" ON gallery_photos;
DROP POLICY IF EXISTS "Admins can manage photos" ON gallery_photos;

CREATE POLICY "Anyone can view photos in published albums" ON gallery_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM gallery_albums WHERE id = album_id AND is_published = true)
  );

CREATE POLICY "Admins can manage photos" ON gallery_photos
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 17. VOLUNTEER_HOURS
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own hours" ON volunteer_hours;
DROP POLICY IF EXISTS "Admins can manage all hours" ON volunteer_hours;

CREATE POLICY "Users can manage own hours" ON volunteer_hours
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all hours" ON volunteer_hours
  FOR ALL USING (public.is_admin());


-- ============================================================
-- 18. MEMBER_DIRECTORY_SETTINGS
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own directory settings" ON member_directory_settings;
DROP POLICY IF EXISTS "Members can view opted-in entries" ON member_directory_settings;
DROP POLICY IF EXISTS "Admins can view all directory settings" ON member_directory_settings;

CREATE POLICY "Users can manage own directory settings" ON member_directory_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Members can view opted-in entries" ON member_directory_settings
  FOR SELECT USING (show_in_directory = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all directory settings" ON member_directory_settings
  FOR SELECT USING (public.is_admin());


-- ============================================================
-- 19. VERIFY — check all policies are updated
-- ============================================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
