-- ============================================================
-- SSSGC Houston — Database State Restoration
-- Fixes: trigger, RLS, cascading triggers after debug session
-- Run this in Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. RESTORE the full handle_new_user() trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first TEXT;
  v_last  TEXT;
  v_full  TEXT;
BEGIN
  -- Extract names from user metadata
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 2. Make sure the trigger on auth.users exists
-- (Drop and recreate to be safe)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 3. RE-ENABLE RLS on profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. Clean up debug policies, then recreate correct ones
-- ============================================================

-- Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Allow all inserts" ON profiles;
DROP POLICY IF EXISTS "Permissive insert" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Recreate clean policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Allow inserts (trigger uses SECURITY DEFINER, but just in case)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);


-- ============================================================
-- 5. RECREATE the cascading directory settings trigger
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

DROP TRIGGER IF EXISTS on_profile_created_add_directory_settings ON profiles;
CREATE TRIGGER on_profile_created_add_directory_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_directory_settings();


-- ============================================================
-- 6. Make sure notification preferences trigger exists
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

DROP TRIGGER IF EXISTS on_profile_created_add_notif_prefs ON profiles;
CREATE TRIGGER on_profile_created_add_notif_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_prefs();


-- ============================================================
-- 7. Clean up orphaned auth.users (no matching profile)
-- These are leftover from failed signup attempts
-- ============================================================
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);


-- ============================================================
-- 8. VERIFY everything is in order
-- Run these SELECT queries to confirm the fix
-- ============================================================

-- Check trigger on auth.users exists
SELECT tgname, tgrelid::regclass, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass;

-- Check profiles has all required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Check all policies on profiles
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Check the trigger function source is the FULL version
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
