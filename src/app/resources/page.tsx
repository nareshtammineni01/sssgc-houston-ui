import type { Metadata } from 'next';
import Link from 'next/link';
import { Music, BookOpen, FileText, Headphones } from 'lucide-react';
import { getResourceCounts, getDeityList } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';
import { SearchBox } from '@/components/search/SearchBox';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Resources — Bhajans, Prayers & Study Materials',
  description:
    'Browse bhajans, prayers, study circle materials, and documents at Sri Sathya Sai Center Houston. 700+ devotional songs with lyrics and audio.',
  openGraph: {
    title: 'Resources | SSSGC Houston',
    description:
      'Bhajans, prayers, study materials, and documents at Sri Sathya Sai Center Houston.',
    type: 'website',
  },
};

const sections = [
  {
    key: 'bhajan',
    title: 'Bhajans',
    description: 'Devotional songs with lyrics and audio',
    href: '/bhajans',
    icon: Music,
    iconBg: '#FFF8EB',
    iconColor: '#E8860C',
  },
  {
    key: 'prayer',
    title: 'Prayers',
    description: 'Mantras and sacred texts for daily practice',
    href: '/prayers',
    icon: BookOpen,
    iconBg: '#FDF2F4',
    iconColor: '#6B1D2A',
  },
  {
    key: 'study_circle',
    title: 'Study Circle',
    description: 'Discussion guides and reading materials',
    href: '/resources?type=study_circle',
    icon: FileText,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    key: 'document',
    title: 'Documents',
    description: 'Center guides, schedules, and reference materials',
    href: '/resources?type=document',
    icon: FileText,
    iconBg: '#F3F4F6',
    iconColor: '#6B7280',
  },
  {
    key: 'bhajan_resource',
    title: 'Bhajan Resources',
    description: 'Learning tools, notation, and practice audio',
    href: '/resources?type=bhajan_resource',
    icon: Headphones,
    iconBg: '#FFF8EB',
    iconColor: '#C46F0A',
  },
];

export default async function ResourcesHubPage() {
  const [counts, deities] = await Promise.all([
    getResourceCounts(),
    getDeityList(),
  ]);

  return (
    <div className="page-enter space-y-5">
      <Breadcrumbs items={[{ name: 'Resources', href: '/resources' }]} />

      <div>
        <h1 className="text-h1">Resources</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A6B5F' }}>
          Explore our collection of devotional songs, prayers, and study materials
        </p>
      </div>

      {/* Inline Search */}
      <SearchBox />

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const count = counts[section.key] ?? 0;

          return (
            <Link
              key={section.key}
              href={section.href}
              className="card p-5 group hover:border-[#E8860C] transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: section.iconBg }}
                >
                  <Icon size={18} style={{ color: section.iconColor }} />
                </div>
                <div
                  className="text-[16px]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: '#6B1D2A' }}
                >
                  {section.title}
                </div>
              </div>
              <p className="text-[12px] mb-3" style={{ color: '#7A6B5F' }}>
                {section.description}
              </p>
              <span className="text-[13px] font-medium" style={{ color: '#A89888' }}>
                {count.toLocaleString()} items
              </span>
            </Link>
          );
        })}
      </div>

      {/* Deity Quick Links */}
      {deities.length > 0 && (
        <div className="card p-4">
          <p className="text-[12px] font-medium mb-2" style={{ color: '#6B1D2A' }}>
            Browse Bhajans by Deity
          </p>
          <div className="flex flex-wrap gap-2">
            {deities.map((deity) => (
              <Link
                key={deity}
                href={`/bhajans/deity/${deity.toLowerCase().replace(/\s+/g, '-')}`}
                className="filter-chip"
              >
                {deity}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* About section for SEO */}
      <div
        className="rounded-xl p-5 border-l-4"
        style={{
          background: 'white',
          borderColor: '#E8860C',
          borderTop: '1px solid rgba(107,29,42,0.1)',
          borderRight: '1px solid rgba(107,29,42,0.1)',
          borderBottom: '1px solid rgba(107,29,42,0.1)',
        }}
      >
        <p
          className="text-[14px] leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#2C1810' }}
        >
          The Sri Sathya Sai Center at Houston maintains a growing collection of
          devotional resources for spiritual seekers. Our library includes over{' '}
          {(counts.bhajan ?? 0).toLocaleString()} bhajan lyrics with audio,{' '}
          {counts.prayer ?? 0} prayers and mantras, study circle discussion
          guides, and reference documents. All resources are freely available as
          part of our commitment to spiritual education and devotion.
        </p>
      </div>
    </div>
  );
}
