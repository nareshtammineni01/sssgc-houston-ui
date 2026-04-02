'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { cn, formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/types/database';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORY_COLORS: Record<string, string> = {
  devotion: 'bg-saffron-500',
  educare: 'bg-maroon-500',
  seva: 'bg-gold-500',
  community: 'bg-blue-500',
  special: 'bg-purple-500',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const supabase = createClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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

    setEvents(data ?? []);
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
    return events.filter((e) => {
      const d = new Date(e.start_time);
      return d.getDate() === day;
    });
  }

  const selectedDayEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-h1">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-cream-100">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-h3 font-heading">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-cream-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === month;

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
                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            CATEGORY_COLORS[e.category] ?? 'bg-gray-400'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Category legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={cn('w-2.5 h-2.5 rounded-full', color)} />
                <span className="capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day events */}
        <div className="card p-6">
          <h3 className="text-h3 mb-4">
            {selectedDate
              ? formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })
              : 'Select a date'}
          </h3>

          {selectedDate ? (
            selectedDayEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-cream-100 border-l-4"
                    style={{
                      borderColor:
                        CATEGORY_COLORS[event.category]?.replace('bg-', '') ?? '#9CA3AF',
                    }}
                  >
                    <span className="badge-saffron text-[10px] mb-1">
                      {event.category}
                    </span>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatTime(event.start_time)} &ndash; {formatTime(event.end_time)}
                      </p>
                      {event.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {event.location}
                        </p>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No events on this day.</p>
            )
          ) : (
            <p className="text-sm text-gray-400">Click on a day to see events.</p>
          )}
        </div>
      </div>
    </div>
  );
}
