import type { MetadataRoute } from 'next';
import { getAllResourceSlugs, getDeityList } from '@/lib/api/resources';
import { siteConfig } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // ─── Static pages ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/bhajans`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/prayers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/new-here`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/service`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // ─── Dynamic resource pages ───────────────────────────────
  const slugs = await getAllResourceSlugs();

  const categoryToPath: Record<string, string> = {
    bhajan: 'bhajans',
    prayer: 'prayers',
  };

  const resourcePages: MetadataRoute.Sitemap = slugs
    .filter((item) => categoryToPath[item.category]) // only bhajans and prayers get dedicated routes
    .map((item) => ({
      url: `${baseUrl}/${categoryToPath[item.category]}/${item.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // ─── Deity category pages ─────────────────────────────────
  const deities = await getDeityList();
  const deityPages: MetadataRoute.Sitemap = deities.map((deity) => ({
    url: `${baseUrl}/bhajans/deity/${deity.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...deityPages, ...resourcePages];
}
