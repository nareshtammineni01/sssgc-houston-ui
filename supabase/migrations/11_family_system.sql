-- ============================================================
-- Migration 11: Family System
-- Adds invite_code to families, creates family_members table,
-- and policies for family management.
-- ============================================================

-- 1. Add invite_code and head_id to families table
ALTER TABLE families ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE families ADD COLUMN IF NOT EXISTS head_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Generate invite codes for existing families (if any)
-- Format: SSSGC-XXXX (random 4-char alphanumeric)
CREATE OR REPLACE FUNCTION generate_family_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'SSSGC-' || upper(substr(md5(random()::text), 1, 5));
    SELECT EXISTS(SELECT 1 FROM families WHERE invite_code = code) INTO exists_already;
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Auto-generate invite code on family creation
CREATE OR REPLACE FUNCTION set_family_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_family_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_family_invite_code ON families;
CREATE TRIGGER trg_set_family_invite_code
  BEFORE INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION set_family_invite_code();

-- 2. Create family_members table (for dependents who don't have accounts)
CREATE TABLE IF NOT EXISTS family_members (
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

-- Users can view their own family members
CREATE POLICY "Users can view own family members" ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Users can insert family members into their own family
CREATE POLICY "Users can add family members" ON family_members
  FOR INSERT WITH CHECK (
    added_by = auth.uid()
    AND family_id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Users can update their own family members
CREATE POLICY "Users can update own family members" ON family_members
  FOR UPDATE USING (
    added_by = auth.uid()
  );

-- Users can delete their own family members
CREATE POLICY "Users can delete own family members" ON family_members
  FOR DELETE USING (
    added_by = auth.uid()
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all family members" ON family_members
  FOR ALL USING (public.is_admin());

-- 3. Update families policies to allow insert and update
DROP POLICY IF EXISTS "Users can create family" ON families;
CREATE POLICY "Users can create family" ON families
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own family" ON families;
CREATE POLICY "Users can update own family" ON families
  FOR UPDATE USING (
    id IN (SELECT family_id FROM profiles WHERE profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage all families" ON families;
CREATE POLICY "Admins can manage all families" ON families
  FOR ALL USING (public.is_admin());

-- 4. RPC: Create a family for the current user
CREATE OR REPLACE FUNCTION create_my_family(p_family_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id UUID;
  v_invite_code TEXT;
  v_user_id UUID := auth.uid();
BEGIN
  -- Check if user already has a family
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND family_id IS NOT NULL) THEN
    RETURN json_build_object('error', 'You already belong to a family');
  END IF;

  -- Create family
  INSERT INTO families (family_name, head_id)
  VALUES (p_family_name, v_user_id)
  RETURNING id, invite_code INTO v_family_id, v_invite_code;

  -- Link user to family as head
  UPDATE profiles
  SET family_id = v_family_id, family_role = 'head', updated_at = now()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'family_id', v_family_id,
    'invite_code', v_invite_code
  );
END;
$$;

-- 5. RPC: Join an existing family by invite code
CREATE OR REPLACE FUNCTION join_family_by_code(p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  -- Check if user already has a family
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND family_id IS NOT NULL) THEN
    RETURN json_build_object('error', 'You already belong to a family. Leave your current family first.');
  END IF;

  -- Find family by invite code
  SELECT id INTO v_family_id FROM families WHERE invite_code = upper(trim(p_invite_code));

  IF v_family_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid invite code. Please check and try again.');
  END IF;

  -- Link user to family as spouse
  UPDATE profiles
  SET family_id = v_family_id, family_role = 'spouse', updated_at = now()
  WHERE id = v_user_id;

  RETURN json_build_object('family_id', v_family_id, 'success', true);
END;
$$;

-- 6. RPC: Leave current family
CREATE OR REPLACE FUNCTION leave_family()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_family_id UUID;
  v_family_role TEXT;
BEGIN
  SELECT family_id, family_role INTO v_family_id, v_family_role
  FROM profiles WHERE id = v_user_id;

  IF v_family_id IS NULL THEN
    RETURN json_build_object('error', 'You are not part of any family.');
  END IF;

  -- Unlink user
  UPDATE profiles
  SET family_id = NULL, family_role = NULL, updated_at = now()
  WHERE id = v_user_id;

  -- If head left and no other members, delete the family
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE family_id = v_family_id) THEN
    DELETE FROM family_members WHERE family_id = v_family_id;
    DELETE FROM families WHERE id = v_family_id;
  ELSIF v_family_role = 'head' THEN
    -- Promote next member to head
    UPDATE profiles
    SET family_role = 'head', updated_at = now()
    WHERE id = (
      SELECT id FROM profiles WHERE family_id = v_family_id LIMIT 1
    );
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- 7. RPC: Admin link two profiles into one family
CREATE OR REPLACE FUNCTION admin_link_family(p_profile_id UUID, p_family_id UUID, p_role TEXT DEFAULT 'spouse')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Admin access required');
  END IF;

  UPDATE profiles
  SET family_id = p_family_id, family_role = p_role, updated_at = now()
  WHERE id = p_profile_id;

  RETURN json_build_object('success', true);
END;
$$;
