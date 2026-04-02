import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';
import { Pin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Announcements',
};

const categoryColors: Record<string, string> = {
  devotion: '#E8860C',
  educare: '#3B82F6',
  seva: '#22C55E',
  general: '#A89888',
};

export default async function AnnouncementsPage() {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body_plain, category, is_pinned, published_at')
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false });

  return (
    <div className="page-enter space-y-5">
      <h1 className="text-h1">Announcements</h1>

      {!announcements || announcements.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <p className="text-lg mb-1">No announcements right now</p>
          <p className="text-sm">Check back soon for updates from the center.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="card block p-5 group hover:border-[#E8860C] transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Category dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: categoryColors[a.category] ?? categoryColors.general }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-[15px] font-medium group-hover:text-[#E8860C] transition-colors"
                      style={{ color: '#2C1810' }}
                    >
                      {a.title}
                    </h2>
                    {a.is_pinned && <Pin size={13} className="text-saffron-500 flex-shrink-0" />}
                  </div>
                  {a.body_plain && (
                    <p className="text-[12px] mt-1 line-clamp-2" style={{ color: '#7A6B5F' }}>
                      {a.body_plain}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: `${categoryColors[a.category] ?? categoryColors.general}15`,
                        color: categoryColors[a.category] ?? categoryColors.general,
                      }}
                    >
                      {a.category}
                    </span>
                    <span className="text-[11px]" style={{ color: '#A89888' }}>
                      {a.published_at ? format(new Date(a.published_at), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
