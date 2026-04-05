import type { Metadata } from 'next';
import { Music, FileText, BookOpen, Library, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Devotional Resources',
  description: 'Bhajan lyrics, prayer resources, study circle guides, and more.',
};

const RESOURCES = [
  {
    icon: Music,
    title: 'Bhajan Resources',
    description:
      'Lyrics, ragas, and audio recordings for congregational singing sessions. Learn new bhajans or practice familiar ones.',
  },
  {
    icon: FileText,
    title: 'Prayer Resources',
    description:
      'English lyrics and translations for multi-faith prayers recited during our weekly devotional gatherings.',
  },
  {
    icon: BookOpen,
    title: 'Study Circle Resources',
    description:
      'Discussion guides and selected readings from Sri Sathya Sai Literature for weekly study circles.',
  },
  {
    icon: Library,
    title: 'Bhajan Book',
    description:
      'Our complete collection of bhajans used during weekly sessions — browse, search, and download.',
  },
];

export default function DevotionalResourcesPage() {
  return (
    <div className="page-enter max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#FFF3E0' }}
        >
          <Sparkles size={20} style={{ color: '#C4922A' }} />
        </div>
        <h1 className="text-h1">Devotional Resources</h1>
      </div>
      <p className="text-[17px] mb-8" style={{ color: '#7A6B5F' }}>
        Materials for bhajans, prayers, and study circles.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RESOURCES.map((item) => (
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
    </div>
  );
}
