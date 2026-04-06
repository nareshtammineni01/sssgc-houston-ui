import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('search_resources', {
    search_query: q,
  });

  if (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  // Return lightweight results for the client
  const results = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    deity: r.deity,
    audio_url: r.audio_url,
    content: typeof r.content === 'string'
      ? r.content.replace(/<[^>]+>/g, '').slice(0, 120)
      : null,
  }));

  return NextResponse.json({ results });
}
