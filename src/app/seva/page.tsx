import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowRight, Utensils, Home, Leaf, Heart, GraduationCap, Stethoscope } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seva',
  description: 'Selfless service activities at Sri Sathya Sai Center Houston.',
};

const SERVICE_HIGHLIGHTS = [
  {
    icon: Utensils,
    title: 'Food Rescue & Distribution',
    description:
      'We rescue food from grocery stores, bakeries, and restaurants, prepare home-cooked meals, and make brown bag lunches — delivering them weekly to downtown shelters and pantries.',
  },
  {
    icon: Home,
    title: 'Shelter & Nursing Home Support',
    description:
      'Volunteers stock shelter pantries, organize special monthly programs at nursing homes and detention centers, offering counselling and emotional support to those in need.',
  },
  {
    icon: Leaf,
    title: 'Rural Community Outreach',
    description:
      'We partner with local pantries and churches to assess the needs of rural communities, collect supplies through drives, and distribute them on a quarterly basis.',
  },
  {
    icon: GraduationCap,
    title: 'Tutoring & School Supplies',
    description:
      'We help tutor students and procure school supplies for schools in underserved areas, supporting education where it is needed most.',
  },
  {
    icon: Stethoscope,
    title: 'Health Camps & Education',
    description:
      'We conduct health camps and provide health education to communities with limited access to healthcare, organized one to two times a year.',
  },
  {
    icon: Heart,
    title: 'Special Service Projects',
    description:
      'From organic garden seva to animal shelter support, Go-Green awareness drives, and clothing donations — our volunteers serve across many fronts.',
  },
];

export default async function SevaPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'seva')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-2">Seva</h1>
      <p className="text-[17px] mb-8" style={{ color: '#7A6B5F' }}>
        Selfless service to the community through love, compassion, and action.
      </p>

      {/* Quote */}
      <blockquote
        className="relative px-6 py-5 rounded-xl mb-10"
        style={{ background: '#FDF8F0', borderLeft: '4px solid #E8860C' }}
      >
        <p
          className="text-[18px] tracking-wide font-semibold mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: '#6B1D2A',
          }}
        >
          SERVICE TO MAN IS SERVICE TO GOD
        </p>
        <p className="text-[17px] leading-relaxed italic" style={{ color: '#3D2E22' }}>
          The uniqueness of the Sri Sathya Sai Seva Organisation consists in the fact that
          it regards seva (selfless service) as a form of service to the Divinity that is in
          each being. The bliss that is derived from such service is incomparable. It is a
          spiritual experience. Service expresses the divinity hidden in man. It broadens
          one&apos;s heart, it destroys narrow-mindedness, and it gives delight. The evil
          qualities and tendencies in us can be driven away through service. To remove the
          evil of egoism, service is the most efficient instrument.
        </p>
        <footer className="mt-3 text-[15px] font-medium" style={{ color: '#6B1D2A' }}>
          – Sri Sathya Sai Baba
        </footer>
      </blockquote>

      {/* Dynamic content from Supabase */}
      {data?.body && (
        <div
          className="prose prose-gray max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: data.body }}
        />
      )}

      {/* Intro paragraph */}
      <div
        className="px-6 py-5 rounded-xl mb-8"
        style={{
          background: '#FDF8F0',
          border: '1px solid rgba(196,146,42,0.25)',
        }}
      >
        <p className="text-[17px] leading-relaxed" style={{ color: '#3D2E22' }}>
          We conduct several community service activities on an ongoing basis and have partnered
          with soup kitchens, homeless shelters, schools, and healthcare providers across the
          greater Houston area. Our volunteers come together each week to serve with love.
        </p>
      </div>

      {/* Service highlights as cards with gold border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {SERVICE_HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="px-5 py-5 rounded-xl transition-shadow hover:shadow-md"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(196,146,42,0.3)',
            }}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#FFF3E0' }}
              >
                <item.icon size={20} style={{ color: '#C4922A' }} />
              </div>
              <h3
                className="text-[16px] font-semibold"
                style={{ color: '#2C1810' }}
              >
                {item.title}
              </h3>
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: '#7A6B5F' }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Link to Service page */}
      <div
        className="flex items-center justify-between px-6 py-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #6B1D2A 0%, #8B2E3C 100%)',
        }}
      >
        <div>
          <p className="text-[16px] font-medium text-white">
            View our Special Service Projects
          </p>
          <p className="text-[14px] text-white/70 mt-0.5">
            Detailed list of all ongoing and upcoming seva activities
          </p>
        </div>
        <Link
          href="/service"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
        >
          Explore
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
