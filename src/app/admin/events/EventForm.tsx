'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Trash2, Repeat } from 'lucide-react';
import { FloatingInput, FloatingSelect, FloatingTextarea } from '@/components/ui/FloatingField';
import type { Event } from '@/types/database';

type EventCategory = Event['category'];

interface EventFormProps {
  mode: 'create' | 'edit';
  event?: Event | null;
  userId: string;
}

const RRULE_PRESETS = [
  { label: 'No recurrence', value: '' },
  { label: 'Every week (same day)', value: 'FREQ=WEEKLY' },
  { label: 'Every Saturday', value: 'FREQ=WEEKLY;BYDAY=SA' },
  { label: 'Every Sunday', value: 'FREQ=WEEKLY;BYDAY=SU' },
  { label: 'Every 2 weeks', value: 'FREQ=WEEKLY;INTERVAL=2' },
  { label: 'Every month', value: 'FREQ=MONTHLY' },
  { label: 'Custom...', value: 'custom' },
];

export default function EventForm({ mode, event, userId }: EventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [category, setCategory] = useState<EventCategory>(event?.category ?? 'devotion');
  const [location, setLocation] = useState(event?.location ?? '4515 FM 1463, Katy, TX 77494');
  const [startTime, setStartTime] = useState(
    event?.start_time ? event.start_time.slice(0, 16) : ''
  );
  const [endTime, setEndTime] = useState(
    event?.end_time ? event.end_time.slice(0, 16) : ''
  );
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [maxCapacity, setMaxCapacity] = useState(event?.max_capacity?.toString() ?? '');
  const [isRecurring, setIsRecurring] = useState(event?.is_recurring ?? false);
  const [rrule, setRrule] = useState(event?.rrule ?? '');
  const [rrulePreset, setRrulePreset] = useState(
    event?.rrule
      ? RRULE_PRESETS.find((p) => p.value === event.rrule)
        ? event.rrule
        : 'custom'
      : ''
  );
  const [isCancelled, setIsCancelled] = useState(event?.is_cancelled ?? false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handlePresetChange(val: string) {
    setRrulePreset(val);
    if (val === '' || val === 'custom') {
      setIsRecurring(val === 'custom');
      if (val === '') setRrule('');
    } else {
      setIsRecurring(true);
      setRrule(val);
    }
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!startTime) { setError('Start time is required'); return; }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description || null,
      category,
      location: location || null,
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : null,
      all_day: allDay,
      max_capacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
      is_recurring: isRecurring,
      rrule: isRecurring && rrule ? rrule : null,
      is_cancelled: isCancelled,
    };

    let result;
    if (mode === 'create') {
      result = await supabase
        .from('events')
        .insert({ ...payload, author_id: userId });
    } else {
      result = await supabase
        .from('events')
        .update(payload)
        .eq('id', event!.id);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    startTransition(() => {
      router.push('/admin/events');
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!event) return;
    if (!window.confirm('Delete this event permanently?')) return;

    setSaving(true);
    const { error: err } = await supabase.from('events').delete().eq('id', event.id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    startTransition(() => {
      router.push('/admin/events');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Title */}
      <FloatingInput label="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* Category */}
      <div className="grid grid-cols-2 gap-4">
        <FloatingSelect label="Category" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
          <option value="devotion">Devotion</option>
          <option value="educare">Educare</option>
          <option value="seva">Seva</option>
          <option value="festival">Festival</option>
        </FloatingSelect>
        <FloatingInput label="Location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      {/* All day + Times */}
      <div>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)}
            className="rounded border-gray-300 text-saffron-500 focus:ring-saffron-300"
          />
          <span className="text-sm" style={{ color: '#2C1810' }}>All-day event</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            label={allDay ? 'Date' : 'Start Time'}
            type={allDay ? 'date' : 'datetime-local'}
            value={allDay ? startTime.slice(0, 10) : startTime}
            onChange={(e) => setStartTime(allDay ? e.target.value + 'T00:00' : e.target.value)}
          />
          {!allDay && (
            <FloatingInput label="End Time" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          )}
        </div>
      </div>

      {/* Max capacity */}
      <div className="w-48">
        <FloatingInput label="Max Capacity (optional)" type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} hint="Leave blank for unlimited" />
      </div>

      {/* Recurrence */}
      <div className="space-y-2">
        <FloatingSelect label="Recurrence" value={rrulePreset} onChange={(e) => handlePresetChange(e.target.value)}>
          {RRULE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </FloatingSelect>
        {rrulePreset === 'custom' && (
          <FloatingInput label="Custom RRULE" type="text" value={rrule} onChange={(e) => setRrule(e.target.value)} />
        )}
      </div>

      {/* Description */}
      <FloatingTextarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

      {/* Cancelled toggle (edit only) */}
      {mode === 'edit' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={isCancelled} onChange={(e) => setIsCancelled(e.target.checked)}
            className="rounded border-gray-300 text-red-500 focus:ring-red-300"
          />
          <span className="text-sm text-red-600">Mark as cancelled</span>
        </label>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(107,29,42,0.1)' }}>
        <div>
          {mode === 'edit' && (
            <button onClick={handleDelete} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: '#6B1D2A' }}>
          <Save size={16} />
          {saving ? 'Saving…' : mode === 'create' ? 'Create Event' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
