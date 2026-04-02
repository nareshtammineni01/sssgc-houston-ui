import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default async function PrivacyPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'privacy')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-6">{data?.title ?? 'Privacy Policy'}</h1>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: data?.body ?? '' }}
      />
    </div>
  );
}
