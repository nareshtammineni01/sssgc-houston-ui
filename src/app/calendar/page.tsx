'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import type { Event } from '@/types/database';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORY_COLORS: Record<string, string> = {
  devotion: 'bg-saffron-500',
  educare: 'bg-maroon-500',
  seva: 'bg-gold-500',
  festival: 'bg-purple-500',
};
const CATEGORY_LABELS: Record<string, string> = {
  devotion: 'Devotion',
  educare: 'Educare',
  seva: 'Seva',
  festival: 'Festival',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mySignups, setMySignups] = useState<Set<string>>(new Set());
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({});

  const supabase = createClient();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get user on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [month, year]);

  async function fetchEvents() {
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', startOfMonth)
      .lte('start_time', endOfMonth)
      .eq('is_cancelled', false)
      .order('start_time', { ascending: true });

    const evts = data ?? [];
    setEvents(evts);

    // Fetch signup counts for all events
    if (evts.length > 0) {
      const ids = evts.map((e) => e.id);
      const { data: signups } = await supabase
        .from('event_signups')
        .select('event_id')
        .in('event_id', ids)
        .eq('status', 'confirmed');

      const counts: Record<string, number> = {};
      (signups ?? []).forEach((s: { event_id: string }) => {
        counts[s.event_id] = (counts[s.event_id] || 0) + 1;
      });
      setSignupCounts(counts);

      // Fetch user's own signups
      if (userId) {
        const { data: mine } = await supabase
          .from('event_signups')
          .select('event_id')
          .eq('user_id', userId)
          .in('event_id', ids)
          .neq('status', 'cancelled');

        setMySignups(new Set((mine ?? []).map((s: { event_id: string }) => s.event_id)));
      }
    }
  }

  async function handleRsvp(eventId: string) {
    if (!userId) return;

    if (mySignups.has(eventId)) {
      // Cancel
      await supabase
        .from('event_signups')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      setMySignups((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      setSignupCounts((prev) => ({
        ...prev,
        [eventId]: Math.max(0, (prev[eventId] || 0) - 1),
      }));
    } else {
      // Sign up
      await supabase
        .from('event_signups')
        .upsert({ event_id: eventId, user_id: userId, status: 'confirmed' });

      setMySignups((prev) => new Set(prev).add(eventId));
      setSignupCounts((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] || 0) + 1,
      }));
    }
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function getEventsForDay(day: number) {
    return events.filter((e) => new Date(e.start_time).getDate() === day);
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate.getDate()) : [];

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-h1">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-cream-100">
              <ChevronLeft size={20} />
            </button>
            <h2
              className="text-[18px]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, color: '#2C1810' }}
            >
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-cream-100">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium py-2" style={{ color: '#A89888' }}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();
              const isSelected =
                selectedDate?.getDate() === day && selectedDate?.getMonth() === month;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={cn(
                    'h-16 rounded-lg text-sm flex flex-col items-center pt-1 transition-colors',
                    isSelected
                      ? 'bg-saffron-50 ring-2 ring-saffron-500'
                      : isToday
                      ? 'bg-maroon-50'
                      : 'hover:bg-cream-200'
                  )}
                >
                  <span
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                      isToday && 'bg-maroon-600 text-white font-semibold',
                      isSelected && !isToday && 'font-semibold text-saffron-600'
                    )}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn('w-1.5 h-1.5 rounded-full', CATEGORY_COLORS[e.category] ?? 'bg-gray-400')}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5 text-xs" style={{ color: '#7A6B5F' }}>
                <span className={cn('w-2.5 h-2.5 rounded-full', color)} />
                <span>{CATEGORY_LABELS[cat] ?? cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day panel */}
        <div className="card p-6">
          <h3
            className="text-[16px] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, color: '#2C1810' }}
          >
            {selectedDate
              ? selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Select a date'}
          </h3>

          {selectedDate ? (
            selectedDayEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDayEvents.map((event) => {
                  const count = signupCounts[event.id] || 0;
                  const isSigned = mySignups.has(event.id);
                  const isFull = event.max_capacity ? count >= event.max_capacity : false;

                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border-l-4"
                      style={{
                        background: '#FDF8F0',
                        borderLeftColor:
                          event.category === 'devotion'
                            ? '#E8860C'
                            : event.category === 'educare'
                            ? '#6B1D2A'
                            : event.category === 'seva'
                            ? '#C4922A'
                            : '#7C3AED',
                      }}
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white mb-1.5 ${CATEGORY_COLORS[event.category]}`}
                      >
                        {CATEGORY_LABELS[event.category] ?? event.category}
                      </span>
                      <h4 className="font-medium" style={{ color: '#2C1810' }}>
                        {event.title}
                      </h4>
                      <div className="mt-2 space-y-1 text-xs" style={{ color: '#7A6B5F' }}>
                        {!event.all_day && (
                          <p className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatTime(event.start_time)}
                            {event.end_time && ` – ${formatTime(event.end_time)}`}
                          </p>
                        )}
                        {event.all_day && (
                          <p className="flex items-center gap-1.5">
                            <Clock size={12} />
                            All day
                          </p>
                        )}
                        {event.location && (
                          <p className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            {event.location}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5">
                          <Users size={12} />
                          {count} signed up
                          {event.max_capacity && ` / ${event.max_capacity}`}
                        </p>
                      </div>
                      {event.description && (
                        <p className="text-[12px] mt-2" style={{ color: '#7A6B5F' }}>
                          {event.description}
                        </p>
                      )}

                      {/* RSVP button */}
                      {userId && (
                        <button
                          onClick={() => handleRsvp(event.id)}
                          disabled={!isSigned && isFull}
                          className={cn(
                            'mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            isSigned
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : isFull
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-saffron-50 text-saffron-700 hover:bg-saffron-100'
                          )}
                        >
                          <CheckCircle size={14} />
                          {isSigned ? 'Signed up ✓ (click to cancel)' : isFull ? 'Full' : 'RSVP'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#A89888' }}>
                No events on this day.
              </p>
            )
          ) : (
            <p className="text-sm" style={{ color: '#A89888' }}>
              Click on a day to see events.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
