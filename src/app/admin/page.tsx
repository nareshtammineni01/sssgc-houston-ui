import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Megaphone,
  BookOpen,
  Calendar,
  Image,
  Users,
  Quote,
  BarChart3,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Panel',
};

const adminModules = [
  {
    title: 'Announcements',
    desc: 'Create, edit, and publish news items',
    href: '/admin/announcements',
    icon: Megaphone,
    color: 'bg-saffron-50 text-saffron-500',
  },
  {
    title: 'Resources',
    desc: 'Manage bhajans, documents, and media',
    href: '/admin/resources',
    icon: BookOpen,
    color: 'bg-maroon-50 text-maroon-600',
  },
  {
    title: 'Events',
    desc: 'Schedule and manage calendar events',
    href: '/admin/events',
    icon: Calendar,
    color: 'bg-gold-50 text-gold-500',
  },
  {
    title: 'Gallery',
    desc: 'Upload and organize photo albums',
    href: '/admin/gallery',
    icon: Image,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    title: 'Members',
    desc: 'View and manage member accounts',
    href: '/admin/members',
    icon: Users,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'Daily Quotes',
    desc: 'Add and schedule Swami quotes',
    href: '/admin/quotes',
    icon: Quote,
    color: 'bg-purple-50 text-purple-500',
  },
];

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  // Fetch real counts
  const [membersRes, familiesRes, eventsRes, resourcesRes, announcementsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('families').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('announcements').select('id', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Members', value: membersRes.count ?? 0, icon: Users },
    { label: 'Families', value: familiesRes.count ?? 0, icon: Users },
    { label: 'Events', value: eventsRes.count ?? 0, icon: Calendar },
    { label: 'Resources', value: resourcesRes.count ?? 0, icon: BookOpen },
    { label: 'Announcements', value: announcementsRes.count ?? 0, icon: Megaphone },
  ];

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Admin Panel</h1>
        <span className="badge-maroon capitalize">{profile.role.replace('_', ' ')}</span>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <stat.icon size={20} className="text-gray-400" />
            <div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((mod) => (
          <Link key={mod.href} href={mod.href} className="card p-6 group">
            <div className={`w-12 h-12 ${mod.color} rounded-xl flex items-center justify-center mb-4`}>
              <mod.icon size={24} />
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-saffron-600 transition-colors">
              {mod.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{mod.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
