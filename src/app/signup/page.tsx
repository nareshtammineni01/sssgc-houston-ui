'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, UserPlus, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const supabase = createClient();

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          full_name: fullName,
          phone: form.phone.trim() || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  async function handleGoogleSignUp() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) setError(error.message);
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-[#E8860C]/40 transition-colors';
  const inputStyle = { borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' };
  const labelClass = 'block text-[13px] font-medium mb-1.5';
  const labelStyle = { color: '#7A6B5F' };

  // Success state — account created
  if (success) {
    return (
      <div className="page-enter flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#F0FFF4' }}>
              <CheckCircle size={32} style={{ color: '#16A34A' }} />
            </div>
            <h1 className="text-xl font-heading font-semibold mb-2" style={{ color: '#6B1D2A' }}>
              Account Created!
            </h1>
            <p className="text-[15px] mb-2" style={{ color: '#7A6B5F' }}>
              Welcome to the SSSGC Houston community, {form.firstName}!
            </p>
            <p className="text-[13px] mb-6" style={{ color: '#A89888' }}>
              You can now sign in and complete your profile with additional details like your address.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[15px] font-medium transition-colors"
              style={{ background: '#6B1D2A' }}
            >
              Go to Sign In
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/sss-logo.webp" alt="SSSGC Logo" className="w-14 h-14 rounded-lg mx-auto mb-3 object-cover" />
            <h1 className="text-xl font-heading font-semibold" style={{ color: '#6B1D2A' }}>
              Create Your Account
            </h1>
            <p className="text-[14px] mt-1" style={{ color: '#7A6B5F' }}>
              Join the SSSGC Houston community
            </p>
          </div>

          {/* Google signup */}
          <button onClick={handleGoogleSignUp} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border text-[14px] font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(107,29,42,0.1)' }} />
            <span className="text-[12px]" style={{ color: '#A89888' }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(107,29,42,0.1)' }} />
          </div>

          {/* Form — minimal fields only */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>First Name *</label>
                <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="First name" required />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Last Name *</label>
                <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="Last name" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass} style={labelStyle}>Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  className={`${inputClass} pl-10`} style={inputStyle} placeholder="you@example.com" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass} style={labelStyle}>Phone Number *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                  className={`${inputClass} pl-10`} style={inputStyle} placeholder="+1 (555) 000-0000" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass} style={labelStyle}>Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={`${inputClass} pl-10 pr-10`} style={inputStyle} placeholder="Min 6 characters" minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass} style={labelStyle}>Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className={`${inputClass} pl-10`} style={inputStyle} placeholder="Re-enter password" minLength={6} required />
              </div>
            </div>

            {/* Errors */}
            {error && (
              <div className="p-3 rounded-xl text-[14px] bg-red-50 text-red-600 border border-red-200">{error}</div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-[15px] font-medium disabled:opacity-50 transition-colors"
              style={{ background: '#6B1D2A' }}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Hint about profile */}
          <p className="mt-4 text-center text-[12px]" style={{ color: '#A89888' }}>
            You can add your address and other details in your Profile after signing in.
          </p>

          {/* Switch to login */}
          <div className="mt-4 text-center">
            <span className="text-[14px]" style={{ color: '#7A6B5F' }}>Already have an account? </span>
            <Link href="/login" className="text-[14px] font-medium" style={{ color: '#E8860C' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
