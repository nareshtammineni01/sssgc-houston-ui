'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    city: '',
    state: '',
    whatsapp_opt_in: false,
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
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, city, state, whatsapp_opt_in')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
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

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        whatsapp_opt_in: profile.whatsapp_opt_in,
      })
      .eq('id', user.id);

    if (error) {
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={profile.phone ?? ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="input"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={profile.city ?? ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={profile.state ?? ''}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="whatsapp"
            type="checkbox"
            checked={profile.whatsapp_opt_in}
            onChange={(e) => setProfile({ ...profile, whatsapp_opt_in: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-saffron-500 focus:ring-saffron-400"
          />
          <label htmlFor="whatsapp" className="text-sm text-gray-700">
            Receive WhatsApp notifications
          </label>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          <Save size={18} className="mr-2" />
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
