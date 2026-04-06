/**
 * JSON-LD Structured Data Components
 * Renders schema.org markup for AI crawlers and rich search results
 */

import { siteConfig } from '@/lib/config';

interface BhajanJsonLdProps {
  title: string;
  slug: string;
  content: string | null;
  deity: string | null;
  keywords: string[] | null;
  audioUrl: string | null;
  datePublished: string;
  dateModified: string;
}

export function BhajanJsonLd({
  title,
  slug,
  content,
  deity,
  keywords,
  audioUrl,
  datePublished,
  dateModified,
}: BhajanJsonLdProps) {
  const baseUrl = siteConfig.url;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: title,
    url: `${baseUrl}/bhajans/${slug}`,
    genre: 'Devotional / Bhajan',
    inLanguage: ['sa', 'hi', 'en'], // Sanskrit, Hindi, English
    description: content
      ? content.replace(/<[^>]+>/g, '').slice(0, 200)
      : `${title} — devotional bhajan lyrics at Sri Sathya Sai Center Houston`,
    datePublished,
    dateModified,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: baseUrl,
    },
  };

  if (deity) {
    jsonLd.about = {
      '@type': 'Thing',
      name: deity,
    };
  }

  if (keywords?.length) {
    jsonLd.keywords = keywords.join(', ');
  }

  if (audioUrl) {
    jsonLd.audio = {
      '@type': 'AudioObject',
      contentUrl: audioUrl,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface PrayerJsonLdProps {
  title: string;
  slug: string;
  content: string | null;
  deity: string | null;
  keywords: string[] | null;
  datePublished: string;
  dateModified: string;
}

export function PrayerJsonLd({
  title,
  slug,
  content,
  deity,
  keywords,
  datePublished,
  dateModified,
}: PrayerJsonLdProps) {
  const baseUrl = siteConfig.url;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    url: `${baseUrl}/prayers/${slug}`,
    articleSection: 'Prayers',
    inLanguage: 'en',
    description: content
      ? content.replace(/<[^>]+>/g, '').slice(0, 200)
      : `${title} — prayer text at Sri Sathya Sai Center Houston`,
    datePublished,
    dateModified,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: baseUrl,
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  };

  if (deity) {
    jsonLd.about = { '@type': 'Thing', name: deity };
  }

  if (keywords?.length) {
    jsonLd.keywords = keywords.join(', ');
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; href: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = siteConfig.url;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  description?: string;
}

export function OrganizationJsonLd({
  name = siteConfig.name,
  url = siteConfig.url,
  description = siteConfig.description,
}: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ReligiousOrganization',
    name,
    url,
    description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Katy',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
