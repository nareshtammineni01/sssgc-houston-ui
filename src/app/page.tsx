import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/config';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  GraduationCap,
  HandHeart,
  ArrowRight,
} from 'lucide-react';
import { LiveTicker } from '@/components/home/LiveTicker';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Sri Sathya Sai Center at Houston — Devotion, Educare, Seva',
  description:
    'A spiritual community in Katy, TX inspired by the teachings of Sri Sathya Sai Baba. Weekly bhajans, prayers, children\'s educare, and community seva. Open to all.',
  keywords: [
    'Sri Sathya Sai Baba',
    'Sai Center Houston',
    'SSSGC Houston',
    'bhajans',
    'devotional songs',
    'prayers',
    'Katy TX',
    'spiritual community',
    'educare',
    'seva',
  ],
  openGraph: {
    title: 'Sri Sathya Sai Center at Houston',
    description:
      'A spiritual community in Katy, TX. Devotion, Educare, Seva — open to all.',
    type: 'website',
    url: siteConfig.url,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default async function HomePage() {
  const supabase = createClient();

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch daily quote
  const { data: quotes } = await supabase.rpc('get_daily_quote');
  const quote = quotes?.[0];

  // Fetch latest announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body_plain, category, is_pinned, published_at')
    .not('published_at', 'is', null)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(4);

  // Fetch ticker items (latest published, for live banner)
  const { data: tickerItems } = await supabase
    .from('announcements')
    .select('id, title, body_plain')
    .not('published_at', 'is', null)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(5);

  // Fetch upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('id, title, start_time, end_time, location, category')
    .gte('start_time', new Date().toISOString())
    .eq('is_cancelled', false)
    .order('start_time', { ascending: true })
    .limit(3);

  // WebSite + SearchAction JSON-LD — tells Google/AI about search capability
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="page-enter space-y-5">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ===== HERO — compact with blended Sai Baba image ===== */}
      <section
        className="relative rounded-xl overflow-hidden min-h-[160px] md:min-h-[180px]"
        style={{
          background: 'linear-gradient(135deg, #4A1219 0%, #6B1D2A 60%, #E8860C 140%)',
        }}
      >
        {/* Sai Baba image — right side, blended (desktop) */}
        <div className="absolute inset-y-0 right-0 w-[45%] hidden md:block">
          <Image
            src="/sai-baba-new-image.png"
            alt="Sri Sathya Sai Baba"
            fill
            className="object-contain object-right sai-mask"
            style={{ mixBlendMode: 'lighten' }}
            priority
          />
        </div>

        {/* Sai Baba image — subtle background on mobile */}
        <div className="absolute inset-0 md:hidden opacity-20">
          <Image
            src="/sai-baba-new-image.png"
            alt="Sri Sathya Sai Baba"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Animated divine glow behind image */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full hidden md:block sai-glow"
          style={{ background: 'rgba(232,134,12,0.35)', filter: 'blur(50px)' }}
        />
        {/* Second inner glow - brighter core */}
        <div
          className="absolute right-16 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full hidden md:block sai-glow"
          style={{ background: 'rgba(240,222,180,0.25)', filter: 'blur(30px)', animationDelay: '1s' }}
        />

        {/* Gradient overlay to keep text readable */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to right, #4A1219 0%, rgba(74,18,25,0.85) 40%, transparent 75%)',
          }}
        />

        {/* Text content */}
        <div className="relative z-10 p-5 md:px-8 md:py-5 flex flex-col justify-center h-full">
          <div className="max-w-[520px]">
            <p className="text-[12px] mb-1" style={{ color: '#F0DEB4' }}>
              Om Sri Sai Ram
            </p>
            <h1
              className="text-[20px] md:text-[26px] leading-[1.2] mb-1.5"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 500,
                color: 'white',
              }}
            >
              Welcome to Sri Sathya Sai Center at Houston
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                A spiritual community inspired by the teachings of Sri Sathya Sai Baba.
              </p>
              {!user && (
                <div className="flex gap-2 flex-shrink-0">
                  <Link href="/login" className="btn-primary text-[13px] px-4 py-1.5">Join us</Link>
                  <Link href="/about" className="btn-secondary text-[13px] px-4 py-1.5">Learn more</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIVE UPDATES TICKER — real-time via Supabase ===== */}
      <LiveTicker initialItems={tickerItems ?? []} />

      {/* ===== THREE PILLARS — matches mockup (centered text, hover lift) ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Devotion',
            desc: 'Weekly bhajans, study circles, multi-faith prayers',
            emoji: '\u{1F64F}',
            href: '/devotion',
          },
          {
            title: 'Educare',
            desc: 'Spiritual education for children ages 5-18',
            emoji: '\u{1F4DA}',
            href: '/educare',
          },
          {
            title: 'Seva',
            desc: 'Food rescue, shelter support, health camps',
            emoji: '\u{1F49B}',
            href: '/seva',
          },
        ].map((pillar) => (
          <Link
            key={pillar.title}
            href={pillar.href}
            className="bg-white rounded-xl border border-[rgba(107,29,42,0.1)] p-5 text-center cursor-pointer transition-all duration-200 hover:border-[#E8860C] hover:-translate-y-0.5"
          >
            <div className="text-[28px] mb-2">{pillar.emoji}</div>
            <div
              className="text-[17px] mb-1"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 500,
                color: '#6B1D2A',
              }}
            >
              {pillar.title}
            </div>
            <div className="text-[11px] leading-snug" style={{ color: '#7A6B5F' }}>
              {pillar.desc}
            </div>
          </Link>
        ))}
      </section>

      {/* ===== TWO-COLUMN: Events + Announcements — matches mockup ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upcoming Events Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming events</div>
            <Link href="/calendar" className="card-link">
              View calendar
            </Link>
          </div>
          <div className="card-body">
            {events && events.length > 0 ? (
              <div className="space-y-0">
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className="flex gap-3 py-2.5"
                    style={{
                      borderBottom:
                        i < events.length - 1
                          ? '1px solid rgba(107,29,42,0.1)'
                          : 'none',
                    }}
                  >
                    {/* Date box */}
                    <div
                      className="w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: '#FDF8F0' }}
                    >
                      <span className="text-[9px] uppercase font-medium" style={{ color: '#A89888' }}>
                        {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span
                        className="text-[16px]"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontWeight: 500,
                          color: '#6B1D2A',
                        }}
                      >
                        {new Date(event.start_time).getDate()}
                      </span>
                    </div>
                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium" style={{ color: '#2C1810' }}>
                        {event.title}
                      </div>
                      <div className="text-[11px]" style={{ color: '#7A6B5F' }}>
                        {formatTime(event.start_time)}
                        {event.location && ` \u00B7 ${event.location}`}
                      </div>
                      <span className={`evt-tag evt-tag-${event.category}`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] py-4 text-center" style={{ color: '#A89888' }}>
                No upcoming events. Check back soon!
              </p>
            )}
          </div>
        </div>

        {/* Announcements Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Announcements</div>
            <Link href="/announcements" className="card-link">View all</Link>
          </div>
          <div className="card-body">
            {announcements && announcements.length > 0 ? (
              <div className="space-y-0">
                {announcements.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex gap-3 py-2.5"
                    style={{
                      borderBottom:
                        i < announcements.length - 1
                          ? '1px solid rgba(107,29,42,0.1)'
                          : 'none',
                    }}
                  >
                    {/* Colored dot based on category */}
                    <div
                      className={`ann-dot ann-dot-${item.category}`}
                      style={{ marginTop: '5px' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium" style={{ color: '#2C1810' }}>
                        {item.title}
                      </div>
                      <div className="text-[11px]" style={{ color: '#A89888' }}>
                        {item.is_pinned ? 'Pinned \u00B7 ' : ''}
                        {item.published_at ? formatDate(item.published_at) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] py-4 text-center" style={{ color: '#A89888' }}>
                No announcements yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ===== Daily Quote (below fold) ===== */}
      {quote && (
        <section
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
            className="text-[15px] italic leading-relaxed"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#2C1810',
            }}
          >
            &ldquo;{quote.quote_text}&rdquo;
          </p>
          {quote.source && (
            <p className="mt-2 text-[12px] font-medium" style={{ color: '#E8860C' }}>
              &mdash; {quote.source}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
