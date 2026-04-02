import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "I'm New Here",
  description: 'New to Sri Sathya Sai Center Houston? Here is what to expect.',
};

export default async function NewHerePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'new-here')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-6">{data?.title ?? "I'm New Here"}</h1>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: data?.body ?? '' }}
      />
    </div>
  );
}
