import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Pin } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  devotion: 'Devotion',
  educare: 'Educare',
  seva: 'Seva',
  general: 'General',
};

const categoryColors: Record<string, string> = {
  devotion: '#E8860C',
  educare: '#3B82F6',
  seva: '#22C55E',
  general: '#A89888',
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('announcements')
    .select('title')
    .eq('id', params.id)
    .single();

  return { title: data?.title ?? 'Announcement' };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: announcement } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!announcement || !announcement.published_at) notFound();

  return (
    <div className="page-enter space-y-5 max-w-3xl">
      {/* Back link */}
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1.5 text-sm hover:text-[#E8860C] transition-colors"
        style={{ color: '#7A6B5F' }}
      >
        <ArrowLeft size={16} />
        All Announcements
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full capitalize font-medium"
            style={{
              background: `${categoryColors[announcement.category] ?? categoryColors.general}15`,
              color: categoryColors[announcement.category] ?? categoryColors.general,
            }}
          >
            {categoryLabels[announcement.category] ?? announcement.category}
          </span>
          {announcement.is_pinned && (
            <span className="flex items-center gap-1 text-[11px] text-saffron-500">
              <Pin size={12} /> Pinned
            </span>
          )}
        </div>
        <h1
          className="text-[22px] leading-tight"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            color: '#2C1810',
          }}
        >
          {announcement.title}
        </h1>
        <p className="text-[12px] mt-1.5" style={{ color: '#A89888' }}>
          Published {format(new Date(announcement.published_at), 'MMMM d, yyyy \'at\' h:mm a')}
        </p>
      </div>

      {/* Body */}
      <div
        className="tiptap card p-6"
        dangerouslySetInnerHTML={{ __html: announcement.body }}
      />
    </div>
  );
}
