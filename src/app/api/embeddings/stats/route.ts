import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  try {
    const { count: total } = await supabase
      .from('resources')
      .select('id', { count: 'exact', head: true });

    // Count resources that have embeddings
    // We use the RPC to get those WITHOUT embeddings, then subtract
    const { data: missing } = await supabase.rpc('get_resources_without_embeddings');
    const missingCount = missing?.length ?? 0;
    const embeddedCount = (total ?? 0) - missingCount;

    return NextResponse.json({
      embedded: embeddedCount,
      missing: missingCount,
    });
  } catch {
    return NextResponse.json({ embedded: 0, missing: 0 });
  }
}
