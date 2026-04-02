-- ============================================================
-- SSSGC Houston — Phase 3: Resource Library
-- Run AFTER Phase 2 is complete
-- ============================================================

-- ============================================================
-- 1. RESOURCES TABLE
-- Bhajans (722), Prayers (48), Study Circle (12), Documents
-- ============================================================
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,                            -- Lyrics, text content
  category TEXT NOT NULL CHECK (category IN ('bhajan', 'prayer', 'study_circle', 'document', 'bhajan_resource')),
  keywords TEXT[],                         -- Search keywords array
  deity TEXT,                              -- Optional: Ganesha, Sai Baba, etc.
  file_url TEXT,                           -- Supabase Storage URL for PDFs
  audio_url TEXT,                          -- Audio embed URL
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search GIN index
CREATE INDEX idx_resources_search ON resources
  USING GIN (
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(content, '') || ' ' ||
      COALESCE(array_to_string(keywords, ' '), '') || ' ' ||
      COALESCE(deity, '')
    )
  );

CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_deity ON resources(deity) WHERE deity IS NOT NULL;

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Everyone can read resources (public)
CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

-- Admins can manage resources
CREATE POLICY "Admins can manage resources" ON resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- ============================================================
-- 2. FAVORITES TABLE
-- Users can bookmark/star resources
-- ============================================================
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, resource_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (user_id = auth.uid());

-- Users can add/remove their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (user_id = auth.uid());


-- ============================================================
-- 3. SEARCH FUNCTION (RPC)
-- Full-text search with relevance ranking
-- ============================================================
CREATE OR REPLACE FUNCTION search_resources(search_query TEXT)
RETURNS SETOF resources AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM resources
  WHERE to_tsvector('english',
    COALESCE(title, '') || ' ' ||
    COALESCE(content, '') || ' ' ||
    COALESCE(array_to_string(keywords, ' '), '') || ' ' ||
    COALESCE(deity, '')
  ) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(
    to_tsvector('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(content, '') || ' ' ||
      COALESCE(array_to_string(keywords, ' '), '') || ' ' ||
      COALESCE(deity, '')
    ),
    plainto_tsquery('english', search_query)
  ) DESC;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- 4. INCREMENT VIEW COUNT (RPC)
-- Avoids race conditions with concurrent reads
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view_count(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- ============================================================
-- DONE! Phase 3 tables are ready.
-- Next: Run WordPress migration script to populate resources
-- ============================================================
