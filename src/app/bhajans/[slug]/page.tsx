import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Music, Headphones, Eye, ArrowLeft } from 'lucide-react';
import { getBhajanBySlug, getRelatedBhajans } from '@/lib/api/resources';
import { Breadcrumbs, BhajanJsonLd, RelatedContent } from '@/components/seo';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/config';

export const revalidate = 86400; // ISR: regenerate once per day

// ─── Dynamic Metadata ───────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bhajan = await getBhajanBySlug(slug);

  if (!bhajan) {
    return { title: 'Bhajan Not Found' };
  }

  const plainContent = bhajan.content
    ? bhajan.content.replace(/<[^>]+>/g, '').slice(0, 155)
    : null;

  const description =
    bhajan.meta_description ||
    plainContent ||
    `${bhajan.title} — devotional bhajan lyrics${bhajan.deity ? ` dedicated to ${bhajan.deity}` : ''}. Sri Sathya Sai Center Houston.`;

  return {
    title: `${bhajan.title} — Bhajan Lyrics`,
    description,
    keywords: [
      bhajan.title,
      'bhajan lyrics',
      ...(bhajan.deity ? [bhajan.deity, `${bhajan.deity} bhajan`] : []),
      ...(bhajan.keywords ?? []),
      'Sai Baba',
      'devotional songs',
      'SSSGC Houston',
    ],
    openGraph: {
      title: `${bhajan.title} — Bhajan Lyrics | ${siteConfig.shortName}`,
      description,
      type: 'article',
      url: `${siteConfig.url}/bhajans/${slug}`,
    },
    alternates: {
      canonical: `${siteConfig.url}/bhajans/${slug}`,
    },
  };
}

// ─── Page Component ─────────────────────────────────────────

export default async function BhajanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const bhajan = await getBhajanBySlug(slug);

  if (!bhajan) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  const supabase = createClient();
  supabase.rpc('increment_view_count', { resource_id: bhajan.id }).then(() => {});

  // Fetch related bhajans
  const related = await getRelatedBhajans(slug, bhajan.deity, 6);

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Structured Data */}
      <BhajanJsonLd
        title={bhajan.title}
        slug={slug}
        content={bhajan.content}
        deity={bhajan.deity}
        keywords={bhajan.keywords}
        audioUrl={bhajan.audio_url}
        datePublished={bhajan.created_at}
        dateModified={bhajan.updated_at}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Bhajans', href: '/bhajans' },
          ...(bhajan.deity
            ? [
                {
                  name: bhajan.deity,
                  href: `/bhajans/deity/${bhajan.deity.toLowerCase().replace(/\s+/g, '-')}`,
                },
              ]
            : []),
          { name: bhajan.title, href: `/bhajans/${slug}` },
        ]}
      />

      {/* Back Link */}
      <Link
        href="/bhajans"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-saffron-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Bhajans
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center mt-1">
            <Music className="h-5 w-5 text-saffron-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-maroon-700">
              {bhajan.title}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-text-muted">
              {bhajan.deity && (
                <Link
                  href={`/bhajans/deity/${bhajan.deity.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-saffron-600 transition-colors"
                >
                  {bhajan.deity}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {bhajan.view_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        {/* Keywords */}
        {bhajan.keywords && bhajan.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {bhajan.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-0.5 text-xs rounded-full bg-cream-100 text-text-muted"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Audio Player */}
      {bhajan.audio_url && (
        <div className="mb-8 p-4 rounded-lg bg-cream-50 border border-cream-200">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-4 w-4 text-saffron-600" />
            <span className="text-sm font-medium text-maroon-600">
              Listen to this Bhajan
            </span>
          </div>
          <audio controls className="w-full" preload="none">
            <source src={bhajan.audio_url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Lyrics / Content */}
      {bhajan.content && (
        <section className="prose prose-maroon max-w-none">
          <h2 className="text-lg font-serif font-semibold text-maroon-700 mb-4">
            Lyrics
          </h2>
          <div
            className="text-text-main leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: bhajan.content }}
          />
        </section>
      )}

      {/* PDF / File Download */}
      {bhajan.file_url && (
        <div className="mt-6">
          <a
            href={bhajan.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron-600 text-white text-sm font-medium hover:bg-saffron-700 transition-colors"
          >
            Download PDF
          </a>
        </div>
      )}

      {/* Related Bhajans (Internal Linking) */}
      <RelatedContent items={related} type="bhajan" />

      {/* Cross-link to Prayers */}
      <div className="mt-8 text-center">
        <Link
          href="/prayers"
          className="text-sm text-maroon-600 hover:text-maroon-800 hover:underline"
        >
          Browse Prayers &rarr;
        </Link>
      </div>
    </article>
  );
}
