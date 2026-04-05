import { NextRequest, NextResponse } from 'next/server';
import { fetchAllGoogleCalendarEvents } from '@/lib/google-calendar';

/**
 * GET /api/google-calendar?year=2026&month=3
 *
 * Fetches events from all configured Google Calendar sources for a given month.
 * The API key is kept server-side — never exposed to the browser.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const yearStr = searchParams.get('year');
  const monthStr = searchParams.get('month'); // 0-indexed

  if (!yearStr || !monthStr) {
    return NextResponse.json(
      { error: 'Missing required query params: year, month' },
      { status: 400 }
    );
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json(
      { error: 'Invalid year or month (month should be 0-11)' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!apiKey) {
    // Return empty array gracefully — calendar still shows SSSGC events from Supabase
    console.warn('GOOGLE_CALENDAR_API_KEY not set — returning empty Google Calendar events');
    return NextResponse.json({ events: [] });
  }

  try {
    const events = await fetchAllGoogleCalendarEvents(year, month, apiKey);
    return NextResponse.json(
      { events },
      {
        headers: {
          // Cache for 1 hour on CDN, stale-while-revalidate for 24 hours
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Google Calendar API error:', error);
    return NextResponse.json({ events: [] });
  }
}
