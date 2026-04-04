'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RichTextEditor } from '@/components/editor';
import { Pin, Send, Save, Trash2, Mail, MessageSquare } from 'lucide-react';
import { FloatingInput, FloatingSelect } from '@/components/ui/FloatingField';
import type { Announcement } from '@/types/database';

type AnnouncementCategory = 'devotion' | 'educare' | 'seva' | 'general';

interface AnnouncementFormProps {
  mode: 'create' | 'edit';
  announcement?: Announcement | null;
  userId: string;
}

export default function AnnouncementForm({
  mode,
  announcement,
  userId,
}: AnnouncementFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(announcement?.title ?? '');
  const [body, setBody] = useState(announcement?.body ?? '');
  const [category, setCategory] = useState<AnnouncementCategory>(
    announcement?.category ?? 'general'
  );
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned ?? false);
  const [notifyEmail, setNotifyEmail] = useState(announcement?.notify_email ?? false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(announcement?.notify_whatsapp ?? false);
  const [expiresAt, setExpiresAt] = useState(
    announcement?.expires_at ? announcement.expires_at.slice(0, 16) : ''
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(publish: boolean) {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim() || body === '<p></p>') {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      body,
      category,
      is_pinned: isPinned,
      notify_email: notifyEmail,
      notify_whatsapp: notifyWhatsapp,
      published_at: publish ? new Date().toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    let result;

    if (mode === 'create') {
      result = await supabase
        .from('announcements')
        .insert({ ...payload, author_id: userId });
    } else {
      result = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', announcement!.id);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    startTransition(() => {
      router.push('/admin/announcements');
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!announcement) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this announcement? This cannot be undone.'
    );
    if (!confirmed) return;

    setSaving(true);
    const { error: err } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcement.id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    startTransition(() => {
      router.push('/admin/announcements');
      router.refresh();
    });
  }

  const isPublished = !!announcement?.published_at;

  return (
    <div className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Title */}
      <FloatingInput label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* Category + Pinned row */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <FloatingSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}>
            <option value="general">General</option>
            <option value="devotion">Devotion</option>
            <option value="educare">Educare</option>
            <option value="seva">Seva</option>
          </FloatingSelect>
        </div>

        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            isPinned
              ? 'bg-saffron-50 border-saffron-300 text-saffron-700'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Pin size={16} className={isPinned ? 'text-saffron-500' : ''} />
          {isPinned ? 'Pinned' : 'Pin'}
        </button>
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C1810' }}>
          Content
        </label>
        <RichTextEditor content={body} onChange={setBody} />
      </div>

      {/* Expiration */}
      <div className="max-w-xs">
        <FloatingInput label="Expires at (optional)" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </div>

      {/* Notification toggles */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#2C1810' }}>
          Notifications
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="rounded border-gray-300 text-saffron-500 focus:ring-saffron-300"
            />
            <Mail size={16} style={{ color: '#7A6B5F' }} />
            <span className="text-sm" style={{ color: '#2C1810' }}>Email subscribers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyWhatsapp}
              onChange={(e) => setNotifyWhatsapp(e.target.checked)}
              className="rounded border-gray-300 text-saffron-500 focus:ring-saffron-300"
            />
            <MessageSquare size={16} style={{ color: '#7A6B5F' }} />
            <span className="text-sm" style={{ color: '#2C1810' }}>WhatsApp group</span>
          </label>
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

        <div className="flex items-center gap-3">
          {/* Save as Draft */}
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-cream-50 disabled:opacity-50"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Draft'}
          </button>

          {/* Publish */}
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: '#6B1D2A' }}
          >
            <Send size={16} />
            {saving ? 'Publishing…' : isPublished ? 'Update & Publish' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
