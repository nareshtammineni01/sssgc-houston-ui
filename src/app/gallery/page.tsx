import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photo gallery of events and activities at SSSGC Houston.',
};

export default async function GalleryPage() {
  const supabase = createClient();

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('id, title, description, cover_url, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-h1">Gallery</h1>

      {albums && albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <a
              key={album.id}
              href={`/gallery/${album.id}`}
              className="card group overflow-hidden"
            >
              <div className="aspect-[4/3] bg-cream-200 relative overflow-hidden">
                {album.cover_url ? (
                  <img
                    src={album.cover_url}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 group-hover:text-saffron-600 transition-colors">
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {album.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">{formatDate(album.created_at)}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No photo albums yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
