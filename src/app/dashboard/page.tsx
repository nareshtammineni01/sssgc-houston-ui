import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserCircle, Calendar, BookOpen, Heart, Users, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Real stats
  const now = new Date().toISOString();

  const [eventsRes, favoritesRes, sevaRes] = await Promise.all([
    supabase
      .from('event_signups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('volunteer_hours')
      .select('hours')
      .eq('user_id', user.id)
      .eq('status', 'approved'),
  ]);

  const upcomingEvents = eventsRes.count ?? 0;
  const savedResources = favoritesRes.count ?? 0;
  const sevaHours = (sevaRes.data ?? []).reduce((sum, r) => sum + r.hours, 0);

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-4">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-saffron-100 flex items-center justify-center">
            <UserCircle size={32} className="text-saffron-500" />
          </div>
        )}
        <div>
          <h1 className="text-h2">Welcome, {profile?.full_name ?? 'Member'}</h1>
          <p className="text-sm text-gray-500">{profile?.email}</p>
        </div>
      </div>

      {/* Quick stats / actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/calendar" className="card p-5 flex items-center gap-4 hover:border-[#E8860C] transition-colors">
          <div className="w-12 h-12 bg-saffron-50 rounded-xl flex items-center justify-center">
            <Calendar size={24} className="text-saffron-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
            <p className="text-xs text-gray-500">Event RSVPs</p>
          </div>
        </Link>
        <Link href="/resources" className="card p-5 flex items-center gap-4 hover:border-[#E8860C] transition-colors">
          <div className="w-12 h-12 bg-maroon-50 rounded-xl flex items-center justify-center">
            <BookOpen size={24} className="text-maroon-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{savedResources}</p>
            <p className="text-xs text-gray-500">Saved Resources</p>
          </div>
        </Link>
        <Link href="/dashboard/seva-hours" className="card p-5 flex items-center gap-4 hover:border-[#E8860C] transition-colors">
          <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center">
            <Heart size={24} className="text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{sevaHours}</p>
            <p className="text-xs text-gray-500">Seva Hours</p>
          </div>
        </Link>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href="/dashboard/directory" className="card px-4 py-3 flex items-center gap-2 text-sm hover:border-[#E8860C] transition-colors" style={{ color: '#7A6B5F' }}>
          <Users size={16} /> Member Directory
        </Link>
        <Link href="/dashboard/seva-hours" className="card px-4 py-3 flex items-center gap-2 text-sm hover:border-[#E8860C] transition-colors" style={{ color: '#7A6B5F' }}>
          <Clock size={16} /> Log Seva Hours
        </Link>
      </div>

      {/* Profile details */}
      <div className="card p-6">
        <h2 className="text-h3 mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Full Name</span>
            <p className="font-medium text-gray-900">{profile?.full_name ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-400">Email</span>
            <p className="font-medium text-gray-900">{profile?.email ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-400">Phone</span>
            <p className="font-medium text-gray-900">{profile?.phone ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-400">City / State</span>
            <p className="font-medium text-gray-900">
              {[profile?.city, profile?.state].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
