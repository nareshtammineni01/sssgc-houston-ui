/**
 * Site configuration — single source of truth for URLs and metadata.
 *
 * Uses NEXT_PUBLIC_SITE_URL env variable so the same codebase works
 * across environments (Vercel preview, staging, custom domain).
 *
 * Set in Vercel dashboard → Settings → Environment Variables:
 *   NEXT_PUBLIC_SITE_URL = https://sssgc-houston-ui.vercel.app   (now)
 *   NEXT_PUBLIC_SITE_URL = https://sssgc-houston.org              (later)
 */

export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sssgc-houston-ui.vercel.app',
  name: 'Sri Sathya Sai Center at Houston',
  shortName: 'SSSGC Houston',
  description:
    'A spiritual community in Katy, TX inspired by the teachings of Sri Sathya Sai Baba. Devotion, Educare, Seva — open to all.',
} as const;
