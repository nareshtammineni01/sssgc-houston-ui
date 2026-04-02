import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'About Sri Sathya Sai Center at Houston — a spiritual community in Katy, TX.',
};

export default async function AboutPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'about')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-6">{data?.title ?? 'About Us'}</h1>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: data?.body ?? '' }}
      />
    </div>
  );
}
