'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import type { GalleryAlbum, GalleryPhoto } from '@/types/database';

type AlbumCategory = NonNullable<GalleryAlbum['category']>;

interface AlbumFormProps {
  mode: 'create' | 'edit';
  album?: GalleryAlbum | null;
  photos?: GalleryPhoto[];
  userId: string;
}

export default function AlbumForm({ mode, album, photos = [], userId }: AlbumFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(album?.title ?? '');
  const [description, setDescription] = useState(album?.description ?? '');
  const [category, setCategory] = useState<AlbumCategory>(album?.category ?? 'general');
  const [eventDate, setEventDate] = useState(album?.event_date?.slice(0, 10) ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(album?.cover_image_url ?? '');
  const [isPublished, setIsPublished] = useState(album?.is_published ?? true);

  // Photo management
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [photoList, setPhotoList] = useState(photos);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description || null,
      category,
      event_date: eventDate || null,
      cover_image_url: coverImageUrl || null,
      is_published: isPublished,
    };

    let albumId = album?.id;

    if (mode === 'create') {
      const { data, error: err } = await supabase
        .from('gallery_albums')
        .insert({ ...payload, author_id: userId })
        .select('id')
        .single();

      if (err) { setError(err.message); setSaving(false); return; }
      albumId = data.id;
    } else {
      const { error: err } = await supabase
        .from('gallery_albums')
        .update(payload)
        .eq('id', album!.id);

      if (err) { setError(err.message); setSaving(false); return; }
    }

    startTransition(() => {
      router.push('/admin/gallery');
      router.refresh();
    });
  }

  async function addPhoto() {
    if (!newPhotoUrl.trim() || !album?.id) return;

    const { data, error: err } = await supabase
      .from('gallery_photos')
      .insert({
        album_id: album.id,
        image_url: newPhotoUrl.trim(),
        caption: newPhotoCaption || null,
        sort_order: photoList.length,
        uploaded_by: userId,
      })
      .select('*')
      .single();

    if (err) { setError(err.message); return; }
    setPhotoList([...photoList, data]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  }

  async function removePhoto(photoId: string) {
    const { error: err } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', photoId);

    if (err) { setError(err.message); return; }
    setPhotoList(photoList.filter((p) => p.id !== photoId));
  }

  async function handleDelete() {
    if (!album) return;
    if (!window.confirm('Delete this album and all its photos?')) return;

    setSaving(true);
    const { error: err } = await supabase.from('gallery_albums').delete().eq('id', album.id);
    if (err) { setError(err.message); setSaving(false); return; }

    startTransition(() => {
      router.push('/admin/gallery');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>Title</label>
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Akhanda Bhajan 2025"
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
          style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
        />
      </div>

      {/* Category + Date + Published */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>Category</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value as AlbumCategory)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          >
            <option value="general">General</option>
            <option value="devotion">Devotion</option>
            <option value="educare">Educare</option>
            <option value="seva">Seva</option>
            <option value="festival">Festival</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>Event Date</label>
          <input
            type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors w-full justify-center ${
              isPublished
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
            {isPublished ? 'Published' : 'Draft'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>Description</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3} placeholder="Brief description of the album..."
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
          style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
        />
      </div>

      {/* Cover image URL */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
          Cover Image URL <span className="font-normal" style={{ color: '#A89888' }}>(Supabase Storage or external)</span>
        </label>
        <input
          type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
          style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
        />
      </div>

      {/* Photos section (edit mode only) */}
      {mode === 'edit' && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2C1810' }}>
            Photos ({photoList.length})
          </label>

          {/* Existing photos */}
          {photoList.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {photoList.map((p) => (
                <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden" style={{ background: '#FDF8F0' }}>
                  <img src={p.thumbnail_url || p.image_url} alt={p.caption || ''} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {p.caption && (
                    <div className="absolute inset-x-0 bottom-0 px-1 py-0.5 text-[9px] text-white truncate" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      {p.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add photo */}
          <div className="flex gap-2">
            <input
              type="url" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="Photo URL"
              className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
            <input
              type="text" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="w-40 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
            <button
              onClick={addPhoto}
              disabled={!newPhotoUrl.trim()}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: '#6B1D2A' }}
            >
              <Upload size={16} />
            </button>
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#A89888' }}>
            Paste Supabase Storage URLs or external image links
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(107,29,42,0.1)' }}>
        <div>
          {mode === 'edit' && (
            <button onClick={handleDelete} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
              <Trash2 size={16} /> Delete Album
            </button>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: '#6B1D2A' }}>
          <Save size={16} />
          {saving ? 'Saving…' : mode === 'create' ? 'Create Album' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
