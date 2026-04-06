import type { Metadata } from 'next';
import Link from 'next/link';
import { Music, Headphones, Search } from 'lucide-react';
import { getAllBhajans, getDeityList } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Bhajans — Devotional Songs & Lyrics',
  description:
    'Browse 700+ bhajan lyrics with audio. Devotional songs dedicated to Ganesha, Sai Baba, Krishna, Shiva, and more at Sri Sathya Sai Center Houston.',
  openGraph: {
    title: 'Bhajans — Devotional Songs & Lyrics | SSSGC Houston',
    description:
      'Browse 700+ bhajan lyrics with audio at Sri Sathya Sai Center Houston.',
    type: 'website',
  },
};

interface BhajansPageProps {
  searchParams: Promise<{ page?: string; deity?: string }>;
}

export default async function BhajansPage({ searchParams }: BhajansPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const deityFilter = params.deity || undefined;

  const [{ bhajans, total }, deities] = await Promise.all([
    getAllBhajans({ page, pageSize: 50, deity: deityFilter }),
    getDeityList(),
  ]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="page-enter space-y-5">
      <Breadcrumbs items={[{ name: 'Bhajans', href: '/bhajans' }]} />

      <div>
        <h1 className="text-h1">Bhajans</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A6B5F' }}>
          {total.toLocaleString()} devotional songs with lyrics
          {deityFilter ? ` — ${deityFilter}` : ''}
        </p>
      </div>

      {/* Search CTA */}
      <Link
        href="/search"
        className="card flex items-center gap-2 px-4 py-3 group hover:border-[#E8860C] transition-colors"
      >
        <Search size={16} style={{ color: '#A89888' }} />
        <span className="text-[13px]" style={{ color: '#A89888' }}>
          Search bhajans by title, deity, or keyword...
        </span>
      </Link>

      {/* Deity Filter Chips */}
      {deities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/bhajans"
            className={deityFilter ? 'filter-chip' : 'filter-chip filter-chip-active'}
          >
            All
          </Link>
          {deities.map((deity) => (
            <Link
              key={deity}
              href={`/bhajans?deity=${encodeURIComponent(deity)}`}
              className={deityFilter === deity ? 'filter-chip filter-chip-active' : 'filter-chip'}
            >
              {deity}
            </Link>
          ))}
        </div>
      )}

      {/* Deity Category Links (SEO) */}
      {!deityFilter && deities.length > 0 && (
        <div className="card p-4">
          <p className="text-[12px] font-medium mb-2" style={{ color: '#6B1D2A' }}>
            Browse by Deity
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {deities.map((deity) => (
              <Link
                key={deity}
                href={`/bhajans/deity/${encodeURIComponent(deity.toLowerCase().replace(/\s+/g, '-'))}`}
                className="text-[12px] hover:underline"
                style={{ color: '#E8860C' }}
              >
                {deity} Bhajans
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
                {bhajan.deity && (
                  <p className="text-[11px]" style={{ color: '#A89888' }}>
                    {bhajan.deity}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {bhajans.length === 0 && (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <Music size={40} className="mx-auto mb-2 opacity-30" />
          <p>No bhajans found{deityFilter ? ` for ${deityFilter}` : ''}.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <Link
              href={`/bhajans?page=${page - 1}${deityFilter ? `&deity=${encodeURIComponent(deityFilter)}` : ''}`}
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
              href={`/bhajans?page=${page + 1}${deityFilter ? `&deity=${encodeURIComponent(deityFilter)}` : ''}`}
              className="btn-primary text-[13px] px-4 py-2"
            >
              Next
            </Link>
          )}
        </div>
      )}

      {/* Cross-link to Prayers */}
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
