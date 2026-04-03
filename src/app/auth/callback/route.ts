import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // For Google OAuth users, check if profile needs address info
      // They'll be prompted in settings if fields are missing
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login with an error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
