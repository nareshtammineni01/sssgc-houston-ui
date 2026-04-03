'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Plus, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { VolunteerHours } from '@/types/database';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

export default function SevaHoursPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<VolunteerHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [hours, setHours] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login?redirect=/dashboard/seva-hours'; return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('volunteer_hours')
        .select('*')
        .eq('user_id', user.id)
        .order('service_date', { ascending: false });

      setEntries(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!projectName.trim() || !hours || !serviceDate || !userId) {
      setError('Project name, hours, and date are required.');
      return;
    }

    setSaving(true);
    setError('');

    const { data, error: err } = await supabase
      .from('volunteer_hours')
      .insert({
        user_id: userId,
        project_name: projectName.trim(),
        hours: parseFloat(hours),
        service_date: serviceDate,
        description: description || null,
      })
      .select('*')
      .single();

    if (err) { setError(err.message); setSaving(false); return; }

    setEntries([data, ...entries]);
    setProjectName('');
    setHours('');
    setServiceDate('');
    setDescription('');
    setShowForm(false);
    setSaving(false);
  }

  const totalApproved = entries
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.hours, 0);

  const totalPending = entries
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.hours, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: '#A89888' }} />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#7A6B5F' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-h1">Seva Hours</h1>
            <p className="text-sm" style={{ color: '#7A6B5F' }}>
              Track your service contributions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: '#6B1D2A' }}
        >
          <Plus size={18} />
          Log Hours
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#2C1810' }}>{totalApproved}</p>
          <p className="text-xs" style={{ color: '#7A6B5F' }}>Approved Hours</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: '#E8860C' }}>{totalPending}</p>
          <p className="text-xs" style={{ color: '#7A6B5F' }}>Pending Review</p>
        </div>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-medium" style={{ color: '#2C1810' }}>Log New Hours</h2>
          {error && (
            <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810' }}>Project / Activity</label>
              <input
                type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Food distribution"
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
                style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810' }}>Hours</label>
              <input
                type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
                style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810' }}>Date</label>
              <input
                type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
                style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810' }}>Description (optional)</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={2} placeholder="Brief description of your service..."
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-cream-100" style={{ color: '#7A6B5F' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: '#6B1D2A' }}>
              {saving ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: '#A89888' }}>
          <Clock size={40} className="mx-auto mb-3" />
          <p>No seva hours logged yet.</p>
          <p className="text-xs mt-1">Click &quot;Log Hours&quot; to record your service.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const StatusIcon = statusIcons[entry.status] || Clock;
            return (
              <div key={entry.id} className="card p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusColors[entry.status]}`}>
                    <StatusIcon size={12} />
                    {entry.status}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>{entry.project_name}</p>
                  {entry.description && (
                    <p className="text-xs truncate" style={{ color: '#7A6B5F' }}>{entry.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: '#2C1810' }}>{entry.hours}h</p>
                  <p className="text-[11px]" style={{ color: '#A89888' }}>{entry.service_date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
