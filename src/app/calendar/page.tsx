'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Globe,
  Star,
  X,
  Minus,
  Plus,
  LogIn,
  Pencil,
  Lock,
  XCircle,
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import type { Event } from '@/types/database';
import {
  type GoogleCalendarEvent,
  type CalendarSourceKey,
  SOURCE_LABELS,
  SOURCE_DOT_COLORS,
  SOURCE_BG_COLORS,
  CALENDAR_SOURCES,
} from '@/lib/google-calendar';

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

/** Check if RSVP deadline has passed */
function isRsvpClosed(event: Event): boolean {
  if (event.rsvp_deadline) {
    return new Date() > new Date(event.rsvp_deadline);
  }
  return false;
}

/** Format a deadline for display */
function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Icon for Google Calendar source types */
function SourceIcon({ source, size = 12 }: { source: CalendarSourceKey; size?: number }) {
  switch (source) {
    case 'hindu':
      return <Star size={size} className="text-orange-500" />;
    case 'us_holidays':
      return <Globe size={size} className="text-blue-500" />;
    case 'sssgc':
      return <Star size={size} className="text-maroon-500" />;
    case 'islamic':
      return <Star size={size} className="text-emerald-500" />;
    case 'judaism':
      return <Star size={size} className="text-purple-500" />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  RSVP Modal Component (new RSVP + edit existing)                   */
/* ------------------------------------------------------------------ */
function RsvpModal({
  event,
  onClose,
  onConfirm,
  onCancel,
  currentGuestCount,
  isEdit,
}: {
  event: Event;
  onClose: () => void;
  onConfirm: (guestCount: number) => void;
  onCancel?: () => void;
  currentGuestCount?: number;
  isEdit?: boolean;
}) {
  const [guestCount, setGuestCount] = useState(currentGuestCount ?? 1);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onConfirm(guestCount);
    setSubmitting(false);
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setCancelling(true);
    await onCancel();
    setCancelling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4"
        style={{ border: '1px solid rgba(107,29,42,0.1)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={18} style={{ color: '#7A6B5F' }} />
        </button>

        <div>
          <h3
            className="text-[18px] leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              color: '#6B1D2A',
            }}
          >
            {isEdit ? 'Update RSVP' : 'RSVP'} — {event.title}
          </h3>
          <p className="text-[13px] mt-1" style={{ color: '#7A6B5F' }}>
            {!event.all_day && formatTime(event.start_time)}
            {event.location && ` · ${event.location}`}
          </p>
        </div>

        {/* Guest count selector */}
        <div>
          <label
            className="block text-[14px] font-medium mb-2"
            style={{ color: '#2C1810' }}
          >
            How many people are attending?
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              disabled={guestCount <= 1}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors border',
                guestCount <= 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-[rgba(107,29,42,0.15)] text-[#6B1D2A] hover:bg-cream-100'
              )}
            >
              <Minus size={16} />
            </button>
            <span
              className="text-[22px] w-10 text-center font-semibold"
              style={{ color: '#6B1D2A' }}
            >
              {guestCount}
            </span>
            <button
              onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
              disabled={guestCount >= 10}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors border',
                guestCount >= 10
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-[rgba(107,29,42,0.15)] text-[#6B1D2A] hover:bg-cream-100'
              )}
            >
              <Plus size={16} />
            </button>
            <span className="text-[13px]" style={{ color: '#7A6B5F' }}>
              {guestCount === 1 ? 'person' : 'people'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || cancelling}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-[14px] font-medium transition-colors"
            style={{ background: submitting ? '#A89888' : '#6B1D2A' }}
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {submitting ? 'Saving...' : isEdit ? 'Update RSVP' : 'Confirm RSVP'}
          </button>

          {/* Cancel RSVP button (only for edit mode) */}
          {isEdit && onCancel && (
            <button
              onClick={handleCancel}
              disabled={submitting || cancelling}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors border"
              style={{
                color: cancelling ? '#A89888' : '#DC2626',
                borderColor: cancelling ? '#E5E7EB' : '#FCA5A5',
                background: cancelling ? '#F9FAFB' : '#FEF2F2',
              }}
            >
              {cancelling ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              {cancelling ? 'Cancelling...' : 'Cancel RSVP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Calendar Page                                                */
/* ------------------------------------------------------------------ */
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [mySignups, setMySignups] = useState<Set<string>>(new Set());
  const [myGuestCounts, setMyGuestCounts] = useState<Record<string, number>>({});
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({});
  const [showGoogleCal, setShowGoogleCal] = useState(true);
  const [googleCalLoading, setGoogleCalLoading] = useState(false);
  const [rsvpModal, setRsvpModal] = useState<{ event: Event; isEdit: boolean } | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Track latest userId in a ref so fetchEvents always sees current value
  const userIdRef = useRef<string | null>(null);

  // Get user on mount, then trigger event fetch
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        userIdRef.current = user.id;
      }
      setUserLoaded(true);
    })();
  }, []);

  // Fetch Google Calendar events
  const fetchGoogleEvents = useCallback(async () => {
    setGoogleCalLoading(true);
    try {
      const res = await fetch(`/api/google-calendar?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setGoogleEvents(data.events ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch Google Calendar events:', err);
      setGoogleEvents([]);
    } finally {
      setGoogleCalLoading(false);
    }
  }, [year, month]);

  // Only fetch events AFTER user auth check completes
  useEffect(() => {
    if (!userLoaded) return;
    fetchEvents();
    fetchGoogleEvents();
  }, [month, year, userLoaded, fetchGoogleEvents]);

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

    if (evts.length > 0) {
      const ids = evts.map((e) => e.id);

      // Fetch signup counts for all events (sum of guest_count)
      const { data: signups } = await supabase
        .from('event_signups')
        .select('event_id, guest_count')
        .in('event_id', ids)
        .eq('status', 'confirmed');

      const counts: Record<string, number> = {};
      (signups ?? []).forEach((s: { event_id: string; guest_count: number }) => {
        counts[s.event_id] = (counts[s.event_id] || 0) + (s.guest_count ?? 1);
      });
      setSignupCounts(counts);

      // Fetch user's own signups — use ref to always get latest userId
      const currentUserId = userIdRef.current;
      if (currentUserId) {
        const { data: mine } = await supabase
          .from('event_signups')
          .select('event_id, guest_count')
          .eq('user_id', currentUserId)
          .in('event_id', ids)
          .neq('status', 'cancelled');

        const signedUpSet = new Set<string>();
        const guestCounts: Record<string, number> = {};
        (mine ?? []).forEach((s: { event_id: string; guest_count: number }) => {
          signedUpSet.add(s.event_id);
          guestCounts[s.event_id] = s.guest_count ?? 1;
        });
        setMySignups(signedUpSet);
        setMyGuestCounts(guestCounts);
      }
    }
  }

  function handleRsvpClick(event: Event) {
    // Require sign-in
    if (!userId) {
      router.push(`/login?redirect=/calendar`);
      return;
    }

    // Check deadline
    if (isRsvpClosed(event)) return;

    if (mySignups.has(event.id)) {
      // Already signed up — open modal in edit mode
      setRsvpModal({ event, isEdit: true });
    } else {
      // New RSVP
      setRsvpModal({ event, isEdit: false });
    }
  }

  async function handleCancel(eventId: string) {
    if (!userId) return;

    const oldGuestCount = myGuestCounts[eventId] ?? 1;

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
    setMyGuestCounts((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    setSignupCounts((prev) => ({
      ...prev,
      [eventId]: Math.max(0, (prev[eventId] || 0) - oldGuestCount),
    }));
    setRsvpModal(null);
  }

  async function handleRsvpConfirm(guestCount: number) {
    if (!userId || !rsvpModal) return;

    const eventId = rsvpModal.event.id;
    const isEdit = rsvpModal.isEdit;
    const oldGuestCount = myGuestCounts[eventId] ?? 0;

    await supabase
      .from('event_signups')
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
          status: 'confirmed',
          guest_count: guestCount,
        },
        { onConflict: 'event_id,user_id' }
      );

    setMySignups((prev) => new Set(prev).add(eventId));
    setMyGuestCounts((prev) => ({ ...prev, [eventId]: guestCount }));

    // Adjust total count: subtract old, add new
    setSignupCounts((prev) => ({
      ...prev,
      [eventId]: Math.max(0, (prev[eventId] || 0) - (isEdit ? oldGuestCount : 0)) + guestCount,
    }));
    setRsvpModal(null);
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

  function getGoogleEventsForDay(day: number): GoogleCalendarEvent[] {
    if (!showGoogleCal) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return googleEvents.filter((e) => {
      if (e.allDay) return e.start === dateStr;
      return e.start.startsWith(dateStr);
    });
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate.getDate()) : [];
  const selectedDayGoogleEvents = selectedDate ? getGoogleEventsForDay(selectedDate.getDate()) : [];

  // Active Google Calendar source types (for legend)
  const activeSourceKeys = [...new Set(googleEvents.map((e) => e.calendarSource))];

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-h1">Calendar</h1>

        {/* Google Calendar toggle */}
        <button
          onClick={() => setShowGoogleCal(!showGoogleCal)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
            showGoogleCal
              ? 'border-[#E8860C] text-[#E8860C] bg-[#FFF3E0]'
              : 'border-[rgba(107,29,42,0.15)] text-[#7A6B5F] hover:border-[#E8860C]'
          )}
        >
          <Globe size={14} />
          Holidays {showGoogleCal ? 'On' : 'Off'}
          {googleCalLoading && (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
        </button>
      </div>

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
              const dayGoogleEvents = getGoogleEventsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();
              const isSelected =
                selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
              const hasAny = dayEvents.length > 0 || dayGoogleEvents.length > 0;

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
                      : hasAny
                      ? 'bg-[#FDF8F0] hover:bg-[#F5EDE0]'
                      : 'hover:bg-cream-200'
                  )}
                  style={!isSelected && !isToday && hasAny ? { border: '1px solid rgba(232,134,12,0.18)' } : undefined}
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
                  {/* Dot indicators */}
                  {(dayEvents.length > 0 || dayGoogleEvents.length > 0) && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[90%]">
                      {dayEvents.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className={cn('w-1.5 h-1.5 rounded-full', CATEGORY_COLORS[e.category] ?? 'bg-gray-400')}
                        />
                      ))}
                      {dayGoogleEvents.slice(0, 3).map((g, idx) => (
                        <span
                          key={`g-${idx}`}
                          className={cn('w-1.5 h-1.5 rounded-full', SOURCE_DOT_COLORS[g.calendarSource])}
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
            {showGoogleCal && activeSourceKeys.length > 0 && (
              <>
                <span className="w-px h-4 self-center" style={{ background: 'rgba(107,29,42,0.12)' }} />
                {activeSourceKeys.map((key) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: '#7A6B5F' }}>
                    <span className={cn('w-2.5 h-2.5 rounded-full', SOURCE_DOT_COLORS[key])} />
                    <span>{SOURCE_LABELS[key]}</span>
                  </div>
                ))}
              </>
            )}
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
            <>
              {/* Google Calendar entries */}
              {showGoogleCal && selectedDayGoogleEvents.length > 0 && (
                <div className="space-y-2 mb-4">
                  {selectedDayGoogleEvents.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                      style={{ background: SOURCE_BG_COLORS[g.calendarSource] ?? '#F5F5F5' }}
                    >
                      <div className="mt-0.5">
                        <SourceIcon source={g.calendarSource} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium" style={{ color: '#2C1810' }}>
                          {g.title}
                        </p>
                        <p className="text-[11px]" style={{ color: '#7A6B5F' }}>
                          {SOURCE_LABELS[g.calendarSource]}
                          {g.description && ` · ${g.description.slice(0, 80)}${g.description.length > 80 ? '…' : ''}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SSSGC events */}
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayEvents.map((event) => {
                    const count = signupCounts[event.id] || 0;
                    const isSigned = mySignups.has(event.id);
                    const isFull = event.max_capacity ? count >= event.max_capacity : false;
                    const myGuests = myGuestCounts[event.id];
                    const closed = isRsvpClosed(event);

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
                            {count} attending
                            {event.max_capacity && ` / ${event.max_capacity}`}
                          </p>
                          {/* RSVP deadline info */}
                          {event.rsvp_deadline && (
                            <p className="flex items-center gap-1.5" style={{ color: closed ? '#DC2626' : '#E8860C' }}>
                              <Lock size={12} />
                              {closed
                                ? `RSVP closed (was ${formatDeadline(event.rsvp_deadline)})`
                                : `RSVP by ${formatDeadline(event.rsvp_deadline)}`}
                            </p>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-[12px] mt-2" style={{ color: '#7A6B5F' }}>
                            {event.description}
                          </p>
                        )}

                        {/* RSVP buttons */}
                        {closed ? (
                          /* RSVP is frozen */
                          isSigned ? (
                            <div
                              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700"
                            >
                              <CheckCircle size={14} />
                              You&apos;re attending ({myGuests ?? 1} {(myGuests ?? 1) === 1 ? 'person' : 'people'})
                            </div>
                          ) : (
                            <div
                              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-400"
                            >
                              <Lock size={14} />
                              RSVP closed
                            </div>
                          )
                        ) : !userId ? (
                          /* Not signed in */
                          <button
                            onClick={() => handleRsvpClick(event)}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-saffron-50 text-saffron-700 hover:bg-saffron-100 transition-colors"
                          >
                            <LogIn size={14} />
                            Sign in to RSVP
                          </button>
                        ) : isSigned ? (
                          /* Signed up — show status + edit button */
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700">
                              <CheckCircle size={14} />
                              Attending · {myGuests ?? 1} {(myGuests ?? 1) === 1 ? 'person' : 'people'}
                            </div>
                            <button
                              onClick={() => handleRsvpClick(event)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-cream-100"
                              style={{ color: '#7A6B5F', borderColor: 'rgba(107,29,42,0.15)' }}
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                          </div>
                        ) : isFull ? (
                          <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-400">
                            Full
                          </div>
                        ) : (
                          /* New RSVP */
                          <button
                            onClick={() => handleRsvpClick(event)}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-saffron-50 text-saffron-700 hover:bg-saffron-100 transition-colors"
                          >
                            <CheckCircle size={14} />
                            RSVP
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !showGoogleCal || selectedDayGoogleEvents.length === 0 ? (
                  <p className="text-sm" style={{ color: '#A89888' }}>
                    No events on this day.
                  </p>
                ) : null
              )}
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: '#A89888' }}>
                Click on a day to see events.
              </p>

              {/* Upcoming Google Calendar events this month (quick glance) */}
              {showGoogleCal && googleEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                  <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: '#A89888' }}>
                    Holidays This Month
                  </p>
                  <div className="space-y-2">
                    {googleEvents.slice(0, 10).map((g, idx) => {
                      const displayDate = g.allDay
                        ? new Date(g.start + 'T12:00:00')
                        : new Date(g.start);
                      return (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <SourceIcon source={g.calendarSource} size={12} />
                          <span style={{ color: '#7A6B5F' }}>
                            {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ color: '#2C1810' }} className="font-medium">{g.title}</span>
                        </div>
                      );
                    })}
                    {googleEvents.length > 10 && (
                      <p className="text-[11px]" style={{ color: '#A89888' }}>
                        +{googleEvents.length - 10} more — select a date to see details
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RSVP Modal */}
      {rsvpModal && (
        <RsvpModal
          event={rsvpModal.event}
          isEdit={rsvpModal.isEdit}
          currentGuestCount={rsvpModal.isEdit ? myGuestCounts[rsvpModal.event.id] : undefined}
          onClose={() => setRsvpModal(null)}
          onConfirm={handleRsvpConfirm}
          onCancel={rsvpModal.isEdit ? () => handleCancel(rsvpModal.event.id) : undefined}
        />
      )}
    </div>
  );
}
