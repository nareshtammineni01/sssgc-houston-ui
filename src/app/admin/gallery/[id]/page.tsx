import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AlbumForm from '../AlbumForm';

export const metadata: Metadata = { title: 'Edit Album' };

export default async function EditAlbumPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/gallery/' + params.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: album } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!album) notFound();

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', params.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/gallery" className="p-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#7A6B5F' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-h1">Edit Album</h1>
      </div>
      <AlbumForm mode="edit" album={album} photos={photos ?? []} userId={user.id} />
    </div>
  );
}
