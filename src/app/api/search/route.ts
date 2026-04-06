import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQueryEmbedding, generateSearchSummary } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], mode: 'standard' });
  }

  const supabase = createClient();

  // Get search mode from site_settings
  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'search_mode')
    .single();

  const searchMode = (setting?.value as string) ?? 'standard';

  // Try vector search first (if embeddings exist)
  let results: Record<string, unknown>[] = [];
  let usedVector = false;

  const queryEmbedding = await generateQueryEmbedding(q);

  if (queryEmbedding) {
    const { data: vectorResults } = await supabase.rpc('match_resources', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.3,
      match_count: 20,
    });

    if (vectorResults && vectorResults.length > 0) {
      results = vectorResults;
      usedVector = true;
    }
  }

  // Fallback to full-text search if vector search returned nothing
  if (results.length === 0) {
    const { data: textResults } = await supabase.rpc('search_resources', {
      search_query: q,
    });
    results = (textResults ?? []) as Record<string, unknown>[];
  }

  // Shape results for the client
  const shaped = results.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    deity: r.deity,
    audio_url: r.audio_url,
    content: typeof r.content === 'string'
      ? r.content.replace(/<[^>]+>/g, '').slice(0, 120)
      : null,
    similarity: r.similarity ?? null,
  }));

  // Generate AI summary if in AI mode
  let aiSummary: string | null = null;
  if (searchMode === 'ai' && shaped.length > 0) {
    aiSummary = await generateSearchSummary(q, shaped as Array<{ title: string; category: string; deity?: string | null; content?: string | null }>);
  }

  return NextResponse.json({
    results: shaped,
    mode: searchMode,
    usedVector,
    aiSummary,
  });
}
