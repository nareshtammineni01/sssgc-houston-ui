import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../EventForm';

export const metadata: Metadata = { title: 'Edit Event' };

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/events/' + params.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/events" className="p-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#7A6B5F' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-h1">Edit Event</h1>
      </div>
      <EventForm mode="edit" event={event} userId={user.id} />
    </div>
  );
}
