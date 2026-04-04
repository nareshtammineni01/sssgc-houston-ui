'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { FloatingInput, FloatingSelect, FloatingTextarea } from '@/components/ui/FloatingField';
import type { EducareEnrollment } from '@/types/database';

const AGE_GROUPS = [
  { value: 'group_1_5_9', label: 'Group 1 (Ages 5–9)' },
  { value: 'group_2_10_13', label: 'Group 2 (Ages 10–13)' },
  { value: 'group_3_14_18', label: 'Group 3 (Ages 14–18)' },
] as const;

export default function EducareEnrollPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [existingEnrollments, setExistingEnrollments] = useState<EducareEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [ageGroup, setAgeGroup] = useState<EducareEnrollment['age_group']>('group_1_5_9');
  const [enrollmentMode, setEnrollmentMode] = useState<'in_person' | 'remote'>('in_person');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/educare/enroll');
        return;
      }
      setUserId(user.id);

      // Fetch existing enrollments
      const { data } = await supabase
        .from('educare_enrollments')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      setExistingEnrollments(data ?? []);
      setLoading(false);
    })();
  }, []);

  // Auto-select age group based on age
  useEffect(() => {
    const age = parseInt(childAge, 10);
    if (isNaN(age)) return;
    if (age >= 5 && age <= 9) setAgeGroup('group_1_5_9');
    else if (age >= 10 && age <= 13) setAgeGroup('group_2_10_13');
    else if (age >= 14 && age <= 18) setAgeGroup('group_3_14_18');
  }, [childAge]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!childName.trim()) { setError('Child name is required'); return; }
    if (!childAge || parseInt(childAge) < 5 || parseInt(childAge) > 18) {
      setError('Age must be between 5 and 18');
      return;
    }

    setSaving(true);
    setError('');

    const { error: err } = await supabase.from('educare_enrollments').insert({
      parent_id: userId,
      child_name: childName.trim(),
      child_age: parseInt(childAge, 10),
      age_group: ageGroup,
      academic_year: academicYear,
      enrollment_mode: enrollmentMode,
      notes: notes || null,
    });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setChildName('');
    setChildAge('');
    setNotes('');
    setSaving(false);

    // Refresh enrollments
    const { data } = await supabase
      .from('educare_enrollments')
      .select('*')
      .eq('parent_id', userId)
      .order('created_at', { ascending: false });
    setExistingEnrollments(data ?? []);
  }

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center py-20">
        <div className="animate-pulse text-center" style={{ color: '#A89888' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/educare" className="p-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#7A6B5F' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-h1">Educare Enrollment</h1>
      </div>

      <p className="text-sm" style={{ color: '#7A6B5F' }}>
        Enroll your child in Sri Sathya Sai Educare classes for the {academicYear} academic year.
        Classes are held every Sunday at the center.
      </p>

      {/* Existing enrollments */}
      {existingEnrollments.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-medium mb-3" style={{ color: '#2C1810' }}>
            Your Enrollments
          </h2>
          <div className="space-y-2">
            {existingEnrollments.map((en) => (
              <div
                key={en.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: '#FDF8F0' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: '#2C1810' }}>{en.child_name}</p>
                  <p className="text-[11px]" style={{ color: '#7A6B5F' }}>
                    Age {en.child_age} &middot; {AGE_GROUPS.find((g) => g.value === en.age_group)?.label}
                    &middot; {en.enrollment_mode === 'in_person' ? 'In-person' : 'Remote'}
                  </p>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    en.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : en.status === 'waitlisted'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {en.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment form */}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Enrollment submitted!</p>
            <p className="text-xs text-green-600">You can enroll another child below.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <h2 className="text-sm font-medium flex items-center gap-2" style={{ color: '#2C1810' }}>
          <GraduationCap size={18} className="text-maroon-600" />
          Enroll a Child
        </h2>

        {error && (
          <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FloatingInput label="Child's Name" type="text" value={childName} onChange={(e) => setChildName(e.target.value)} required />
          <FloatingInput label="Age" type="number" value={childAge} onChange={(e) => setChildAge(e.target.value)} min={5} max={18} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FloatingSelect label="Age Group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as EducareEnrollment['age_group'])}>
            {AGE_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </FloatingSelect>
          <FloatingSelect label="Mode" value={enrollmentMode} onChange={(e) => setEnrollmentMode(e.target.value as 'in_person' | 'remote')}>
            <option value="in_person">In-person</option>
            <option value="remote">Remote</option>
          </FloatingSelect>
        </div>

        <FloatingTextarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

        <button
          type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: '#6B1D2A' }}
        >
          <GraduationCap size={16} />
          {saving ? 'Enrolling…' : 'Enroll Child'}
        </button>
      </form>
    </div>
  );
}
