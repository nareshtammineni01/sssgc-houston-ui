-- ============================================================
-- SSSGC Houston — Storage Buckets Setup
-- Run this AFTER Phase 1 tables are created
-- Creates Supabase Storage buckets for file uploads
-- ============================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================================
-- RESOURCES BUCKET: public read, admin write
-- ============================================================
CREATE POLICY "Public can read resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resources' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update resources files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resources' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete resources files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resources' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- ANNOUNCEMENTS BUCKET: public read, admin write
-- ============================================================
CREATE POLICY "Public can read announcement images" ON storage.objects
  FOR SELECT USING (bucket_id = 'announcements');

CREATE POLICY "Admins can upload announcement images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'announcements' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete announcement images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'announcements' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- GALLERY BUCKET: public read, admin write
-- ============================================================
CREATE POLICY "Public can view gallery photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete gallery photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- AVATARS BUCKET: public read, owner write
-- ============================================================
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


-- ============================================================
-- DONE! Storage buckets are ready.
-- ============================================================
