import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  // Check Supabase connection
  let supabaseOk = false;
  try {
    const { error } = await supabase.from('resources').select('id', { count: 'exact', head: true });
    supabaseOk = !error;
  } catch { /* */ }

  // Check Gemini API key
  const geminiKey = !!process.env.GEMINI_API_KEY;

  // Check pgvector extension
  let vectorExtension = false;
  try {
    const { data } = await supabase.rpc('get_resources_without_embeddings');
    vectorExtension = data !== null; // If function exists, extension is enabled
  } catch {
    vectorExtension = false;
  }

  return NextResponse.json({
    supabase: supabaseOk,
    geminiKey,
    vectorExtension,
  });
}
