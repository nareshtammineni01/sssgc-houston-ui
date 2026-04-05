/**
 * Google Calendar API integration
 *
 * Fetches events from public Google Calendars (Hindu holidays, US holidays, etc.)
 * using the Google Calendar API v3 with an API key (no OAuth needed for public calendars).
 *
 * Calendar sources (same as the old SSSGC WordPress site):
 *   - Hindu Holidays:   en.hinduism#holiday@group.v.calendar.google.com
 *   - US Holidays:      en.usa#holiday@group.v.calendar.google.com
 *   - SSSGC Custom:     ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com
 */

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date or datetime
  end?: string;
  allDay: boolean;
  calendarSource: CalendarSourceKey;
  location?: string;
}

export type CalendarSourceKey = 'hindu' | 'us_holidays' | 'sssgc' | 'islamic' | 'judaism';

export interface CalendarSource {
  key: CalendarSourceKey;
  calendarId: string;
  label: string;
  color: string; // Tailwind bg class
  dotColor: string; // Tailwind bg class for dots
}

export const CALENDAR_SOURCES: CalendarSource[] = [
  {
    key: 'hindu',
    calendarId: 'en.hinduism#holiday@group.v.calendar.google.com',
    label: 'Hindu Holidays',
    color: 'bg-orange-100',
    dotColor: 'bg-orange-400',
  },
  {
    key: 'us_holidays',
    calendarId: 'en.usa#holiday@group.v.calendar.google.com',
    label: 'US Holidays',
    color: 'bg-blue-100',
    dotColor: 'bg-blue-400',
  },
  {
    key: 'sssgc',
    calendarId: 'ht3jlfaac5lfd6263ulfh4tql8@group.calendar.google.com',
    label: 'SSSGC Events',
    color: 'bg-maroon-50',
    dotColor: 'bg-maroon-500',
  },
];

export const SOURCE_LABELS: Record<CalendarSourceKey, string> = {
  hindu: 'Hindu Holiday',
  us_holidays: 'US Holiday',
  sssgc: 'SSSGC',
  islamic: 'Islamic Holiday',
  judaism: 'Judaism Holiday',
};

export const SOURCE_DOT_COLORS: Record<CalendarSourceKey, string> = {
  hindu: 'bg-orange-400',
  us_holidays: 'bg-blue-400',
  sssgc: 'bg-maroon-500',
  islamic: 'bg-emerald-400',
  judaism: 'bg-purple-400',
};

export const SOURCE_BG_COLORS: Record<CalendarSourceKey, string> = {
  hindu: '#FFF3E0',
  us_holidays: '#EBF5FF',
  sssgc: '#FDF0F2',
  islamic: '#E8F5E9',
  judaism: '#F3E8FF',
};

/**
 * Fetch events from a single Google Calendar for a given time range.
 */
async function fetchCalendarEvents(
  calendarId: string,
  sourceKey: CalendarSourceKey,
  timeMin: string,
  timeMax: string,
  apiKey: string
): Promise<GoogleCalendarEvent[]> {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events`
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '250');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // cache 1 hour

  if (!res.ok) {
    console.error(`Google Calendar API error for ${sourceKey}:`, res.status, await res.text());
    return [];
  }

  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.items ?? []).map((item: any) => {
    const allDay = !!item.start?.date;
    return {
      id: item.id,
      title: item.summary ?? '(No title)',
      description: item.description ?? undefined,
      start: allDay ? item.start.date : item.start.dateTime,
      end: allDay ? item.end?.date : item.end?.dateTime,
      allDay,
      calendarSource: sourceKey,
      location: item.location ?? undefined,
    } satisfies GoogleCalendarEvent;
  });
}

/**
 * Fetch events from all configured Google Calendar sources for a month.
 * Returns a flat array sorted by start date.
 */
export async function fetchAllGoogleCalendarEvents(
  year: number,
  month: number, // 0-indexed (JS convention)
  apiKey: string,
  sources: CalendarSource[] = CALENDAR_SOURCES
): Promise<GoogleCalendarEvent[]> {
  const timeMin = new Date(year, month, 1).toISOString();
  const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const results = await Promise.allSettled(
    sources.map((src) =>
      fetchCalendarEvents(src.calendarId, src.key, timeMin, timeMax, apiKey)
    )
  );

  const allEvents: GoogleCalendarEvent[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allEvents.push(...result.value);
    }
  });

  // Sort by start date
  allEvents.sort((a, b) => a.start.localeCompare(b.start));

  return allEvents;
}

/**
 * Helper: get Google Calendar events for a specific date string (YYYY-MM-DD)
 */
export function getGoogleEventsForDate(
  events: GoogleCalendarEvent[],
  dateStr: string
): GoogleCalendarEvent[] {
  return events.filter((e) => {
    // For all-day events, start is YYYY-MM-DD
    if (e.allDay) return e.start === dateStr;
    // For timed events, compare date portion
    return e.start.startsWith(dateStr);
  });
}
