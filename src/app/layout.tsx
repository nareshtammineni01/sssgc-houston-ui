import type { Metadata } from 'next';
import { AppShell } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sri Sathya Sai Center at Houston',
    template: '%s | SSSGC Houston',
  },
  description:
    'A spiritual community in Katy, TX inspired by the teachings of Sri Sathya Sai Baba. Devotion, Educare, Seva — open to all.',
  metadataBase: new URL('https://sssgc-houston.org'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Sri Sathya Sai Center at Houston',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current user (if logged in) for the layout shell
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string; avatar_url: string | null; role: string } | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <body>
        <AppShell
          userName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          userRole={
            (profile?.role as 'member' | 'admin' | 'super_admin') ?? null
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
