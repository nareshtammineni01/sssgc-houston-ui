import type { Metadata } from 'next';
import { Megaphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Educare Announcements',
  description: 'Latest updates and news for Educare parents, students, and teachers.',
};

export default function EducareAnnouncementsPage() {
  return (
    <div className="page-enter max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#FFF3E0' }}
        >
          <Megaphone size={20} style={{ color: '#C4922A' }} />
        </div>
        <h1 className="text-h1">Educare Announcements</h1>
      </div>
      <p className="text-[17px] mb-8" style={{ color: '#7A6B5F' }}>
        Latest updates and news for parents, students, and teachers.
      </p>

      <div
        className="px-6 py-10 rounded-xl text-center"
        style={{ background: '#FDF8F0', border: '1.5px solid rgba(196,146,42,0.3)' }}
      >
        <Megaphone size={40} style={{ color: '#C4922A', opacity: 0.4 }} className="mx-auto mb-4" />
        <p className="text-[17px] font-medium mb-2" style={{ color: '#2C1810' }}>
          No Announcements Yet
        </p>
        <p className="text-[15px]" style={{ color: '#A89888' }}>
          Educare announcements about schedules, events, and updates will appear here.
        </p>
      </div>
    </div>
  );
}
