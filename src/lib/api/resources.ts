import { createClient } from '@/lib/supabase/server';
import type { Resource } from '@/types/database';

// ─── Bhajans ────────────────────────────────────────────────

export async function getAllBhajans(options?: {
  page?: number;
  pageSize?: number;
  deity?: string;
}) {
  const supabase = createClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('resources')
    .select('id, title, slug, deity, keywords, view_count, audio_url, created_at', { count: 'exact' })
    .eq('category', 'bhajan')
    .order('title', { ascending: true })
    .range(from, to);

  if (options?.deity) {
    query = query.ilike('deity', options.deity);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { bhajans: (data ?? []) as Pick<Resource, 'id' | 'title' | 'slug' | 'deity' | 'keywords' | 'view_count' | 'audio_url' | 'created_at'>[], total: count ?? 0 };
}

export async function getBhajanBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'bhajan')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Resource;
}

export async function getRelatedBhajans(currentSlug: string, deity: string | null, limit = 6) {
  const supabase = createClient();

  let query = supabase
    .from('resources')
    .select('id, title, slug, deity, audio_url')
    .eq('category', 'bhajan')
    .neq('slug', currentSlug)
    .limit(limit);

  // Prefer same deity, but fall back to any bhajans
  if (deity) {
    query = query.ilike('deity', deity);
  }

  const { data, error } = await query;
  if (error) return [];
  return data as Pick<Resource, 'id' | 'title' | 'slug' | 'deity' | 'audio_url'>[];
}

// ─── Prayers ────────────────────────────────────────────────

export async function getAllPrayers(options?: {
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from('resources')
    .select('id, title, slug, deity, keywords, view_count, created_at', { count: 'exact' })
    .eq('category', 'prayer')
    .order('title', { ascending: true })
    .range(from, to);

  if (error) throw error;

  return { prayers: (data ?? []) as Pick<Resource, 'id' | 'title' | 'slug' | 'deity' | 'keywords' | 'view_count' | 'created_at'>[], total: count ?? 0 };
}

export async function getPrayerBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('category', 'prayer')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Resource;
}

export async function getRelatedPrayers(currentSlug: string, deity: string | null, limit = 4) {
  const supabase = createClient();

  let query = supabase
    .from('resources')
    .select('id, title, slug, deity')
    .eq('category', 'prayer')
    .neq('slug', currentSlug)
    .limit(limit);

  if (deity) {
    query = query.ilike('deity', deity);
  }

  const { data, error } = await query;
  if (error) return [];
  return data as Pick<Resource, 'id' | 'title' | 'slug' | 'deity'>[];
}

// ─── General / Hub ──────────────────────────────────────────

export async function getResourceCounts() {
  const supabase = createClient();

  const categories = ['bhajan', 'prayer', 'study_circle', 'document', 'bhajan_resource'] as const;
  const counts: Record<string, number> = {};

  for (const category of categories) {
    const { count } = await supabase
      .from('resources')
      .select('id', { count: 'exact', head: true })
      .eq('category', category);
    counts[category] = count ?? 0;
  }

  return counts;
}

export async function getDeityList() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('deity')
    .eq('category', 'bhajan')
    .not('deity', 'is', null)
    .order('deity');

  if (error) return [];

  // Deduplicate and return unique deities
  const deities = [...new Set(data.map((r) => r.deity as string))].filter(Boolean);
  return deities;
}

// ─── Search ─────────────────────────────────────────────────

export async function searchResources(query: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('search_resources', {
    search_query: query,
  });

  if (error) return [];
  return (data ?? []) as Resource[];
}

// ─── Sitemap helpers ────────────────────────────────────────

export async function getAllResourceSlugs() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('resources')
    .select('slug, category, updated_at')
    .order('category')
    .order('title');

  if (error) return [];
  return data as { slug: string; category: string; updated_at: string }[];
}
