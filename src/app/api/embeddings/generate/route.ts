import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, prepareResourceText } from '@/lib/gemini';

// Called automatically when a resource is saved to generate its embedding
export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { resourceId } = await request.json();
  if (!resourceId) {
    return NextResponse.json({ error: 'resourceId required' }, { status: 400 });
  }

  // Fetch the resource
  const { data: resource, error } = await supabase
    .from('resources')
    .select('id, title, content, category, deity, keywords')
    .eq('id', resourceId)
    .single();

  if (error || !resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  // Generate embedding
  const text = prepareResourceText(resource);
  const embedding = await generateEmbedding(text);

  if (!embedding) {
    return NextResponse.json({ error: 'Failed to generate embedding (check GEMINI_API_KEY)' }, { status: 500 });
  }

  // Store embedding
  const { error: updateError } = await supabase
    .from('resources')
    .update({ embedding: JSON.stringify(embedding) } as Record<string, unknown>)
    .eq('id', resource.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
