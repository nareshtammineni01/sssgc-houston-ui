'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TickerItem {
  id: string;
  title: string;
  body_plain: string;
}

interface LiveTickerProps {
  initialItems: TickerItem[];
}

export function LiveTicker({ initialItems }: LiveTickerProps) {
  const [items, setItems] = useState<TickerItem[]>(initialItems);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to real-time changes on announcements
    const channel = supabase
      .channel('announcements-ticker')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        async () => {
          // Re-fetch latest published announcements when any change occurs
          const { data } = await supabase
            .from('announcements')
            .select('id, title, body_plain')
            .not('published_at', 'is', null)
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false })
            .limit(5);

          if (data) setItems(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) return null;

  const tickerText = items.map((a) => a.title).join(' \u00B7 ');

  return (
    <section
      className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 overflow-hidden"
      style={{ background: '#FFF3E0' }}
    >
      <span
        className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-[3px] rounded whitespace-nowrap flex-shrink-0"
        style={{ background: '#E8860C', color: 'white', letterSpacing: '0.5px' }}
      >
        Live updates
      </span>
      <div className="overflow-hidden relative flex-1">
        <div className="ticker-scroll whitespace-nowrap">
          <span className="text-[13px]" style={{ color: '#2C1810' }}>
            {tickerText}
          </span>
        </div>
      </div>
    </section>
  );
}
