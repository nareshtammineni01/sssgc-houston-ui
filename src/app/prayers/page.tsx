import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import { getAllPrayers } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Prayers — Mantras & Sacred Texts',
  description:
    'Collection of prayers, mantras, and sacred texts at Sri Sathya Sai Center Houston. Browse prayers for daily practice and devotional gatherings.',
  openGraph: {
    title: 'Prayers — Mantras & Sacred Texts | SSSGC Houston',
    description: 'Browse prayers, mantras, and sacred texts at Sri Sathya Sai Center Houston.',
    type: 'website',
  },
};

interface PrayersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PrayersPage({ searchParams }: PrayersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { prayers, total } = await getAllPrayers({ page, pageSize: 50 });
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="page-enter space-y-5">
      <Breadcrumbs items={[{ name: 'Prayers', href: '/prayers' }]} />

      <div>
        <h1 className="text-h1">Prayers</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A6B5F' }}>
          {total} mantras and sacred texts for daily practice
        </p>
      </div>

      <Link href="/search" className="card flex items-center gap-2 px-4 py-3 group hover:border-[#E8860C] transition-colors">
        <Search size={16} style={{ color: '#A89888' }} />
        <span className="text-[13px]" style={{ color: '#A89888' }}>Search prayers by title or keyword...</span>
      </Link>

      <div className="space-y-2">
        {prayers.map((prayer) => (
          <Link
            key={prayer.id}
            href={`/prayers/${prayer.slug}`}
            className="card block px-4 py-3 group hover:border-[#E8860C] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FDF2F4' }}>
                <BookOpen size={16} style={{ color: '#6B1D2A' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium group-hover:text-[#E8860C] truncate transition-colors" style={{ color: '#2C1810' }}>
                  {prayer.title}
                </p>
                {prayer.deity && (
                  <p className="text-[11px]" style={{ color: '#A89888' }}>{prayer.deity}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {prayers.length === 0 && (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <BookOpen size={40} className="mx-auto mb-2 opacity-30" />
          <p>No prayers found.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <Link href={`/prayers?page=${page - 1}`}
              className="btn-secondary text-[13px] px-4 py-2"
              style={{ color: '#2C1810', background: 'white', borderColor: 'var(--color-border)' }}>
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-[13px]" style={{ color: '#A89888' }}>Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/prayers?page=${page + 1}`} className="btn-primary text-[13px] px-4 py-2">Next</Link>
          )}
        </div>
      )}

      <div className="card p-4 text-center">
        <p className="text-[12px] mb-1" style={{ color: '#7A6B5F' }}>Looking for devotional songs?</p>
        <Link href="/bhajans" className="text-[13px] font-medium hover:underline" style={{ color: '#E8860C' }}>
          Browse All Bhajans →
        </Link>
      </div>
    </div>
  );
}
