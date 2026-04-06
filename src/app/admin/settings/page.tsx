import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import SettingsForm from './SettingsForm';

export const metadata: Metadata = {
  title: 'Settings — Admin',
};

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin/settings');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  // Fetch current settings
  const { data: searchModeSetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'search_mode')
    .single();

  const currentMode = (searchModeSetting?.value as string) ?? 'standard';

  // Check embedding stats
  const { count: totalResources } = await supabase
    .from('resources')
    .select('id', { count: 'exact', head: true });

  // We can't easily count non-null embeddings with the client, so we pass total
  // and let the client fetch the actual stats

  return (
    <div className="page-enter space-y-5">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-80"
        style={{ color: '#E8860C' }}
      >
        <ArrowLeft size={14} /> Admin Panel
      </Link>

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#FDF2F4' }}
        >
          <Settings size={20} style={{ color: '#6B1D2A' }} />
        </div>
        <div>
          <h1 className="text-h1">Settings</h1>
          <p className="text-[13px]" style={{ color: '#7A6B5F' }}>
            Configure search mode and AI features
          </p>
        </div>
      </div>

      <SettingsForm
        currentMode={currentMode}
        totalResources={totalResources ?? 0}
      />
    </div>
  );
}
