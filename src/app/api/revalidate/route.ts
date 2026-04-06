import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * On-demand revalidation API
 *
 * Called after admin creates/edits/deletes a resource or event.
 * Purges the ISR cache so changes appear immediately on the public site.
 *
 * POST /api/revalidate
 * Body: { type: 'resource' | 'event', slug?: string, category?: string }
 *
 * Auth: requires admin or super_admin role (checked via Supabase session)
 */
export async function POST(request: NextRequest) {
  try {
    // ─── Auth check: only admins can trigger revalidation ────
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    // ─── Parse request ──────────────────────────────────────
    const body = await request.json();
    const { type, slug, category } = body as {
      type: 'resource' | 'event';
      slug?: string;
      category?: string;
    };

    const revalidated: string[] = [];

    if (type === 'resource') {
      // Always revalidate the hub and search
      revalidatePath('/resources');
      revalidatePath('/search');
      revalidated.push('/resources', '/search');

      // Revalidate category listing pages
      if (category === 'bhajan' || !category) {
        revalidatePath('/bhajans');
        revalidated.push('/bhajans');
      }
      if (category === 'prayer' || !category) {
        revalidatePath('/prayers');
        revalidated.push('/prayers');
      }

      // Revalidate the specific detail page if slug is known
      if (slug && category === 'bhajan') {
        revalidatePath(`/bhajans/${slug}`);
        revalidated.push(`/bhajans/${slug}`);
      }
      if (slug && category === 'prayer') {
        revalidatePath(`/prayers/${slug}`);
        revalidated.push(`/prayers/${slug}`);
      }

      // Revalidate deity category pages (we don't know which deity changed,
      // so revalidate the layout which covers all deity pages)
      revalidatePath('/bhajans/deity', 'layout');
      revalidated.push('/bhajans/deity/*');

      // Revalidate sitemap so new URLs get indexed fast
      revalidatePath('/sitemap.xml');
      revalidated.push('/sitemap.xml');
    }

    if (type === 'event') {
      revalidatePath('/calendar');
      revalidatePath('/sitemap.xml');
      revalidated.push('/calendar', '/sitemap.xml');
    }

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
