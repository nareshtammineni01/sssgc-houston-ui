import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photo gallery of events and activities at SSSGC Houston.',
};

const categoryColors: Record<string, string> = {
  devotion: 'bg-saffron-50 text-saffron-600',
  educare: 'bg-maroon-50 text-maroon-600',
  seva: 'bg-green-50 text-green-600',
  festival: 'bg-purple-50 text-purple-600',
  general: 'bg-gray-100 text-gray-600',
};

export default async function GalleryPage() {
  const supabase = createClient();

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('id, title, description, cover_image_url, category, event_date, created_at')
    .eq('is_published', true)
    .order('event_date', { ascending: false, nullsFirst: false });

  // Get photo counts per album
  const albumIds = (albums ?? []).map((a) => a.id);
  let photoCounts: Record<string, number> = {};
  if (albumIds.length > 0) {
    const { data: counts } = await supabase
      .from('gallery_photos')
      .select('album_id')
      .in('album_id', albumIds);

    (counts ?? []).forEach((c: { album_id: string }) => {
      photoCounts[c.album_id] = (photoCounts[c.album_id] || 0) + 1;
    });
  }

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-h1">Gallery</h1>

      {albums && albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.id}`}
              className="card group overflow-hidden hover:border-[#E8860C] transition-colors"
            >
              <div className="aspect-[4/3] relative overflow-hidden" style={{ background: '#FDF8F0' }}>
                {album.cover_image_url ? (
                  <img
                    src={album.cover_image_url}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} style={{ color: '#A89888' }} />
                  </div>
                )}
                {/* Photo count badge */}
                {photoCounts[album.id] > 0 && (
                  <span
                    className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                    style={{ background: 'rgba(0,0,0,0.55)' }}
                  >
                    {photoCounts[album.id]} photos
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {album.category && (
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${categoryColors[album.category] ?? categoryColors.general}`}
                    >
                      {album.category}
                    </span>
                  )}
                </div>
                <h3
                  className="text-[14px] font-medium group-hover:text-[#E8860C] transition-colors"
                  style={{ color: '#2C1810' }}
                >
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-[12px] mt-1 line-clamp-2" style={{ color: '#7A6B5F' }}>
                    {album.description}
                  </p>
                )}
                <p className="text-[11px] mt-2" style={{ color: '#A89888' }}>
                  {album.event_date
                    ? formatDate(album.event_date)
                    : formatDate(album.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ImageIcon size={48} className="mx-auto mb-4" style={{ color: '#A89888' }} />
          <p style={{ color: '#7A6B5F' }}>No photo albums yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
