import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Manage Gallery' };

export default async function AdminGalleryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/gallery');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) redirect('/dashboard');

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('id, title, category, cover_image_url, is_published, event_date, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Gallery</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
            {albums?.length ?? 0} albums
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: '#6B1D2A' }}
        >
          <Plus size={18} />
          New Album
        </Link>
      </div>

      {!albums || albums.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <ImageIcon size={40} className="mx-auto mb-3" />
          <p>No albums yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="card overflow-hidden">
              <div className="aspect-[16/9] relative" style={{ background: '#FDF8F0' }}>
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} style={{ color: '#A89888' }} />
                  </div>
                )}
                <span
                  className="absolute top-2 right-2 p-1 rounded-full"
                  style={{ background: album.is_published ? 'rgba(34,197,94,0.9)' : 'rgba(156,163,175,0.9)' }}
                >
                  {album.is_published ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium" style={{ color: '#2C1810' }}>{album.title}</h3>
                  <p className="text-[11px]" style={{ color: '#A89888' }}>
                    {album.event_date ? formatDate(album.event_date) : formatDate(album.created_at)}
                  </p>
                </div>
                <Link
                  href={`/admin/gallery/${album.id}`}
                  className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
                  style={{ color: '#7A6B5F' }}
                >
                  <Pencil size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
