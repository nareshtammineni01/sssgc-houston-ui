import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCircle, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = { title: 'Member Directory' };

export default async function MemberDirectoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard/directory');

  // Fetch members who opted into the directory
  const { data: settings } = await supabase
    .from('member_directory_settings')
    .select('user_id, show_phone, show_email, show_city')
    .eq('show_in_directory', true);

  const visibleIds = (settings ?? []).map((s) => s.user_id);
  const settingsMap = Object.fromEntries((settings ?? []).map((s) => [s.user_id, s]));

  let members: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    avatar_url: string | null;
  }[] = [];

  if (visibleIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, city, state, avatar_url')
      .in('id', visibleIds)
      .order('full_name');
    members = data ?? [];
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#7A6B5F' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-h1">Member Directory</h1>
          <p className="text-sm" style={{ color: '#7A6B5F' }}>
            {members.length} members opted in
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <UserCircle size={40} className="mx-auto mb-3" />
          <p>No members have opted into the directory yet.</p>
          <p className="text-xs mt-1">You can opt in from your Settings page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const s = settingsMap[m.id];
            const initials = m.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={m.id} className="card p-4 flex items-start gap-3">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.full_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium" style={{ background: '#FFF3E0', color: '#E8860C' }}>
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>{m.full_name}</p>
                  {s?.show_email && m.email && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#7A6B5F' }}>
                      <Mail size={11} /> {m.email}
                    </p>
                  )}
                  {s?.show_phone && m.phone && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#7A6B5F' }}>
                      <Phone size={11} /> {m.phone}
                    </p>
                  )}
                  {s?.show_city && (m.city || m.state) && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#A89888' }}>
                      <MapPin size={11} /> {[m.city, m.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
