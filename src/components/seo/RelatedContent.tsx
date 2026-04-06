import Link from 'next/link';
import { Music, BookOpen, Headphones } from 'lucide-react';

interface RelatedItem {
  title: string;
  slug: string;
  deity?: string | null;
  audio_url?: string | null;
}

interface RelatedContentProps {
  items: RelatedItem[];
  type: 'bhajan' | 'prayer';
  heading?: string;
}

export function RelatedContent({
  items,
  type,
  heading,
}: RelatedContentProps) {
  if (items.length === 0) return null;

  const basePath = type === 'bhajan' ? '/bhajans' : '/prayers';
  const Icon = type === 'bhajan' ? Music : BookOpen;
  const defaultHeading = type === 'bhajan' ? 'Related Bhajans' : 'Related Prayers';

  return (
    <section className="mt-12 pt-8 border-t border-cream-200">
      <h2 className="text-xl font-serif font-semibold text-maroon-700 mb-4">
        {heading ?? defaultHeading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className="group flex items-center gap-3 p-3 rounded-lg border border-cream-200 hover:border-saffron-300 hover:bg-saffron-50/50 transition-all"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-cream-100 group-hover:bg-saffron-100 flex items-center justify-center transition-colors">
              {item.audio_url ? (
                <Headphones className="h-4 w-4 text-saffron-600" />
              ) : (
                <Icon className="h-4 w-4 text-maroon-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-main group-hover:text-saffron-700 truncate transition-colors">
                {item.title}
              </p>
              {item.deity && (
                <p className="text-xs text-text-muted">{item.deity}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
