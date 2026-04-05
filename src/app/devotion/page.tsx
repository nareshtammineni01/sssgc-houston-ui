import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, Sparkles, CalendarHeart, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Devotion',
  description: 'Devotion activities at Sri Sathya Sai Center Houston — bhajans, study circles, and more.',
};

const QUICK_LINKS = [
  {
    icon: Users,
    title: 'Bhajan / Arathi Signups',
    description: 'Reserve your spot for upcoming sessions',
    href: '/devotion/bhajan-signups',
  },
  {
    icon: Sparkles,
    title: 'Devotional Resources',
    description: 'Bhajans, prayers, study guides, and more',
    href: '/devotion/resources',
  },
  {
    icon: CalendarHeart,
    title: 'Special Events',
    description: 'Upcoming celebrations and observances',
    href: '/devotion/special-events',
  },
];

export default async function DevotionPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'devotion')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-2">Devotion</h1>
      <p className="text-[17px] mb-8" style={{ color: '#7A6B5F' }}>
        Weekly gatherings in prayer, song, and spiritual study.
      </p>

      {/* Dynamic content from Supabase */}
      {data?.body && (
        <div
          className="prose prose-gray max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: data.body }}
        />
      )}

      {/* Intro paragraph */}
      <div
        className="px-6 py-5 rounded-xl mb-10"
        style={{
          background: '#FDF8F0',
          border: '1px solid rgba(196,146,42,0.25)',
        }}
      >
        <p className="text-[17px] leading-relaxed" style={{ color: '#3D2E22' }}>
          Our weekly devotional gatherings bring members together for about three hours of
          spiritual enrichment. We explore a topic from Sri Sathya Sai Literature through
          study circles — thoughtful discussions on living with purpose and love. We sing
          bhajans together — devotional music that uplifts the heart and unites the community.
          We learn through free workshops open to all. And we pray together across faiths,
          discovering prayers from many traditions and the beautiful histories they carry.
        </p>
      </div>

      {/* Quick navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group px-5 py-5 rounded-xl transition-all hover:shadow-md"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(196,146,42,0.3)',
            }}
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
              style={{ background: '#FFF3E0' }}
            >
              <item.icon size={22} style={{ color: '#C4922A' }} />
            </div>
            <h3
              className="text-[16px] font-semibold mb-1"
              style={{ color: '#2C1810' }}
            >
              {item.title}
            </h3>
            <p className="text-[14px] leading-relaxed mb-3" style={{ color: '#7A6B5F' }}>
              {item.description}
            </p>
            <span
              className="inline-flex items-center gap-1 text-[13px] font-medium transition-colors group-hover:gap-2"
              style={{ color: '#E8860C' }}
            >
              Explore <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
