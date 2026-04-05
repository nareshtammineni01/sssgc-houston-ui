import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ExportCsvButton } from './ExportCsvButton';

export const metadata: Metadata = { title: 'Event RSVPs' };

interface SignupRow {
  id: string;
  status: string;
  guest_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export default async function EventSignupsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Auth + role check
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

  // Fetch the event
  const { data: event } = await supabase
    .from('events')
    .select('id, title, start_time, end_time, location, category, max_capacity, all_day')
    .eq('id', params.id)
    .single();

  if (!event) redirect('/admin/events');

  // Fetch all signups with profile info
  const { data: signups } = await supabase
    .from('event_signups')
    .select('id, status, guest_count, created_at, profiles(full_name, email, phone)')
    .eq('event_id', params.id)
    .order('created_at', { ascending: true });

  const allSignups = (signups ?? []) as unknown as SignupRow[];
  const confirmed = allSignups.filter((s) => s.status === 'confirmed');
  const cancelled = allSignups.filter((s) => s.status === 'cancelled');
  const totalHeadcount = confirmed.reduce((sum, s) => sum + (s.guest_count ?? 1), 0);

  // Prepare CSV data for client-side export
  const csvRows = confirmed.map((s) => ({
    name: s.profiles?.full_name ?? 'Unknown',
    email: s.profiles?.email ?? '',
    phone: s.profiles?.phone ?? '',
    guests: s.guest_count ?? 1,
    status: s.status,
    rsvpDate: s.created_at ? format(new Date(s.created_at), 'MMM d, yyyy h:mm a') : '',
  }));

  const categoryColors: Record<string, string> = {
    devotion: 'bg-saffron-50 text-saffron-600',
    educare: 'bg-maroon-50 text-maroon-600',
    seva: 'bg-gold-50 text-gold-600',
    festival: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors hover:text-[#E8860C]"
          style={{ color: '#7A6B5F' }}
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-h1">{event.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: '#7A6B5F' }}>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[event.category] ?? 'bg-gray-100 text-gray-600'}`}>
                {event.category}
              </span>
              <span>
                {event.all_day
                  ? format(new Date(event.start_time), 'MMM d, yyyy') + ' (all day)'
                  : format(new Date(event.start_time), 'MMM d, yyyy h:mm a')}
              </span>
              {event.location && <span>· {event.location}</span>}
            </div>
          </div>

          {/* Export button */}
          <ExportCsvButton
            eventTitle={event.title}
            csvRows={csvRows}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: '#A89888' }}>
            RSVPs
          </p>
          <p
            className="text-[28px] mt-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#6B1D2A' }}
          >
            {confirmed.length}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: '#A89888' }}>
            Total Headcount
          </p>
          <p
            className="text-[28px] mt-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#E8860C' }}
          >
            {totalHeadcount}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: '#A89888' }}>
            Capacity
          </p>
          <p
            className="text-[28px] mt-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#2C1810' }}
          >
            {event.max_capacity ?? '∞'}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: '#A89888' }}>
            Cancelled
          </p>
          <p
            className="text-[28px] mt-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#7A6B5F' }}
          >
            {cancelled.length}
          </p>
        </div>
      </div>

      {/* Signups table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FDF8F0' }}>
          <h2 className="text-sm font-medium flex items-center gap-2" style={{ color: '#2C1810' }}>
            <Users size={16} style={{ color: '#E8860C' }} />
            Confirmed Attendees ({confirmed.length})
          </h2>
        </div>

        {confirmed.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89888' }}>
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No RSVPs yet for this event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(107,29,42,0.08)', color: '#7A6B5F' }}>
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-center px-4 py-3 font-medium">Guests</th>
                  <th className="text-left px-4 py-3 font-medium">RSVP Date</th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((signup, idx) => (
                  <tr
                    key={signup.id}
                    className="border-t hover:bg-cream-50 transition-colors"
                    style={{ borderColor: 'rgba(107,29,42,0.06)' }}
                  >
                    <td className="px-4 py-3" style={{ color: '#A89888' }}>
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: '#2C1810' }}>
                      {signup.profiles?.full_name ?? 'Unknown'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                      {signup.profiles?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                      {signup.profiles?.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold"
                        style={{
                          background: (signup.guest_count ?? 1) > 1 ? '#FFF3E0' : '#F5F5F5',
                          color: (signup.guest_count ?? 1) > 1 ? '#E8860C' : '#7A6B5F',
                        }}
                      >
                        {signup.guest_count ?? 1}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                      {signup.created_at
                        ? format(new Date(signup.created_at), 'MMM d, yyyy h:mm a')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#FDF8F0', borderTop: '2px solid rgba(107,29,42,0.1)' }}>
                  <td colSpan={4} className="px-4 py-3 text-right font-medium text-sm" style={{ color: '#2C1810' }}>
                    Total Headcount
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      style={{ background: '#E8860C', color: 'white' }}
                    >
                      {totalHeadcount}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
