import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, prepareResourceText } from '@/lib/gemini';

export const maxDuration = 60; // Allow up to 60s for rebuilding

export async function POST() {
  const supabase = createClient();

  // Auth check: admin only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  // Stream progress back via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // Get all resources (or just those without embeddings)
        const { data: resources, error } = await supabase
          .from('resources')
          .select('id, title, content, category, deity, keywords')
          .order('created_at');

        if (error || !resources) {
          send({ error: 'Failed to fetch resources' });
          controller.close();
          return;
        }

        send({ progress: `Found ${resources.length} resources. Starting...` });

        let embedded = 0;
        let failed = 0;

        for (let i = 0; i < resources.length; i++) {
          const resource = resources[i];
          const text = prepareResourceText(resource);
          const embedding = await generateEmbedding(text);

          if (embedding) {
            const { error: updateError } = await supabase
              .from('resources')
              .update({ embedding: JSON.stringify(embedding) } as Record<string, unknown>)
              .eq('id', resource.id);

            if (updateError) {
              failed++;
            } else {
              embedded++;
            }
          } else {
            failed++;
          }

          // Send progress every 10 items or on last item
          if ((i + 1) % 10 === 0 || i === resources.length - 1) {
            send({
              progress: `Processed ${i + 1}/${resources.length} (${embedded} embedded, ${failed} failed)`,
            });
          }

          // Small delay to stay within rate limits
          if ((i + 1) % 50 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        send({ progress: `Done! ${embedded} embedded, ${failed} failed.` });
      } catch (err: unknown) {
        send({ error: `Unexpected error: ${err instanceof Error ? err.message : 'unknown'}` });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
