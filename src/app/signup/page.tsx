'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import Link from 'next/link';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address1: '',
    address2: '',
    city: '',
    state: 'TX',
    zip: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

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
          address1: form.address1.trim() || null,
          address2: form.address2.trim() || null,
          city: form.city.trim() || null,
          state: form.state || null,
          zip: form.zip.trim() || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage('Check your email for a confirmation link! You can close this page.');
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
    'w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8860C]/40 transition-colors';
  const inputStyle = { borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' };
  const labelClass = 'block text-sm font-medium mb-1';
  const labelStyle = { color: '#2C1810' };

  return (
    <div className="page-enter flex items-center justify-center py-8">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-heading text-xl font-semibold"
              style={{ background: 'linear-gradient(135deg, #E8860C, #6B1D2A)' }}>
              S
            </div>
            <h1 className="text-xl font-heading font-semibold" style={{ color: '#6B1D2A' }}>
              Create Your Account
            </h1>
            <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
              Join the SSSGC Houston community
            </p>
          </div>

          {/* Google signup */}
          <button onClick={handleGoogleSignUp} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50"
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
            <span className="text-xs" style={{ color: '#A89888' }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(107,29,42,0.1)' }} />
          </div>

          {/* Form */}
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
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  className={`${inputClass} pl-9`} style={inputStyle} placeholder="you@example.com" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass} style={labelStyle}>Phone Number *</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className={inputClass} style={inputStyle} placeholder="+1 (555) 000-0000" required />
            </div>

            {/* Address */}
            <div>
              <label className={labelClass} style={labelStyle}>Address Line 1 *</label>
              <input type="text" value={form.address1} onChange={(e) => update('address1', e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Street address" required />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Address Line 2</label>
              <input type="text" value={form.address2} onChange={(e) => update('address2', e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Apt, suite, unit (optional)" />
            </div>

            {/* City / State / Zip */}
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-3">
                <label className={labelClass} style={labelStyle}>City *</label>
                <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="City" required />
              </div>
              <div className="col-span-1">
                <label className={labelClass} style={labelStyle}>State *</label>
                <select value={form.state} onChange={(e) => update('state', e.target.value)}
                  className={inputClass} style={inputStyle} required>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass} style={labelStyle}>Zip *</label>
                <input type="text" value={form.zip} onChange={(e) => update('zip', e.target.value)}
                  className={inputClass} style={inputStyle} placeholder="77494" required maxLength={10} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass} style={labelStyle}>Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={`${inputClass} pl-9 pr-10`} style={inputStyle} placeholder="Min 6 characters" minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className={`${inputClass} pl-9`} style={inputStyle} placeholder="Re-enter password" minLength={6} required />
              </div>
            </div>

            {/* Errors / Messages */}
            {error && (
              <div className="p-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-200">{error}</div>
            )}
            {message && (
              <div className="p-3 rounded-xl text-sm bg-green-50 text-green-600 border border-green-200">{message}</div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ background: '#6B1D2A' }}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-5 text-center">
            <span className="text-sm" style={{ color: '#7A6B5F' }}>Already have an account? </span>
            <Link href={`/login${redirect !== '/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-sm font-medium" style={{ color: '#E8860C' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
