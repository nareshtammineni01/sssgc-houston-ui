'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Listen for the PASSWORD_RECOVERY event from the hash fragment
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (user may have clicked link and session is active)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Sign out after password reset so they log in fresh
      await supabase.auth.signOut();
    }
    setLoading(false);
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
              {success ? 'Password Updated!' : 'Set New Password'}
            </h1>
            {!success && (
              <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
                Enter your new password below.
              </p>
            )}
          </div>

          {success ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm mb-6" style={{ color: '#7A6B5F' }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
                style={{ background: '#6B1D2A' }}
              >
                Go to Sign In
              </Link>
            </div>
          ) : !sessionReady ? (
            /* Waiting for session / invalid link */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(107,29,42,0.08)' }}>
                <ShieldCheck size={32} style={{ color: '#6B1D2A' }} />
              </div>
              <p className="text-sm mb-2" style={{ color: '#7A6B5F' }}>
                Verifying your reset link...
              </p>
              <p className="text-xs mb-6" style={{ color: '#A89888' }}>
                If this page doesn&apos;t update, the link may have expired. You can request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm font-medium" style={{ color: '#E8860C' }}
              >
                Request a New Reset Link
              </Link>
            </div>
          ) : (
            /* Password form */
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-9 pr-10`}
                    style={inputStyle}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pl-9 pr-10`}
                    style={inputStyle}
                    placeholder="Re-enter your new password"
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-200">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-colors"
                style={{ background: '#6B1D2A' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
