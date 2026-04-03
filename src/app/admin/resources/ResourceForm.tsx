'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Trash2, X } from 'lucide-react';
import type { Resource } from '@/types/database';

type ResourceCategory = Resource['category'];

interface ResourceFormProps {
  mode: 'create' | 'edit';
  resource?: Resource | null;
  userId: string;
}

export default function ResourceForm({ mode, resource, userId }: ResourceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(resource?.title ?? '');
  const [content, setContent] = useState(resource?.content ?? '');
  const [category, setCategory] = useState<ResourceCategory>(resource?.category ?? 'bhajan');
  const [deity, setDeity] = useState(resource?.deity ?? '');
  const [keywords, setKeywords] = useState(resource?.keywords?.join(', ') ?? '');
  const [fileUrl, setFileUrl] = useState(resource?.file_url ?? '');
  const [audioUrl, setAudioUrl] = useState(resource?.audio_url ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');

    const keywordsArr = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      content: content || null,
      category,
      deity: deity || null,
      keywords: keywordsArr.length > 0 ? keywordsArr : null,
      file_url: fileUrl || null,
      audio_url: audioUrl || null,
    };

    let result;
    if (mode === 'create') {
      result = await supabase
        .from('resources')
        .insert({ ...payload, author_id: userId });
    } else {
      result = await supabase
        .from('resources')
        .update(payload)
        .eq('id', resource!.id);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    startTransition(() => {
      router.push('/admin/resources');
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!resource) return;
    if (!window.confirm('Delete this resource permanently?')) return;

    setSaving(true);
    const { error: err } = await supabase
      .from('resources')
      .delete()
      .eq('id', resource.id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    startTransition(() => {
      router.push('/admin/resources');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ganesha Sharanam"
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
          style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
        />
      </div>

      {/* Category + Deity row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          >
            <option value="bhajan">Bhajan</option>
            <option value="prayer">Prayer</option>
            <option value="study_circle">Study Circle</option>
            <option value="document">Document</option>
            <option value="bhajan_resource">Bhajan Resource</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
            Deity <span className="font-normal" style={{ color: '#A89888' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={deity}
            onChange={(e) => setDeity(e.target.value)}
            placeholder="e.g. Ganesha, Sai Baba"
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
        </div>
      </div>

      {/* Content / Lyrics */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
          Content / Lyrics
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Paste lyrics or text content here..."
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
          style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
        />
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
          Keywords <span className="font-normal" style={{ color: '#A89888' }}>(comma-separated)</span>
        </label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. ganesha, ganesh, vinayaka, obstacle remover"
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
          style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
            File URL <span className="font-normal" style={{ color: '#A89888' }}>(PDF)</span>
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
            Audio URL
          </label>
          <input
            type="url"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: 'rgba(107,29,42,0.1)' }}
      >
        <div>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: '#6B1D2A' }}
        >
          <Save size={16} />
          {saving ? 'Saving…' : mode === 'create' ? 'Create Resource' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
