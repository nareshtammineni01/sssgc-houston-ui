import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserCircle, Calendar, BookOpen, Heart } from 'lucide-react';

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
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-saffron-50 rounded-xl flex items-center justify-center">
            <Calendar size={24} className="text-saffron-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">Upcoming Events</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-maroon-50 rounded-xl flex items-center justify-center">
            <BookOpen size={24} className="text-maroon-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">Saved Resources</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center">
            <Heart size={24} className="text-gold-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">Seva Hours</p>
          </div>
        </div>
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
