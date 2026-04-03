import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, Home } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import MembersTabs from './MembersTabs';

export const metadata: Metadata = { title: 'Manage Members' };

export default async function AdminMembersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/members');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) redirect('/dashboard');

  // Fetch all data in parallel
  const [membersRes, familiesRes, pendingHoursRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, city, state, role, family_id, family_role, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('families')
      .select('id, family_name, created_at')
      .order('family_name'),
    supabase
      .from('volunteer_hours')
      .select('id, user_id, project_name, hours, service_date, description, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ]);

  const members = membersRes.data ?? [];
  const families = familiesRes.data ?? [];
  const pendingHours = pendingHoursRes.data ?? [];

  // Build user name map for pending hours
  const pendingUserIds = [...new Set(pendingHours.map((h) => h.user_id))];
  let userNameMap: Record<string, string> = {};
  if (pendingUserIds.length > 0) {
    const { data: userProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', pendingUserIds);
    (userProfiles ?? []).forEach((p) => { userNameMap[p.id] = p.full_name; });
  }

  // Group members by family_id for the families tab
  const membersByFamily: Record<string, typeof members> = {};
  const unassigned: typeof members = [];
  members.forEach((m) => {
    if (m.family_id) {
      if (!membersByFamily[m.family_id]) membersByFamily[m.family_id] = [];
      membersByFamily[m.family_id].push(m);
    } else {
      unassigned.push(m);
    }
  });

  const totalMembers = members.length;
  const admins = members.filter((m) => m.role !== 'member').length;
  const totalFamilies = families.length;

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#7A6B5F' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-h1">Members &amp; Families</h1>
          <p className="text-sm" style={{ color: '#7A6B5F' }}>
            {totalMembers} members · {totalFamilies} families · {admins} admins
          </p>
        </div>
      </div>

      {/* Pending Seva Hours Review */}
      {pendingHours.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2C1810' }}>
            <Clock size={16} style={{ color: '#E8860C' }} />
            Pending Seva Hours ({pendingHours.length})
          </h2>
          <div className="space-y-2">
            {pendingHours.map((h) => (
              <div key={h.id} className="card p-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                    {userNameMap[h.user_id] ?? 'Unknown'} — {h.project_name}
                  </p>
                  <p className="text-xs" style={{ color: '#7A6B5F' }}>
                    {h.hours}h on {h.service_date}
                    {h.description && ` · ${h.description}`}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <Clock size={11} /> pending
                </span>
              </div>
            ))}
            <p className="text-[11px]" style={{ color: '#A89888' }}>
              Approve or reject hours directly in Supabase for now. Admin actions coming soon.
            </p>
          </div>
        </div>
      )}

      {/* Tabbed content */}
      <MembersTabs
        members={members}
        families={families}
        membersByFamily={membersByFamily}
        unassigned={unassigned}
      />
    </div>
  );
}
