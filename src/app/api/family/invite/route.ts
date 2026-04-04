import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify the caller is authenticated
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { email, familyName, inviteCode, senderName } = await request.json();

    if (!email || !inviteCode) {
      return NextResponse.json({ error: 'Email and invite code are required' }, { status: 400 });
    }

    // Look up if the person exists in profiles
    const { data: targetProfile } = await serverSupabase
      .from('profiles')
      .select('full_name, family_id')
      .eq('email', email.trim().toLowerCase())
      .single();

    // For now, the invite flow works via the UI showing the invite code.
    // The user can share the code directly with their spouse.
    // A future enhancement could send an actual email via Resend/SendGrid.
    return NextResponse.json({
      success: true,
      userExists: !!targetProfile,
      alreadyInFamily: !!targetProfile?.family_id,
      message: targetProfile
        ? targetProfile.family_id
          ? 'This person is already part of a family.'
          : `${targetProfile.full_name} can join your family using code: ${inviteCode}`
        : `No account found. They can sign up and join using code: ${inviteCode}`,
    });
  } catch (err) {
    console.error('Family invite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
