import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Eye, FileText, ExternalLink } from 'lucide-react';
import { getPrayerBySlug, getRelatedPrayers } from '@/lib/api/resources';
import { Breadcrumbs, PrayerJsonLd, RelatedContent } from '@/components/seo';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/config';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const prayer = await getPrayerBySlug(slug);
  if (!prayer) return { title: 'Prayer Not Found' };

  const plainContent = prayer.content?.replace(/<[^>]+>/g, '').slice(0, 155) ?? null;
  const description =
    prayer.meta_description || plainContent ||
    `${prayer.title} — prayer text${prayer.deity ? ` dedicated to ${prayer.deity}` : ''}. Sri Sathya Sai Center Houston.`;

  return {
    title: `${prayer.title} — Prayer`,
    description,
    keywords: [prayer.title, 'prayer', 'mantra', ...(prayer.deity ? [prayer.deity] : []), ...(prayer.keywords ?? []), 'Sai Baba', 'SSSGC Houston'],
    openGraph: { title: `${prayer.title} — Prayer | ${siteConfig.shortName}`, description, type: 'article', url: `${siteConfig.url}/prayers/${slug}` },
    alternates: { canonical: `${siteConfig.url}/prayers/${slug}` },
  };
}

export default async function PrayerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prayer = await getPrayerBySlug(slug);
  if (!prayer) notFound();

  const supabase = createClient();
  supabase.rpc('increment_view_count', { resource_id: prayer.id }).then(() => {});

  const related = await getRelatedPrayers(slug, prayer.deity, 4);

  return (
    <div className="page-enter max-w-3xl mx-auto space-y-5">
      <PrayerJsonLd
        title={prayer.title} slug={slug} content={prayer.content} deity={prayer.deity}
        keywords={prayer.keywords} datePublished={prayer.created_at} dateModified={prayer.updated_at}
      />

      {/* Compact header: breadcrumbs + back link + badge + title */}
      <div>
        <Breadcrumbs
          items={[
            { name: 'Prayers', href: '/prayers' },
            { name: prayer.title, href: `/prayers/${slug}` },
          ]}
        />

        <Link href="/prayers" className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-80 mb-2" style={{ color: '#E8860C' }}>
          <ArrowLeft size={14} /> All Prayers
        </Link>

        <div className="flex items-center gap-2 mb-1.5 mt-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-medium" style={{ background: '#FDF2F4', color: '#6B1D2A' }}>
            Prayer
          </span>
          {prayer.deity && (
            <span className="text-[13px] font-medium" style={{ color: '#E8860C' }}>{prayer.deity}</span>
          )}
        </div>

        <h1
          className="text-[26px] md:text-[30px] leading-tight mb-1.5"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#6B1D2A' }}
        >
          {prayer.title}
        </h1>

        <div className="flex items-center gap-3 text-[13px]" style={{ color: '#A89888' }}>
          <span className="flex items-center gap-1"><Eye size={14} /> {prayer.view_count.toLocaleString()} views</span>
          {prayer.keywords && prayer.keywords.length > 0 && (
            <div className="flex items-center gap-1.5">
              {prayer.keywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 rounded-full text-[11px] bg-cream-100" style={{ color: '#7A6B5F' }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {prayer.file_url && (
        <a href={prayer.file_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: '#6B1D2A' }}>
          <FileText size={16} /> View PDF <ExternalLink size={14} />
        </a>
      )}

      {prayer.content && (
        <div className="card p-6 md:p-8" style={{ borderColor: 'rgba(107,29,42,0.1)' }}>
          <div className="whitespace-pre-wrap text-[19px] leading-[1.8]" style={{ color: '#2C1810' }}
            dangerouslySetInnerHTML={{ __html: prayer.content }}
          />
        </div>
      )}

      <RelatedContent items={related} type="prayer" />

      <div className="flex items-center justify-between pt-4">
        <Link href="/prayers" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80" style={{ color: '#E8860C' }}>
          <ArrowLeft size={16} /> All Prayers
        </Link>
        <Link href="/bhajans" className="text-[13px] font-medium hover:underline" style={{ color: '#6B1D2A' }}>
          Browse Bhajans →
        </Link>
      </div>
    </div>
  );
}
