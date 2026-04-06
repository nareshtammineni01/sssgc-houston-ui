import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, Headphones, Eye, FileText, ExternalLink } from 'lucide-react';
import { getBhajanBySlug, getRelatedBhajans } from '@/lib/api/resources';
import { Breadcrumbs, BhajanJsonLd, RelatedContent } from '@/components/seo';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/config';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bhajan = await getBhajanBySlug(slug);

  if (!bhajan) return { title: 'Bhajan Not Found' };

  const plainContent = bhajan.content?.replace(/<[^>]+>/g, '').slice(0, 155) ?? null;
  const description =
    bhajan.meta_description || plainContent ||
    `${bhajan.title} — devotional bhajan lyrics${bhajan.deity ? ` dedicated to ${bhajan.deity}` : ''}. Sri Sathya Sai Center Houston.`;

  return {
    title: `${bhajan.title} — Bhajan Lyrics`,
    description,
    keywords: [bhajan.title, 'bhajan lyrics', ...(bhajan.deity ? [bhajan.deity, `${bhajan.deity} bhajan`] : []), ...(bhajan.keywords ?? []), 'Sai Baba', 'devotional songs', 'SSSGC Houston'],
    openGraph: { title: `${bhajan.title} — Bhajan Lyrics | ${siteConfig.shortName}`, description, type: 'article', url: `${siteConfig.url}/bhajans/${slug}` },
    alternates: { canonical: `${siteConfig.url}/bhajans/${slug}` },
  };
}

export default async function BhajanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const bhajan = await getBhajanBySlug(slug);
  if (!bhajan) notFound();

  const supabase = createClient();
  supabase.rpc('increment_view_count', { resource_id: bhajan.id }).then(() => {});

  const related = await getRelatedBhajans(slug, bhajan.deity, 6);

  return (
    <div className="page-enter max-w-3xl mx-auto space-y-5">
      <BhajanJsonLd
        title={bhajan.title} slug={slug} content={bhajan.content} deity={bhajan.deity}
        keywords={bhajan.keywords} audioUrl={bhajan.audio_url}
        datePublished={bhajan.created_at} dateModified={bhajan.updated_at}
      />

      {/* Compact header: breadcrumbs + back link + badge + title */}
      <div>
        <Breadcrumbs
          items={[
            { name: 'Bhajans', href: '/bhajans' },
            ...(bhajan.deity ? [{ name: bhajan.deity, href: `/bhajans/deity/${bhajan.deity.toLowerCase().replace(/\s+/g, '-')}` }] : []),
            { name: bhajan.title, href: `/bhajans/${slug}` },
          ]}
        />

        <Link href="/bhajans" className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-80 mb-2" style={{ color: '#E8860C' }}>
          <ArrowLeft size={14} /> All Bhajans
        </Link>

        <div className="flex items-center gap-2 mb-1.5 mt-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-medium" style={{ background: '#FFF8EB', color: '#E8860C' }}>
            Bhajan
          </span>
          {bhajan.deity && (
            <Link
              href={`/bhajans/deity/${bhajan.deity.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[13px] font-medium hover:underline"
              style={{ color: '#E8860C' }}
            >
              {bhajan.deity}
            </Link>
          )}
        </div>

        <h1
          className="text-[26px] md:text-[30px] leading-tight mb-1.5"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#6B1D2A' }}
        >
          {bhajan.title}
        </h1>

        <div className="flex items-center gap-3 text-[13px]" style={{ color: '#A89888' }}>
          <span className="flex items-center gap-1"><Eye size={14} /> {bhajan.view_count.toLocaleString()} views</span>
          {bhajan.keywords && bhajan.keywords.length > 0 && (
            <div className="flex items-center gap-1.5">
              {bhajan.keywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 rounded-full text-[11px] bg-cream-100" style={{ color: '#7A6B5F' }}>{kw}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {(bhajan.file_url || bhajan.audio_url) && (
        <div className="flex flex-wrap gap-3">
          {bhajan.audio_url && (
            <a href={bhajan.audio_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: '#E8860C' }}>
              <Headphones size={16} /> Listen to Audio <ExternalLink size={14} />
            </a>
          )}
          {bhajan.file_url && (
            <a href={bhajan.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-cream-50"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#6B1D2A' }}>
              <FileText size={16} /> View PDF <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {/* Content */}
      {bhajan.content && (
        <div className="card p-6 md:p-8" style={{ borderColor: 'rgba(107,29,42,0.1)' }}>
          <div className="whitespace-pre-wrap text-[19px] leading-[1.8]" style={{ color: '#2C1810' }}
            dangerouslySetInnerHTML={{ __html: bhajan.content }}
          />
        </div>
      )}

      {/* Related Bhajans */}
      <RelatedContent items={related} type="bhajan" />

      {/* Bottom nav */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/bhajans" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80" style={{ color: '#E8860C' }}>
          <ArrowLeft size={16} /> All Bhajans
        </Link>
        <Link href="/prayers" className="text-[13px] font-medium hover:underline" style={{ color: '#6B1D2A' }}>
          Browse Prayers →
        </Link>
      </div>
    </div>
  );
}
