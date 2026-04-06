import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Music,
  BookOpen,
  FileText,
  Headphones,
  Search,
  ChevronRight,
} from 'lucide-react';
import { getResourceCounts, getDeityList } from '@/lib/api/resources';
import { Breadcrumbs } from '@/components/seo';

export const revalidate = 86400; // ISR: regenerate once per day

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
    color: 'bg-saffron-50 border-saffron-200 hover:border-saffron-400',
    iconColor: 'text-saffron-600',
  },
  {
    key: 'prayer',
    title: 'Prayers',
    description: 'Mantras and sacred texts for daily practice',
    href: '/prayers',
    icon: BookOpen,
    color: 'bg-maroon-50 border-maroon-200 hover:border-maroon-400',
    iconColor: 'text-maroon-600',
  },
  {
    key: 'study_circle',
    title: 'Study Circle',
    description: 'Discussion guides and reading materials',
    href: '/resources?type=study_circle',
    icon: FileText,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600',
  },
  {
    key: 'document',
    title: 'Documents',
    description: 'Center guides, schedules, and reference materials',
    href: '/resources?type=document',
    icon: FileText,
    color: 'bg-gray-50 border-gray-200 hover:border-gray-400',
    iconColor: 'text-gray-600',
  },
  {
    key: 'bhajan_resource',
    title: 'Bhajan Resources',
    description: 'Learning tools, notation, and practice audio',
    href: '/resources?type=bhajan_resource',
    icon: Headphones,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconColor: 'text-amber-600',
  },
];

export default async function ResourcesHubPage() {
  const [counts, deities] = await Promise.all([
    getResourceCounts(),
    getDeityList(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Resources', href: '/resources' }]} />

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-maroon-700 mb-2">
          Resources
        </h1>
        <p className="text-text-muted text-lg">
          Explore our collection of devotional songs, prayers, and study materials
        </p>
      </header>

      {/* Search CTA */}
      <Link
        href="/search"
        className="flex items-center gap-2 mb-8 px-4 py-3 rounded-lg border border-cream-200 bg-cream-50 hover:border-saffron-300 transition-colors text-text-muted"
      >
        <Search className="h-4 w-4" />
        <span>Search all resources...</span>
      </Link>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {sections.map((section) => {
          const Icon = section.icon;
          const count = counts[section.key] ?? 0;

          return (
            <Link
              key={section.key}
              href={section.href}
              className={`group p-5 rounded-xl border-2 transition-all ${section.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-6 w-6 ${section.iconColor}`} />
                <h2 className="text-lg font-serif font-semibold text-maroon-700">
                  {section.title}
                </h2>
              </div>
              <p className="text-sm text-text-muted mb-3">
                {section.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-muted">
                  {count.toLocaleString()} items
                </span>
                <ChevronRight className="h-4 w-4 text-text-light group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Deity Quick Links (SEO internal linking) */}
      {deities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-serif font-semibold text-maroon-700 mb-4">
            Browse Bhajans by Deity
          </h2>
          <div className="flex flex-wrap gap-2">
            {deities.map((deity) => (
              <Link
                key={deity}
                href={`/bhajans/deity/${deity.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 rounded-full text-sm bg-cream-100 text-text-main hover:bg-saffron-100 hover:text-saffron-800 transition-colors"
              >
                {deity}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About section for SEO content */}
      <section className="p-6 rounded-xl bg-cream-50 border border-cream-200">
        <h2 className="text-lg font-serif font-semibold text-maroon-700 mb-2">
          About Our Resource Library
        </h2>
        <p className="text-sm text-text-muted leading-relaxed">
          The Sri Sathya Sai Center at Houston maintains a growing collection of
          devotional resources for spiritual seekers. Our library includes over{' '}
          {(counts.bhajan ?? 0).toLocaleString()} bhajan lyrics with audio,{' '}
          {counts.prayer ?? 0} prayers and mantras, study circle discussion
          guides, and reference documents. All resources are freely available as
          part of our commitment to spiritual education and devotion.
        </p>
      </section>
    </div>
  );
}
