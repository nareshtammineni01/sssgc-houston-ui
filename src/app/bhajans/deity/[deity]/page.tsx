import type { Metadata } from 'next';
import Link from 'next/link';
import { Music, Headphones, ArrowLeft } from 'lucide-react';
import { getAllBhajans, getDeityList } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';
import { siteConfig } from '@/lib/config';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ deity: string }>;
  searchParams: Promise<{ page?: string }>;
}

function deitySlugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { deity } = await params;
  const deityName = deitySlugToName(deity);

  return {
    title: `${deityName} Bhajans — Devotional Songs`,
    description: `Browse bhajans and devotional songs dedicated to ${deityName}. Lyrics and audio at Sri Sathya Sai Center Houston.`,
    openGraph: {
      title: `${deityName} Bhajans | SSSGC Houston`,
      description: `Devotional songs dedicated to ${deityName} at SSSGC Houston.`,
      type: 'website',
    },
    alternates: {
      canonical: `${siteConfig.url}/bhajans/deity/${deity}`,
    },
  };
}

export default async function DeityBhajansPage({ params, searchParams }: PageProps) {
  const { deity } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const deityName = deitySlugToName(deity);

  const [{ bhajans, total }, allDeities] = await Promise.all([
    getAllBhajans({ page, pageSize: 50, deity: deityName }),
    getDeityList(),
  ]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="page-enter space-y-5">
      <Breadcrumbs
        items={[
          { name: 'Bhajans', href: '/bhajans' },
          { name: `${deityName} Bhajans`, href: `/bhajans/deity/${deity}` },
        ]}
      />

      <Link href="/bhajans" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80" style={{ color: '#E8860C' }}>
        <ArrowLeft size={16} /> All Bhajans
      </Link>

      <div>
        <h1
          className="text-[26px] md:text-[30px] leading-tight mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#6B1D2A' }}
        >
          {deityName} Bhajans
        </h1>
        <p className="text-[13px]" style={{ color: '#7A6B5F' }}>
          {total} devotional songs dedicated to {deityName}
        </p>
      </div>

      {/* Other Deity Links */}
      {allDeities.length > 1 && (
        <div className="card p-4">
          <p className="text-[12px] font-medium mb-2" style={{ color: '#6B1D2A' }}>
            Other Deities
          </p>
          <div className="flex flex-wrap gap-2">
            {allDeities
              .filter((d) => d.toLowerCase() !== deityName.toLowerCase())
              .map((d) => (
                <Link
                  key={d}
                  href={`/bhajans/deity/${d.toLowerCase().replace(/\s+/g, '-')}`}
                  className="filter-chip"
                >
                  {d}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Bhajan List */}
      <div className="space-y-2">
        {bhajans.map((bhajan) => (
          <Link
            key={bhajan.id}
            href={`/bhajans/${bhajan.slug}`}
            className="card block px-4 py-3 group hover:border-[#E8860C] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#FFF8EB' }}
              >
                {bhajan.audio_url ? (
                  <Headphones size={16} style={{ color: '#E8860C' }} />
                ) : (
                  <Music size={16} style={{ color: '#C46F0A' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[14px] font-medium group-hover:text-[#E8860C] truncate transition-colors"
                  style={{ color: '#2C1810' }}
                >
                  {bhajan.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {bhajans.length === 0 && (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <Music size={40} className="mx-auto mb-2 opacity-30" />
          <p>No bhajans found for {deityName}.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <Link
              href={`/bhajans/deity/${deity}?page=${page - 1}`}
              className="btn-secondary text-[13px] px-4 py-2"
              style={{ color: '#2C1810', background: 'white', borderColor: 'var(--color-border)' }}
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-[13px]" style={{ color: '#A89888' }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/bhajans/deity/${deity}?page=${page + 1}`}
              className="btn-primary text-[13px] px-4 py-2"
            >
              Next
            </Link>
          )}
        </div>
      )}

      {/* Cross-link */}
      <div className="card p-4 text-center">
        <p className="text-[12px] mb-1" style={{ color: '#7A6B5F' }}>
          Looking for prayers and mantras?
        </p>
        <Link href="/prayers" className="text-[13px] font-medium hover:underline" style={{ color: '#E8860C' }}>
          Browse All Prayers →
        </Link>
      </div>
    </div>
  );
}
