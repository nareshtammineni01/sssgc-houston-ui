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

export function RelatedContent({ items, type, heading }: RelatedContentProps) {
  if (items.length === 0) return null;

  const basePath = type === 'bhajan' ? '/bhajans' : '/prayers';
  const Icon = type === 'bhajan' ? Music : BookOpen;
  const defaultHeading = type === 'bhajan' ? 'Related Bhajans' : 'Related Prayers';

  return (
    <div className="pt-4" style={{ borderTop: '1px solid rgba(107,29,42,0.1)' }}>
      <p
        className="text-[16px] mb-3"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#6B1D2A' }}
      >
        {heading ?? defaultHeading}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className="card flex items-center gap-3 px-4 py-3 group hover:border-[#E8860C] transition-colors"
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: type === 'bhajan' ? '#FFF8EB' : '#FDF2F4' }}
            >
              {item.audio_url ? (
                <Headphones size={16} style={{ color: '#E8860C' }} />
              ) : (
                <Icon size={16} style={{ color: type === 'bhajan' ? '#C46F0A' : '#6B1D2A' }} />
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-[13px] font-medium group-hover:text-[#E8860C] truncate transition-colors"
                style={{ color: '#2C1810' }}
              >
                {item.title}
              </p>
              {item.deity && (
                <p className="text-[11px]" style={{ color: '#A89888' }}>{item.deity}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
