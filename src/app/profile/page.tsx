'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, MapPin, Save, LogOut, CheckCircle } from 'lucide-react';
import MyFamily from '@/components/family/MyFamily';

interface Profile {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_opt_in: boolean;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  role: string;
  family_id: string | null;
  family_role: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      setError('Could not load profile.');
      setLoading(false);
      return;
    }

    setProfile(data);
    setFirstName(data.first_name ?? '');
    setLastName(data.last_name ?? '');
    setPhone(data.phone ?? '');
    setWhatsappOptIn(data.whatsapp_opt_in ?? false);
    setAddress1(data.address1 ?? '');
    setAddress2(data.address2 ?? '');
    setCity(data.city ?? '');
    setState(data.state ?? '');
    setZip(data.zip ?? '');
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || profile?.full_name || '';

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        full_name: fullName,
        phone: phone || null,
        whatsapp_opt_in: whatsappOptIn,
        address1: address1 || null,
        address2: address2 || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile!.id);

    setSaving(false);

    if (error) {
      setError('Failed to save. Please try again.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="logo-ripple-wrap">
            <span className="ripple-ring" />
            <img src="/sss-logo.webp" alt="Loading..." className="w-14 h-14 rounded-lg logo-loader" />
          </div>
          <p className="text-sm" style={{ color: '#A89888' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-enter max-w-2xl mx-auto text-center py-12">
        <p className="text-[16px]" style={{ color: '#7A6B5F' }}>
          {error || 'Profile not found. Please log in.'}
        </p>
      </div>
    );
  }

  const roleBadge: Record<string, { label: string; color: string; bg: string }> = {
    super_admin: { label: 'Super Admin', color: '#6B1D2A', bg: '#FDF8F0' },
    admin: { label: 'Admin', color: '#E8860C', bg: '#FFF3E0' },
    member: { label: 'Member', color: '#7A6B5F', bg: '#F5F5F5' },
  };

  const badge = roleBadge[profile.role] ?? roleBadge.member;

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      <h1 className="text-h1">My Profile</h1>

      {/* Profile header card */}
      <div className="card p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E8860C, #6B1D2A)' }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            (profile.full_name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] font-semibold truncate" style={{ color: '#2C1810' }}>
            {profile.full_name}
          </h2>
          <p className="text-[14px] truncate" style={{ color: '#7A6B5F' }}>
            {profile.email}
          </p>
          <span
            className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h3 className="text-[17px] font-semibold" style={{ color: '#2C1810' }}>
          Edit Details
        </h3>

        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>
            Email
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border bg-[#FDF8F0] text-[15px]"
            style={{ borderColor: 'rgba(107,29,42,0.1)', color: '#A89888' }}>
            <Mail size={16} />
            {profile.email}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
        </div>

        {/* WhatsApp opt-in */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="w-4 h-4 rounded accent-[#E8860C]"
          />
          <span className="text-[14px]" style={{ color: '#2C1810' }}>
            Receive WhatsApp notifications
          </span>
        </label>

        {/* Address */}
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>
            Address
          </label>
          <input
            type="text"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Street address"
            className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300 mb-3"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
          <input
            type="text"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Apt, suite, unit (optional)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
        </div>

        {/* City / State / Zip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>Zip</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <p className="text-[14px] text-red-600">{error}</p>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-[14px] text-green-600">
            <CheckCircle size={16} />
            Profile updated successfully!
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[15px] font-medium text-white transition-colors disabled:opacity-60"
          style={{ background: '#6B1D2A' }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* My Family */}
      <MyFamily
        userId={profile.id}
        familyId={profile.family_id}
        familyRole={profile.family_role}
        userName={profile.full_name}
      />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium border transition-colors hover:bg-red-50"
        style={{ borderColor: 'rgba(220,38,38,0.2)', color: '#DC2626' }}
      >
        <LogOut size={16} />
        Sign Out
      </button>

      {/* Member since */}
      <p className="text-[12px] pb-4" style={{ color: '#A89888' }}>
        Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
