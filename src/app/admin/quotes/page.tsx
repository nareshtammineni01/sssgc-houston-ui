'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Save, X, Quote, Calendar } from 'lucide-react';

interface DailyQuote {
  id: string;
  quote_text: string;
  source: string | null;
  display_date: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminQuotesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    quote_text: '',
    source: 'Sri Sathya Sai Baba',
    display_date: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  async function checkAdminAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?redirect=/admin/quotes'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      router.push('/dashboard');
      return;
    }

    fetchQuotes();
  }

  async function fetchQuotes() {
    setLoading(true);
    const { data } = await supabase
      .from('daily_quotes')
      .select('*')
      .order('created_at', { ascending: false });
    setQuotes(data ?? []);
    setLoading(false);
  }

  function openNew() {
    setEditingId(null);
    setForm({ quote_text: '', source: 'Sri Sathya Sai Baba', display_date: '', is_active: true });
    setShowForm(true);
  }

  function openEdit(q: DailyQuote) {
    setEditingId(q.id);
    setForm({
      quote_text: q.quote_text,
      source: q.source ?? '',
      display_date: q.display_date ?? '',
      is_active: q.is_active,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.quote_text.trim()) return;
    setSaving(true);

    const payload = {
      quote_text: form.quote_text.trim(),
      source: form.source.trim() || null,
      display_date: form.display_date || null,
      is_active: form.is_active,
    };

    if (editingId) {
      await supabase.from('daily_quotes').update(payload).eq('id', editingId);
    } else {
      await supabase.from('daily_quotes').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    fetchQuotes();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this quote?')) return;
    await supabase.from('daily_quotes').delete().eq('id', id);
    fetchQuotes();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('daily_quotes').update({ is_active: !current }).eq('id', id);
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_active: !current } : q))
    );
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8860C]/40 transition-colors';
  const inputStyle = { borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Daily Quotes</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: '#6B1D2A' }}
        >
          <Plus size={16} />
          Add Quote
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="card p-6 space-y-4" style={{ borderColor: '#E8860C' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#6B1D2A' }}>
              {editingId ? 'Edit Quote' : 'New Quote'}
            </h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>
              Quote Text *
            </label>
            <textarea
              value={form.quote_text}
              onChange={(e) => setForm({ ...form, quote_text: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle, minHeight: '100px' }}
              placeholder="Enter the quote..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>
                Source
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className={inputClass}
                style={inputStyle}
                placeholder="Sri Sathya Sai Baba"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>
                Display Date (optional)
              </label>
              <input
                type="date"
                value={form.display_date}
                onChange={(e) => setForm({ ...form, display_date: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
              <p className="text-[10px] mt-1" style={{ color: '#A89888' }}>
                Leave empty for rotation pool
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm" style={{ color: '#2C1810' }}>Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.quote_text.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ background: '#6B1D2A' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : editingId ? 'Update Quote' : 'Add Quote'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#7A6B5F' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quotes table */}
      {loading ? (
        <div className="card p-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-3 bg-gray-100 rounded w-full mb-3" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ) : quotes.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#FDF8F0' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#7A6B5F' }}>
                    Quote
                  </th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#7A6B5F' }}>
                    Source
                  </th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: '#7A6B5F' }}>
                    Date
                  </th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: '#7A6B5F' }}>
                    Active
                  </th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: '#7A6B5F' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    className="border-t"
                    style={{ borderColor: 'rgba(107,29,42,0.08)' }}
                  >
                    <td className="px-4 py-3 max-w-[300px]">
                      <p
                        className="text-[13px] italic line-clamp-2"
                        style={{ color: '#2C1810' }}
                      >
                        &ldquo;{q.quote_text}&rdquo;
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: '#7A6B5F' }}>
                      {q.source ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: '#7A6B5F' }}>
                      {q.display_date ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(q.display_date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100">
                          Rotation
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(q.id, q.is_active)}
                        className={`w-8 h-5 rounded-full relative transition-colors ${
                          q.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            q.is_active ? 'left-3.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(q)}
                          className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} style={{ color: '#E8860C' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Quote size={40} className="mx-auto mb-4" style={{ color: '#A89888' }} />
          <p style={{ color: '#7A6B5F' }}>No quotes yet. Add your first Sai Baba quote!</p>
        </div>
      )}
    </div>
  );
}
