-- ============================================================
-- SSSGC Houston — SEO Migration: Slugs + Search Enhancements
-- Run AFTER all previous phases are complete
-- ============================================================

-- ============================================================
-- 1. ADD SLUG COLUMN TO RESOURCES
-- ============================================================
ALTER TABLE resources ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs from existing titles
-- Converts "Om Jai Jagadish Hare" → "om-jai-jagadish-hare"
UPDATE resources
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9\s-]', '', 'g'),  -- remove special chars
      '\s+', '-', 'g'                                              -- spaces → hyphens
    ),
    '-+', '-', 'g'                                                  -- collapse multiple hyphens
  )
)
WHERE slug IS NULL;

-- Handle duplicate slugs by appending a suffix
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
BEGIN
  FOR rec IN
    SELECT slug, array_agg(id ORDER BY created_at) AS ids
    FROM resources
    GROUP BY slug
    HAVING count(*) > 1
  LOOP
    counter := 1;
    -- Skip the first one (keep original slug), update the rest
    FOR i IN 2..array_length(rec.ids, 1) LOOP
      UPDATE resources
      SET slug = rec.slug || '-' || counter
      WHERE id = rec.ids[i];
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE resources ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_resources_slug ON resources(slug);

-- ============================================================
-- 2. ADD SLUG COLUMN TO EVENTS
-- ============================================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs from existing event titles
UPDATE events
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate event slugs
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
BEGIN
  FOR rec IN
    SELECT slug, array_agg(id ORDER BY created_at) AS ids
    FROM events
    GROUP BY slug
    HAVING count(*) > 1
  LOOP
    counter := 1;
    FOR i IN 2..array_length(rec.ids, 1) LOOP
      UPDATE events
      SET slug = rec.slug || '-' || counter
      WHERE id = rec.ids[i];
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_events_slug ON events(slug);

-- ============================================================
-- 3. AUTO-GENERATE SLUG ON INSERT (trigger function)
-- Reusable for any table with title + slug columns
-- ============================================================
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate if slug not manually provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(TRIM(NEW.title), '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    );

    final_slug := base_slug;

    -- Check for uniqueness, append counter if needed
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM resources WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      ) AND NOT EXISTS (
        SELECT 1 FROM events WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      ) THEN
        EXIT;
      END IF;
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to resources
DROP TRIGGER IF EXISTS trg_resources_slug ON resources;
CREATE TRIGGER trg_resources_slug
  BEFORE INSERT OR UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- Attach trigger to events
DROP TRIGGER IF EXISTS trg_events_slug ON events;
CREATE TRIGGER trg_events_slug
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- ============================================================
-- 4. ADD meta_description TO RESOURCES (for SEO metadata)
-- ============================================================
ALTER TABLE resources ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Auto-generate meta descriptions from content (first 155 chars)
UPDATE resources
SET meta_description = LEFT(
  REGEXP_REPLACE(COALESCE(content, title), E'<[^>]+>', '', 'g'),  -- strip HTML tags
  155
) || '...'
WHERE meta_description IS NULL AND content IS NOT NULL;

-- ============================================================
-- 5. UPDATED SEARCH FUNCTION — now includes slug in results
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
-- DONE! Run this migration, then deploy the Next.js SEO routes.
-- ============================================================
