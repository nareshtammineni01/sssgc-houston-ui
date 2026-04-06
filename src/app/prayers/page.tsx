import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Search, ChevronRight } from 'lucide-react';
import { getAllPrayers } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';

export const revalidate = 86400; // ISR: regenerate once per day

export const metadata: Metadata = {
  title: 'Prayers — Mantras & Sacred Texts',
  description:
    'Collection of prayers, mantras, and sacred texts at Sri Sathya Sai Center Houston. Browse prayers for daily practice and devotional gatherings.',
  openGraph: {
    title: 'Prayers — Mantras & Sacred Texts | SSSGC Houston',
    description:
      'Browse prayers, mantras, and sacred texts at Sri Sathya Sai Center Houston.',
    type: 'website',
  },
};

interface PrayersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PrayersPage({ searchParams }: PrayersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { prayers, total } = await getAllPrayers({ page, pageSize: 50 });
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Prayers', href: '/prayers' }]} />

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-maroon-700 mb-2">
          Prayers
        </h1>
        <p className="text-text-muted text-lg">
          {total} mantras and sacred texts for daily practice
        </p>
      </header>

      {/* Search CTA */}
      <Link
        href="/search"
        className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg border border-cream-200 bg-cream-50 hover:border-saffron-300 transition-colors text-text-muted"
      >
        <Search className="h-4 w-4" />
        <span>Search prayers by title or keyword...</span>
      </Link>

      {/* Prayer List */}
      <div className="space-y-1">
        {prayers.map((prayer) => (
          <Link
            key={prayer.id}
            href={`/prayers/${prayer.slug}`}
            className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-maroon-50 group-hover:bg-maroon-100 flex items-center justify-center transition-colors">
                <BookOpen className="h-4 w-4 text-maroon-500" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-main group-hover:text-maroon-700 truncate transition-colors">
                  {prayer.title}
                </p>
                {prayer.deity && (
                  <p className="text-xs text-text-muted">{prayer.deity}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-text-light group-hover:text-maroon-500 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {prayers.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No prayers found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/prayers?page=${page - 1}`}
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
              href={`/prayers?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-cream-200 text-sm hover:bg-cream-50 transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}

      {/* Cross-link to Bhajans */}
      <div className="mt-12 p-4 rounded-lg bg-saffron-50 border border-saffron-100 text-center">
        <p className="text-sm text-saffron-800 mb-2">
          Looking for devotional songs?
        </p>
        <Link
          href="/bhajans"
          className="inline-flex items-center gap-1 text-sm font-medium text-saffron-700 hover:text-saffron-900 hover:underline"
        >
          Browse All Bhajans <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
