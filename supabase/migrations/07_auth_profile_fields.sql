-- ============================================================
-- SSSGC Houston — Auth & Profile Enhancement
-- Adds first_name, last_name, address fields to profiles
-- Run AFTER all previous migrations
-- ============================================================

-- Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address1 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip TEXT;

-- Backfill: split existing full_name into first/last for any existing rows
UPDATE profiles
SET
  first_name = split_part(full_name, ' ', 1),
  last_name  = CASE
    WHEN position(' ' IN full_name) > 0
    THEN substring(full_name FROM position(' ' IN full_name) + 1)
    ELSE NULL
  END
WHERE first_name IS NULL AND full_name IS NOT NULL AND full_name != '';


-- ============================================================
-- Update the handle_new_user() trigger to capture new fields
-- This fires when a user signs up (email/password or OAuth)
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
-- DONE! New profile fields and updated trigger are ready.
-- ============================================================
