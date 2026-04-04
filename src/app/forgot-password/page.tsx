'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { FloatingInput } from '@/components/ui/FloatingField';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="page-enter flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/sss-logo.webp" alt="SSSGC Logo" className="w-14 h-14 rounded-lg mx-auto mb-3 object-cover" />
            <h1 className="text-xl font-heading font-semibold" style={{ color: '#6B1D2A' }}>
              Reset Password
            </h1>
            <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
              </div>
              <h2 className="text-lg font-medium mb-2" style={{ color: '#2C1810' }}>Check Your Email</h2>
              <p className="text-sm mb-1" style={{ color: '#7A6B5F' }}>
                We&apos;ve sent a password reset link to:
              </p>
              <p className="text-sm font-medium mb-4" style={{ color: '#6B1D2A' }}>{email}</p>
              <p className="text-xs mb-6" style={{ color: '#A89888' }}>
                Didn&apos;t receive the email? Check your spam folder, or try again with a different email address.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                  style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#6B1D2A' }}
                >
                  Try a Different Email
                </button>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
                  style={{ background: '#6B1D2A' }}
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleReset} className="space-y-4">
                <FloatingInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={16} />}
                  required
                />

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
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#E8860C' }}>
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
