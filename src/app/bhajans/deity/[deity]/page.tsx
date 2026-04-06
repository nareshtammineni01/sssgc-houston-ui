import type { Metadata } from 'next';
import Link from 'next/link';
import { Music, Headphones, ChevronRight, ArrowLeft } from 'lucide-react';
import { getAllBhajans, getDeityList } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';
import { siteConfig } from '@/lib/config';

export const revalidate = 86400;

// ─── Dynamic Metadata ───────────────────────────────────────

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

// ─── Page Component ─────────────────────────────────────────

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { name: 'Bhajans', href: '/bhajans' },
          { name: `${deityName} Bhajans`, href: `/bhajans/deity/${deity}` },
        ]}
      />

      <Link
        href="/bhajans"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-saffron-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Bhajans
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-maroon-700 mb-2">
          {deityName} Bhajans
        </h1>
        <p className="text-text-muted text-lg">
          {total} devotional songs dedicated to {deityName}
        </p>
      </header>

      {/* Other Deity Links (internal SEO linking) */}
      {allDeities.length > 1 && (
        <nav className="mb-8 p-4 rounded-lg bg-cream-50 border border-cream-200">
          <h2 className="text-sm font-semibold text-maroon-600 mb-2">
            Other Deities
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {allDeities
              .filter((d) => d.toLowerCase() !== deityName.toLowerCase())
              .map((d) => (
                <Link
                  key={d}
                  href={`/bhajans/deity/${d.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-saffron-700 hover:text-saffron-900 hover:underline"
                >
                  {d}
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
              <p className="font-medium text-text-main group-hover:text-saffron-700 truncate transition-colors">
                {bhajan.title}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-text-light group-hover:text-saffron-500 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {bhajans.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No bhajans found for {deityName}.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Link
              href={`/bhajans/deity/${deity}?page=${page - 1}`}
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
              href={`/bhajans/deity/${deity}?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-cream-200 text-sm hover:bg-cream-50 transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
