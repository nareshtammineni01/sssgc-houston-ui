import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/seo';
import { SearchBox } from '@/components/search/SearchBox';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Search — Find Bhajans, Prayers & Resources',
  description:
    'Search bhajans, prayers, study circle materials, and documents at Sri Sathya Sai Center Houston.',
};

export default function SearchPage() {
  return (
    <div className="page-enter max-w-2xl mx-auto space-y-5">
      <Breadcrumbs items={[{ name: 'Search', href: '/search' }]} />

      <div>
        <h1 className="text-h1">Search</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A6B5F' }}>
          Find bhajans, prayers, and study materials instantly
        </p>
      </div>

      <SearchBox autoFocus />
    </div>
  );
}
