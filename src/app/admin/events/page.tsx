import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Calendar, Repeat, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export const metadata: Metadata = { title: 'Manage Events' };

const categoryColors: Record<string, string> = {
  devotion: 'bg-saffron-50 text-saffron-600',
  educare: 'bg-maroon-50 text-maroon-600',
  seva: 'bg-gold-50 text-gold-600',
  festival: 'bg-purple-50 text-purple-600',
};

export default async function AdminEventsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/events');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: events } = await supabase
    .from('events')
    .select('id, title, category, start_time, end_time, location, is_recurring, rrule, is_cancelled, max_capacity, all_day')
    .order('start_time', { ascending: false })
    .limit(100);

  const now = new Date().toISOString();
  const upcoming = (events ?? []).filter((e) => e.start_time >= now && !e.is_cancelled).length;
  const recurring = (events ?? []).filter((e) => e.is_recurring).length;

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Events</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
            {upcoming} upcoming &middot; {recurring} recurring
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: '#6B1D2A' }}
        >
          <Plus size={18} />
          New Event
        </Link>
      </div>

      <div className="card overflow-hidden">
        {!events || events.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89888' }}>
            <p className="text-lg mb-2">No events yet</p>
            <p className="text-sm">Click &ldquo;New Event&rdquo; to create your first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FDF8F0', color: '#7A6B5F' }}>
                <th className="text-left px-4 py-3 font-medium">Event</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Date &amp; Time</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-t hover:bg-cream-50 transition-colors"
                  style={{ borderColor: 'rgba(107,29,42,0.06)' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {e.is_recurring && <Repeat size={13} className="text-saffron-500" />}
                      <span className="font-medium" style={{ color: '#2C1810' }}>{e.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[e.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                    {e.all_day
                      ? format(new Date(e.start_time), 'MMM d, yyyy') + ' (all day)'
                      : format(new Date(e.start_time), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                    {e.location ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {e.is_cancelled ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600">
                        <XCircle size={12} /> Cancelled
                      </span>
                    ) : e.start_time < now ? (
                      <span className="text-xs text-gray-400">Past</span>
                    ) : (
                      <span className="text-xs text-green-600">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/events/${e.id}`}
                      className="p-1.5 rounded-lg hover:bg-cream-100 inline-block transition-colors"
                      style={{ color: '#7A6B5F' }}
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
