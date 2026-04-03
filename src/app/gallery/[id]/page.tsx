import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import PhotoGrid from './PhotoGrid';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('gallery_albums')
    .select('title')
    .eq('id', params.id)
    .single();
  return { title: data?.title ?? 'Album' };
}

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: album } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!album || !album.is_published) notFound();

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', params.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="page-enter space-y-5">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-1.5 text-sm hover:text-[#E8860C] transition-colors"
        style={{ color: '#7A6B5F' }}
      >
        <ArrowLeft size={16} />
        All Albums
      </Link>

      <div>
        <h1
          className="text-[22px] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, color: '#2C1810' }}
        >
          {album.title}
        </h1>
        {album.description && (
          <p className="text-[13px] mt-1" style={{ color: '#7A6B5F' }}>{album.description}</p>
        )}
        <p className="text-[11px] mt-1" style={{ color: '#A89888' }}>
          {album.event_date ? formatDate(album.event_date) : formatDate(album.created_at)}
          {' · '}
          {photos?.length ?? 0} photos
        </p>
      </div>

      <PhotoGrid photos={photos ?? []} />
    </div>
  );
}
