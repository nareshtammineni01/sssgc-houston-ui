import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, ArrowLeft } from 'lucide-react';
import { getPrayerBySlug, getRelatedPrayers } from '@/lib/api/resources';
import { Breadcrumbs, PrayerJsonLd, RelatedContent } from '@/components/seo';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/config';

export const revalidate = 86400; // ISR: regenerate once per day

// ─── Dynamic Metadata ───────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const prayer = await getPrayerBySlug(slug);

  if (!prayer) {
    return { title: 'Prayer Not Found' };
  }

  const plainContent = prayer.content
    ? prayer.content.replace(/<[^>]+>/g, '').slice(0, 155)
    : null;

  const description =
    prayer.meta_description ||
    plainContent ||
    `${prayer.title} — prayer text${prayer.deity ? ` dedicated to ${prayer.deity}` : ''}. Sri Sathya Sai Center Houston.`;

  return {
    title: `${prayer.title} — Prayer`,
    description,
    keywords: [
      prayer.title,
      'prayer',
      'mantra',
      ...(prayer.deity ? [prayer.deity] : []),
      ...(prayer.keywords ?? []),
      'Sai Baba',
      'SSSGC Houston',
    ],
    openGraph: {
      title: `${prayer.title} — Prayer | ${siteConfig.shortName}`,
      description,
      type: 'article',
      url: `${siteConfig.url}/prayers/${slug}`,
    },
    alternates: {
      canonical: `${siteConfig.url}/prayers/${slug}`,
    },
  };
}

// ─── Page Component ─────────────────────────────────────────

export default async function PrayerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prayer = await getPrayerBySlug(slug);

  if (!prayer) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  const supabase = createClient();
  supabase.rpc('increment_view_count', { resource_id: prayer.id }).then(() => {});

  // Fetch related prayers
  const related = await getRelatedPrayers(slug, prayer.deity, 4);

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Structured Data */}
      <PrayerJsonLd
        title={prayer.title}
        slug={slug}
        content={prayer.content}
        deity={prayer.deity}
        keywords={prayer.keywords}
        datePublished={prayer.created_at}
        dateModified={prayer.updated_at}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: 'Prayers', href: '/prayers' },
          { name: prayer.title, href: `/prayers/${slug}` },
        ]}
      />

      {/* Back Link */}
      <Link
        href="/prayers"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-maroon-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Prayers
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center mt-1">
            <BookOpen className="h-5 w-5 text-maroon-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-maroon-700">
              {prayer.title}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-text-muted">
              {prayer.deity && (
                <Link
                  href={`/prayers?deity=${encodeURIComponent(prayer.deity)}`}
                  className="hover:text-maroon-600 transition-colors"
                >
                  {prayer.deity}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {prayer.view_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        {/* Keywords */}
        {prayer.keywords && prayer.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {prayer.keywords.map((keyword) => (
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

      {/* Prayer Content */}
      {prayer.content && (
        <section className="prose prose-maroon max-w-none">
          <div
            className="text-text-main leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: prayer.content }}
          />
        </section>
      )}

      {/* PDF / File Download */}
      {prayer.file_url && (
        <div className="mt-6">
          <a
            href={prayer.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-maroon-600 text-white text-sm font-medium hover:bg-maroon-700 transition-colors"
          >
            Download PDF
          </a>
        </div>
      )}

      {/* Related Prayers (Internal Linking) */}
      <RelatedContent items={related} type="prayer" />

      {/* Cross-link to Bhajans */}
      <div className="mt-8 text-center">
        <Link
          href="/bhajans"
          className="text-sm text-saffron-700 hover:text-saffron-900 hover:underline"
        >
          Browse Bhajans &rarr;
        </Link>
      </div>
    </article>
  );
}
