import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AnnouncementForm from '../AnnouncementForm';

export const metadata: Metadata = {
  title: 'Edit Announcement',
};

export default async function EditAnnouncementPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/announcements/' + params.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: announcement } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!announcement) notFound();

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/announcements"
          className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
          style={{ color: '#7A6B5F' }}
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-h1">Edit Announcement</h1>
      </div>

      <AnnouncementForm mode="edit" announcement={announcement} userId={user.id} />
    </div>
  );
}
