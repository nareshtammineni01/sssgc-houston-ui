'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const authError = searchParams.get('error');

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push(redirect);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) setError(error.message);
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8860C]/40 transition-colors';
  const inputStyle = { borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' };

  return (
    <div className="page-enter flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/sss-logo.webp" alt="SSSGC Logo" className="w-14 h-14 rounded-lg mx-auto mb-3 object-cover" />
            <h1 className="text-xl font-heading font-semibold" style={{ color: '#6B1D2A' }}>
              Welcome Back
            </h1>
            <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
              Sign in to your SSSGC Houston account
            </p>
          </div>

          {/* Auth error from callback */}
          {authError && (
            <div className="p-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-200 mb-4">
              Authentication failed. Please try again.
            </div>
          )}

          {/* Google login */}
          <button onClick={handleGoogleLogin} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(107,29,42,0.1)' }} />
            <span className="text-xs" style={{ color: '#A89888' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(107,29,42,0.1)' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pl-9`} style={inputStyle} placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#2C1810' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium" style={{ color: '#E8860C' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-9 pr-10`} style={inputStyle} placeholder="Your password" minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-200">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ background: '#6B1D2A' }}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Switch to signup */}
          <div className="mt-5 text-center">
            <span className="text-sm" style={{ color: '#7A6B5F' }}>Don&apos;t have an account? </span>
            <Link href={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-sm font-medium" style={{ color: '#E8860C' }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
