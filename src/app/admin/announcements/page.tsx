import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pin, Clock, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Manage Announcements',
};

const categoryColors: Record<string, string> = {
  devotion: 'bg-saffron-50 text-saffron-600',
  educare: 'bg-blue-50 text-blue-600',
  seva: 'bg-green-50 text-green-600',
  general: 'bg-gray-100 text-gray-600',
};

export default async function AdminAnnouncementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/announcements');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, category, is_pinned, published_at, expires_at, created_at')
    .order('created_at', { ascending: false });

  const now = new Date().toISOString();

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Announcements</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
            Create, edit, and manage center announcements
          </p>
        </div>
        <Link
          href="/admin/announcements/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
          style={{ background: '#6B1D2A' }}
        >
          <Plus size={18} />
          New Announcement
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total',
            value: announcements?.length ?? 0,
          },
          {
            label: 'Published',
            value: announcements?.filter(
              (a) => a.published_at && a.published_at <= now && (!a.expires_at || a.expires_at > now)
            ).length ?? 0,
          },
          {
            label: 'Pinned',
            value: announcements?.filter((a) => a.is_pinned).length ?? 0,
          },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: '#2C1810' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#A89888' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {!announcements || announcements.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89888' }}>
            <p className="text-lg mb-2">No announcements yet</p>
            <p className="text-sm">Click &ldquo;New Announcement&rdquo; to create your first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FDF8F0', color: '#7A6B5F' }}>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => {
                const isPublished = a.published_at && a.published_at <= now;
                const isExpired = a.expires_at && a.expires_at <= now;
                const isDraft = !a.published_at;

                let statusLabel = 'Draft';
                let statusClass = 'text-gray-500 bg-gray-100';
                if (isExpired) {
                  statusLabel = 'Expired';
                  statusClass = 'text-red-600 bg-red-50';
                } else if (isPublished) {
                  statusLabel = 'Published';
                  statusClass = 'text-green-600 bg-green-50';
                }

                return (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-cream-50 transition-colors"
                    style={{ borderColor: 'rgba(107,29,42,0.06)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {a.is_pinned && <Pin size={14} className="text-saffron-500" />}
                        <span className="font-medium" style={{ color: '#2C1810' }}>{a.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[a.category] ?? categoryColors.general}`}>
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                      {format(new Date(a.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/announcements/${a.id}`}
                          className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
                          style={{ color: '#7A6B5F' }}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <Link
                          href={`/announcements/${a.id}`}
                          className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors"
                          style={{ color: '#7A6B5F' }}
                          title="Preview"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
