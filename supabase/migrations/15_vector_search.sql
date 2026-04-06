-- ============================================================
-- Migration 15: Vector Search + AI Search Settings
-- Adds pgvector embeddings to resources and a site_settings table
-- ============================================================

-- 1. Enable pgvector extension (free on all Supabase plans)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to resources
-- Using 768 dimensions (Google Gemini Embedding model output size)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create an index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_resources_embedding
  ON resources USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- 4. Create site_settings table for admin-configurable options
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default search mode setting
INSERT INTO site_settings (key, value) VALUES
  ('search_mode', '"standard"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS: anyone can read settings, only admins can update
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert settings"
  ON site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 5. Create match_resources function for vector similarity search
CREATE OR REPLACE FUNCTION match_resources(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  category TEXT,
  deity TEXT,
  keywords TEXT[],
  audio_url TEXT,
  file_url TEXT,
  view_count INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.title, r.slug, r.content, r.category::TEXT,
    r.deity, r.keywords, r.audio_url, r.file_url,
    r.view_count, r.created_at, r.updated_at,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM resources r
  WHERE r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Helper: get resources without embeddings (for rebuild)
CREATE OR REPLACE FUNCTION get_resources_without_embeddings()
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  deity TEXT,
  keywords TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.title, r.content, r.category::TEXT, r.deity, r.keywords
  FROM resources r
  WHERE r.embedding IS NULL
  ORDER BY r.created_at;
END;
$$ LANGUAGE plpgsql;
