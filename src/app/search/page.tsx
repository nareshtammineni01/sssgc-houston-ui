import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, Music, BookOpen, FileText, Headphones } from 'lucide-react';
import { searchResources } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';
import type { Resource } from '@/types/database';

export const revalidate = 0; // Search is dynamic — always fresh results

export const metadata: Metadata = {
  title: 'Search',
  description:
    'Search bhajans, prayers, study circle materials, and documents at Sri Sathya Sai Center Houston.',
};

const categoryConfig: Record<string, { label: string; path: string; icon: typeof Music; color: string }> = {
  bhajan: { label: 'Bhajan', path: '/bhajans', icon: Music, color: 'text-saffron-600 bg-saffron-50' },
  prayer: { label: 'Prayer', path: '/prayers', icon: BookOpen, color: 'text-maroon-600 bg-maroon-50' },
  study_circle: { label: 'Study Circle', path: '/resources', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  document: { label: 'Document', path: '/resources', icon: FileText, color: 'text-gray-600 bg-gray-100' },
  bhajan_resource: { label: 'Bhajan Resource', path: '/resources', icon: Headphones, color: 'text-gold-600 bg-gold-50' },
};

function getResourceHref(resource: Resource): string {
  if (resource.category === 'bhajan') return `/bhajans/${resource.slug}`;
  if (resource.category === 'prayer') return `/prayers/${resource.slug}`;
  return `/resources/${resource.id}`;
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  let results: Resource[] = [];
  if (query) {
    results = await searchResources(query);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Search', href: '/search' }]} />

      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-maroon-700 mb-2">
          Search
        </h1>
        <p className="text-text-muted">
          Find bhajans, prayers, and study materials
        </p>
      </header>

      {/* Search Form — server-side via query params */}
      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by title, deity, keyword..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-cream-200 bg-white focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 outline-none transition-all"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-saffron-600 text-white font-medium hover:bg-saffron-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {query && (
        <div>
          <p className="text-sm text-text-muted mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>

          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((resource) => {
                const config = categoryConfig[resource.category];
                const Icon = config?.icon ?? FileText;
                const href = getResourceHref(resource);

                return (
                  <Link
                    key={resource.id}
                    href={href}
                    className="group block p-4 rounded-lg border border-cream-200 hover:border-saffron-300 hover:bg-cream-50/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config?.color ?? 'text-gray-500 bg-gray-100'}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-main group-hover:text-saffron-700 transition-colors">
                          {resource.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cream-100 text-text-muted">
                            {config?.label ?? resource.category}
                          </span>
                          {resource.deity && (
                            <span className="text-xs text-text-muted">
                              {resource.deity}
                            </span>
                          )}
                        </div>
                        {resource.content && (
                          <p className="text-sm text-text-muted mt-1.5 line-clamp-2">
                            {resource.content.replace(/<[^>]+>/g, '').slice(0, 150)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="mb-4">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/bhajans"
                  className="text-sm text-saffron-700 hover:underline"
                >
                  Browse Bhajans
                </Link>
                <Link
                  href="/prayers"
                  className="text-sm text-maroon-700 hover:underline"
                >
                  Browse Prayers
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state — no query */}
      {!query && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto mb-3 text-cream-300" />
          <p className="text-text-muted mb-6">
            Search across all bhajans, prayers, and resources
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/bhajans"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-saffron-50 text-saffron-700 text-sm font-medium hover:bg-saffron-100 transition-colors"
            >
              <Music className="h-4 w-4" />
              Bhajans
            </Link>
            <Link
              href="/prayers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-maroon-50 text-maroon-700 text-sm font-medium hover:bg-maroon-100 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Prayers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
