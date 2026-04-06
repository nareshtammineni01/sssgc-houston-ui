import type { Metadata } from 'next';
import Link from 'next/link';
import { Music, Headphones, Search, ChevronRight } from 'lucide-react';
import { getAllBhajans, getDeityList } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';

export const revalidate = 86400; // ISR: regenerate once per day

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Bhajans', href: '/bhajans' }]} />

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-maroon-700 mb-2">
          Bhajans
        </h1>
        <p className="text-text-muted text-lg">
          {total.toLocaleString()} devotional songs with lyrics
          {deityFilter ? ` — ${deityFilter}` : ''}
        </p>
      </header>

      {/* Search CTA */}
      <Link
        href="/search"
        className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg border border-cream-200 bg-cream-50 hover:border-saffron-300 transition-colors text-text-muted"
      >
        <Search className="h-4 w-4" />
        <span>Search bhajans by title, deity, or keyword...</span>
      </Link>

      {/* Deity Filter Chips */}
      {deities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/bhajans"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !deityFilter
                ? 'bg-saffron-600 text-white'
                : 'bg-cream-100 text-text-muted hover:bg-cream-200'
            }`}
          >
            All
          </Link>
          {deities.map((deity) => (
            <Link
              key={deity}
              href={`/bhajans?deity=${encodeURIComponent(deity)}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                deityFilter === deity
                  ? 'bg-saffron-600 text-white'
                  : 'bg-cream-100 text-text-muted hover:bg-cream-200'
              }`}
            >
              {deity}
            </Link>
          ))}
        </div>
      )}

      {/* Deity Category Links (SEO internal linking) */}
      {!deityFilter && deities.length > 0 && (
        <nav className="mb-8 p-4 rounded-lg bg-cream-50 border border-cream-200">
          <h2 className="text-sm font-semibold text-maroon-600 mb-2">
            Browse by Deity
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {deities.map((deity) => (
              <Link
                key={deity}
                href={`/bhajans/deity/${encodeURIComponent(deity.toLowerCase().replace(/\s+/g, '-'))}`}
                className="text-sm text-saffron-700 hover:text-saffron-900 hover:underline"
              >
                {deity} Bhajans
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Bhajan List */}
      <div className="space-y-1">
        {bhajans.map((bhajan) => (
          <Link
            key={bhajan.id}
            href={`/bhajans/${bhajan.slug}`}
            className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-saffron-50 group-hover:bg-saffron-100 flex items-center justify-center transition-colors">
                {bhajan.audio_url ? (
                  <Headphones className="h-4 w-4 text-saffron-600" />
                ) : (
                  <Music className="h-4 w-4 text-saffron-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-main group-hover:text-saffron-700 truncate transition-colors">
                  {bhajan.title}
                </p>
                {bhajan.deity && (
                  <p className="text-xs text-text-muted">{bhajan.deity}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-text-light group-hover:text-saffron-500 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {bhajans.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No bhajans found{deityFilter ? ` for ${deityFilter}` : ''}.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/bhajans?page=${page - 1}${deityFilter ? `&deity=${encodeURIComponent(deityFilter)}` : ''}`}
              className="px-4 py-2 rounded-lg border border-cream-200 text-sm hover:bg-cream-50 transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/bhajans?page=${page + 1}${deityFilter ? `&deity=${encodeURIComponent(deityFilter)}` : ''}`}
              className="px-4 py-2 rounded-lg border border-cream-200 text-sm hover:bg-cream-50 transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}

      {/* Cross-link to Prayers (internal SEO linking) */}
      <div className="mt-12 p-4 rounded-lg bg-maroon-50 border border-maroon-100 text-center">
        <p className="text-sm text-maroon-700 mb-2">
          Looking for prayers and mantras?
        </p>
        <Link
          href="/prayers"
          className="inline-flex items-center gap-1 text-sm font-medium text-maroon-600 hover:text-maroon-800 hover:underline"
        >
          Browse All Prayers <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
