'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, LogOut } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    whatsapp_opt_in: false,
  });
  const [directory, setDirectory] = useState({
    show_in_directory: false,
    show_phone: false,
    show_email: false,
    show_city: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const [profileRes, dirRes] = await Promise.all([
        supabase.from('profiles')
          .select('first_name, last_name, phone, address1, address2, city, state, zip, whatsapp_opt_in')
          .eq('id', user.id).single(),
        supabase.from('member_directory_settings')
          .select('show_in_directory, show_phone, show_email, show_city')
          .eq('user_id', user.id).single(),
      ]);
      if (profileRes.data) {
        setProfile({
          first_name: profileRes.data.first_name ?? '',
          last_name: profileRes.data.last_name ?? '',
          phone: profileRes.data.phone ?? '',
          address1: profileRes.data.address1 ?? '',
          address2: profileRes.data.address2 ?? '',
          city: profileRes.data.city ?? '',
          state: profileRes.data.state ?? '',
          zip: profileRes.data.zip ?? '',
          whatsapp_opt_in: profileRes.data.whatsapp_opt_in,
        });
      }
      if (dirRes.data) setDirectory(dirRes.data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fullName = `${profile.first_name.trim()} ${profile.last_name.trim()}`.trim();

    const [profileRes, dirRes] = await Promise.all([
      supabase.from('profiles').update({
        first_name: profile.first_name.trim() || null,
        last_name: profile.last_name.trim() || null,
        full_name: fullName,
        phone: profile.phone.trim() || null,
        address1: profile.address1.trim() || null,
        address2: profile.address2.trim() || null,
        city: profile.city.trim() || null,
        state: profile.state || null,
        zip: profile.zip.trim() || null,
        whatsapp_opt_in: profile.whatsapp_opt_in,
      }).eq('id', user.id),
      supabase.from('member_directory_settings').upsert({
        user_id: user.id,
        show_in_directory: directory.show_in_directory,
        show_phone: directory.show_phone,
        show_email: directory.show_email,
        show_city: directory.show_city,
      }),
    ]);

    if (profileRes.error || dirRes.error) {
      setMessage('Failed to save. Please try again.');
    } else {
      setMessage('Profile updated!');
      router.refresh();
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8860C]/40 transition-colors';
  const inputStyle = { borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' };
  const labelClass = 'block text-sm font-medium mb-1';
  const labelStyle = { color: '#2C1810' };

  if (loading) {
    return (
      <div className="page-enter max-w-xl mx-auto">
        <div className="card p-8 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-xl mx-auto space-y-6">
      <h1 className="text-h1">Settings</h1>

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h2 className="text-h3">Edit Profile</h2>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>First Name</label>
            <input type="text" value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              className={inputClass} style={inputStyle} required />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Last Name</label>
            <input type="text" value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              className={inputClass} style={inputStyle} required />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass} style={labelStyle}>Phone</label>
          <input type="tel" value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className={inputClass} style={inputStyle} placeholder="+1 (555) 000-0000" />
        </div>

        {/* Address */}
        <div>
          <label className={labelClass} style={labelStyle}>Address Line 1</label>
          <input type="text" value={profile.address1}
            onChange={(e) => setProfile({ ...profile, address1: e.target.value })}
            className={inputClass} style={inputStyle} placeholder="Street address" />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Address Line 2</label>
          <input type="text" value={profile.address2}
            onChange={(e) => setProfile({ ...profile, address2: e.target.value })}
            className={inputClass} style={inputStyle} placeholder="Apt, suite, unit (optional)" />
        </div>

        {/* City / State / Zip */}
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <label className={labelClass} style={labelStyle}>City</label>
            <input type="text" value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className={inputClass} style={inputStyle} />
          </div>
          <div className="col-span-1">
            <label className={labelClass} style={labelStyle}>State</label>
            <select value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className={inputClass} style={inputStyle}>
              <option value="">—</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass} style={labelStyle}>Zip</label>
            <input type="text" value={profile.zip}
              onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
              className={inputClass} style={inputStyle} placeholder="77494" maxLength={10} />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-center gap-3">
          <input id="whatsapp" type="checkbox" checked={profile.whatsapp_opt_in}
            onChange={(e) => setProfile({ ...profile, whatsapp_opt_in: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-saffron-500 focus:ring-saffron-400" />
          <label htmlFor="whatsapp" className="text-sm" style={{ color: '#7A6B5F' }}>
            Receive WhatsApp notifications
          </label>
        </div>

        {/* Directory privacy */}
        <div className="pt-4 border-t" style={{ borderColor: 'rgba(107,29,42,0.1)' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: '#2C1810' }}>Member Directory</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm" style={{ color: '#7A6B5F' }}>
              <input type="checkbox" checked={directory.show_in_directory}
                onChange={(e) => setDirectory({ ...directory, show_in_directory: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-saffron-500 focus:ring-saffron-400" />
              Show me in the member directory
            </label>
            {directory.show_in_directory && (
              <div className="ml-7 space-y-2">
                <label className="flex items-center gap-3 text-sm" style={{ color: '#7A6B5F' }}>
                  <input type="checkbox" checked={directory.show_email}
                    onChange={(e) => setDirectory({ ...directory, show_email: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-saffron-500 focus:ring-saffron-400" />
                  Show my email
                </label>
                <label className="flex items-center gap-3 text-sm" style={{ color: '#7A6B5F' }}>
                  <input type="checkbox" checked={directory.show_phone}
                    onChange={(e) => setDirectory({ ...directory, show_phone: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-saffron-500 focus:ring-saffron-400" />
                  Show my phone number
                </label>
                <label className="flex items-center gap-3 text-sm" style={{ color: '#7A6B5F' }}>
                  <input type="checkbox" checked={directory.show_city}
                    onChange={(e) => setDirectory({ ...directory, show_city: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-saffron-500 focus:ring-saffron-400" />
                  Show my city/state
                </label>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
          style={{ background: '#6B1D2A' }}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="card p-6">
        <h2 className="text-h3 mb-3">Account</h2>
        <button onClick={handleSignOut} className="btn-outline text-red-500 border-red-300 hover:bg-red-50 w-full">
          <LogOut size={18} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
