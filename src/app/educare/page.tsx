import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Megaphone, Users, BookOpen, Monitor, Music, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Educare',
  description: 'Educare spiritual education for children at SSSGC Houston.',
};

const QUICK_LINKS = [
  {
    icon: Megaphone,
    title: 'Educare Announcements',
    description: 'Latest updates and news for parents and students',
    href: '/educare/announcements',
  },
  {
    icon: Users,
    title: 'Meet the Gurus',
    description: 'Our dedicated volunteer teachers and mentors',
    href: '/educare/meet-the-gurus',
  },
  {
    icon: BookOpen,
    title: 'Educare Resources',
    description: 'Curriculum materials, guides, and study aids',
    href: '/educare/resources',
  },
  {
    icon: Monitor,
    title: 'Online Classes',
    description: 'Join virtual sessions from anywhere',
    href: '/educare/online-classes',
  },
  {
    icon: Music,
    title: 'Bhajan Tutor Signup',
    description: 'Sign up to learn or teach devotional music',
    href: '/educare/bhajan-tutor-signup',
  },
];

export default async function EducarePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('title, body')
    .eq('page_key', 'educare')
    .single();

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-h1 mb-2">Educare</h1>
      <p className="text-[17px] mb-8" style={{ color: '#7A6B5F' }}>
        Spiritual education for young hearts and minds, ages 5 to 18.
      </p>

      {/* Quote */}
      <blockquote
        className="relative px-6 py-5 rounded-xl mb-10"
        style={{ background: '#FDF8F0', borderLeft: '4px solid #E8860C' }}
      >
        <p className="text-[17px] leading-relaxed italic" style={{ color: '#3D2E22' }}>
          &ldquo;The End of Wisdom is Freedom. The End of Culture is Perfection.
          The End of Knowledge is Love. The End of Education is Character.&rdquo;
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

      {/* Overview */}
      <div
        className="px-6 py-5 rounded-xl mb-10"
        style={{
          background: '#FDF8F0',
          border: '1px solid rgba(196,146,42,0.25)',
        }}
      >
        <p className="text-[17px] leading-relaxed mb-4" style={{ color: '#3D2E22' }}>
          We offer spiritual education for children between the ages of 5 and 18 — both
          in person and remotely — primarily for the children of our members, though
          all young learners are welcome. Classes are held weekly during the school year,
          led by volunteer teachers from our congregation who undergo a robust training
          and certification program.
        </p>
        <p className="text-[17px] leading-relaxed mb-4" style={{ color: '#3D2E22' }}>
          The entire program rests on two foundational truths: that God exists, and that
          every human being is divine. Our philosophy of <em>Educare</em> — meaning
          &ldquo;to bring out that which is within&rdquo; — is centred on five universal
          human values hidden in every person: <strong>Truth, Righteousness, Peace,
          Love, and Non-violence</strong>.
        </p>
        <p className="text-[17px] leading-relaxed" style={{ color: '#3D2E22' }}>
          These values cannot be acquired from the outside — they must be awakened from
          within. Educare helps children rediscover these innate qualities and, most
          importantly, translate them into everyday action — building character that
          lasts a lifetime.
        </p>
      </div>

      {/* Quick navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
