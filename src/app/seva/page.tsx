import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Seva (Service)',
  description: 'Seva service activities at Sri Sathya Sai Center Houston.',
};

export default async function SevaPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'seva')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-6">{data?.title ?? 'Seva (Service)'}</h1>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: data?.body ?? '' }}
      />
    </div>
  );
}
