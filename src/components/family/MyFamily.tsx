'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, UserPlus, Copy, CheckCircle, Pencil, Trash2, X, Baby, Heart, User, UserCheck,
  Mail, Send, Loader2,
} from 'lucide-react';
import { FloatingInput, FloatingSelect } from '@/components/ui/FloatingField';

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string | null;
  relationship: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface LinkedProfile {
  id: string;
  full_name: string;
  email: string | null;
  family_role: string | null;
}

interface Family {
  id: string;
  family_name: string;
  invite_code: string;
}

interface MyFamilyProps {
  userId: string;
  familyId: string | null;
  familyRole: string | null;
  userName: string;
}

const relationshipIcons: Record<string, any> = {
  spouse: Heart,
  child: Baby,
  parent: UserCheck,
  sibling: User,
  other: User,
};

function getSSEGroup(dob: string | null): string | null {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;

  if (age >= 5 && age <= 8) return 'Group 1 (5-8)';
  if (age >= 9 && age <= 12) return 'Group 2 (9-12)';
  if (age >= 13 && age <= 17) return 'Group 3 (13-17)';
  if (age < 5) return `${age} yrs old`;
  return `${age} yrs old`;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function MyFamily({ userId, familyId, familyRole, userName }: MyFamilyProps) {
  const supabase = createClient();

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [linkedProfiles, setLinkedProfiles] = useState<LinkedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Create family state
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');

  // Join family state
  const [showJoinFamily, setShowJoinFamily] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // Add/Edit member state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    first_name: '',
    last_name: '',
    relationship: 'child',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Spouse email lookup state
  const [spouseLookup, setSpouseLookup] = useState<{
    searching: boolean;
    found: boolean;
    name: string | null;
    email: string;
    hasFamily: boolean;
  }>({ searching: false, found: false, name: null, email: '', hasFamily: false });
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Debounced spouse email lookup
  async function lookupSpouseByEmail(email: string) {
    if (!email || !email.includes('@')) {
      setSpouseLookup({ searching: false, found: false, name: null, email, hasFamily: false });
      return;
    }

    setSpouseLookup(prev => ({ ...prev, searching: true, email }));

    const { data } = await supabase
      .from('profiles')
      .select('full_name, family_id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (data) {
      setSpouseLookup({
        searching: false,
        found: true,
        name: data.full_name,
        email,
        hasFamily: !!data.family_id,
      });
    } else {
      setSpouseLookup({ searching: false, found: false, name: null, email, hasFamily: false });
    }
  }

  async function handleSendFamilyInvite(email: string) {
    if (!family?.invite_code) return;
    setInviteSending(true);
    setError('');

    try {
      const res = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          familyName: family.family_name,
          inviteCode: family.invite_code,
          senderName: userName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setInviteSent(true);
        setSuccess(data.message || `Share invite code ${family.invite_code} with ${email}`);
        setTimeout(() => setInviteSent(false), 5000);
      } else {
        setError(data.error || 'Something went wrong. Please share the invite code directly.');
      }
    } catch {
      setError('Network error. Please share the invite code directly with your spouse.');
    } finally {
      setInviteSending(false);
    }
  }

  useEffect(() => {
    if (familyId) {
      fetchFamilyData();
    } else {
      setLoading(false);
    }
  }, [familyId]);

  async function fetchFamilyData() {
    setLoading(true);

    // Fetch family
    const { data: fam } = await supabase
      .from('families')
      .select('id, family_name, invite_code')
      .eq('id', familyId!)
      .single();
    setFamily(fam);

    // Fetch family members (dependents)
    const { data: mems } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId!)
      .order('relationship', { ascending: true })
      .order('first_name', { ascending: true });
    setMembers(mems ?? []);

    // Fetch linked profiles (people with accounts in same family)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, family_role')
      .eq('family_id', familyId!)
      .neq('id', userId);
    setLinkedProfiles(profiles ?? []);

    setLoading(false);
  }

  async function handleCreateFamily() {
    if (!familyName.trim()) return;
    setActionLoading(true);
    setError('');

    const { data, error } = await supabase.rpc('create_my_family', {
      p_family_name: familyName.trim(),
    });

    setActionLoading(false);

    if (error || data?.error) {
      setError(data?.error || error?.message || 'Failed to create family');
      return;
    }

    setSuccess('Family created! Share the invite code with your spouse.');
    setShowCreateFamily(false);
    // Reload page to pick up new family_id
    window.location.reload();
  }

  async function handleJoinFamily() {
    if (!inviteCode.trim()) return;
    setActionLoading(true);
    setError('');

    const { data, error } = await supabase.rpc('join_family_by_code', {
      p_invite_code: inviteCode.trim(),
    });

    setActionLoading(false);

    if (error || data?.error) {
      setError(data?.error || error?.message || 'Failed to join family');
      return;
    }

    setSuccess('Joined family successfully!');
    setShowJoinFamily(false);
    window.location.reload();
  }

  async function handleLeaveFamily() {
    if (!confirm('Are you sure you want to leave this family?')) return;
    setActionLoading(true);

    const { data, error } = await supabase.rpc('leave_family');
    setActionLoading(false);

    if (error || data?.error) {
      setError(data?.error || error?.message || 'Failed to leave family');
      return;
    }

    window.location.reload();
  }

  function openAddMember() {
    setEditingMember(null);
    setMemberForm({
      first_name: '', last_name: '', relationship: 'child',
      date_of_birth: '', gender: '', phone: '', email: '', notes: '',
    });
    setSpouseLookup({ searching: false, found: false, name: null, email: '', hasFamily: false });
    setInviteSent(false);
    setShowMemberForm(true);
    setError('');
  }

  function openEditMember(member: FamilyMember) {
    setEditingMember(member);
    setMemberForm({
      first_name: member.first_name,
      last_name: member.last_name ?? '',
      relationship: member.relationship,
      date_of_birth: member.date_of_birth ?? '',
      gender: member.gender ?? '',
      phone: member.phone ?? '',
      email: member.email ?? '',
      notes: member.notes ?? '',
    });
    setShowMemberForm(true);
    setError('');
  }

  async function handleSaveMember() {
    if (!memberForm.first_name.trim()) {
      setError('First name is required');
      return;
    }
    setActionLoading(true);
    setError('');

    const payload = {
      family_id: familyId!,
      added_by: userId,
      first_name: memberForm.first_name.trim(),
      last_name: memberForm.last_name.trim() || null,
      relationship: memberForm.relationship,
      date_of_birth: memberForm.date_of_birth || null,
      gender: memberForm.gender || null,
      phone: memberForm.phone.trim() || null,
      email: memberForm.email.trim() || null,
      notes: memberForm.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingMember) {
      const { error } = await supabase
        .from('family_members')
        .update(payload)
        .eq('id', editingMember.id);
      if (error) {
        setError('Failed to update member');
        setActionLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('family_members')
        .insert(payload);
      if (error) {
        setError('Failed to add member');
        setActionLoading(false);
        return;
      }
    }

    setActionLoading(false);
    setShowMemberForm(false);
    fetchFamilyData();
  }

  async function handleDeleteMember(id: string, name: string) {
    if (!confirm(`Remove ${name} from your family?`)) return;

    await supabase.from('family_members').delete().eq('id', id);
    fetchFamilyData();
  }

  function copyInviteCode() {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border text-[15px] focus:outline-none focus:ring-2 focus:ring-saffron-300';
  const inputStyle = { borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' };

  // ── No family yet ──
  if (!familyId) {
    return (
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} style={{ color: '#6B1D2A' }} />
          <h3 className="text-[17px] font-semibold" style={{ color: '#2C1810' }}>My Family</h3>
        </div>
        <p className="text-[14px]" style={{ color: '#7A6B5F' }}>
          Create a family to add your spouse, children, and other members. Or join an existing family with an invite code.
        </p>

        {error && <p className="text-[14px] text-red-600">{error}</p>}
        {success && <p className="text-[14px] text-green-600">{success}</p>}

        {!showCreateFamily && !showJoinFamily && (
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreateFamily(true); setShowJoinFamily(false); setFamilyName(`${userName}'s Family`); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white transition-colors"
              style={{ background: '#6B1D2A' }}
            >
              <UserPlus size={16} />
              Create Family
            </button>
            <button
              onClick={() => { setShowJoinFamily(true); setShowCreateFamily(false); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium border transition-colors hover:bg-cream-50"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#6B1D2A' }}
            >
              Join Family
            </button>
          </div>
        )}

        {/* Create family form */}
        {showCreateFamily && (
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>Family Name</label>
              <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="e.g. The Sharma Family" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateFamily} disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-[14px] font-medium text-white disabled:opacity-60"
                style={{ background: '#6B1D2A' }}>
                {actionLoading ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreateFamily(false)}
                className="px-4 py-2.5 rounded-xl text-[14px]" style={{ color: '#7A6B5F' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Join family form */}
        {showJoinFamily && (
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#7A6B5F' }}>Family Invite Code</label>
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className={inputClass} style={inputStyle} placeholder="e.g. SSSGC-A3B5K"
                maxLength={11} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleJoinFamily} disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-[14px] font-medium text-white disabled:opacity-60"
                style={{ background: '#6B1D2A' }}>
                {actionLoading ? 'Joining...' : 'Join Family'}
              </button>
              <button onClick={() => setShowJoinFamily(false)}
                className="px-4 py-2.5 rounded-xl text-[14px]" style={{ color: '#7A6B5F' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Has family ──
  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} style={{ color: '#6B1D2A' }} />
          <h3 className="text-[17px] font-semibold" style={{ color: '#2C1810' }}>
            {family?.family_name || 'My Family'}
          </h3>
        </div>
        <button
          onClick={openAddMember}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-white transition-colors"
          style={{ background: '#E8860C' }}
        >
          <UserPlus size={14} />
          Add Member
        </button>
      </div>

      {/* Invite code */}
      {family?.invite_code && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#FDF8F0' }}>
          <div className="flex-1">
            <p className="text-[12px] font-medium" style={{ color: '#7A6B5F' }}>Family Invite Code</p>
            <p className="text-[16px] font-semibold tracking-wider" style={{ color: '#6B1D2A' }}>
              {family.invite_code}
            </p>
          </div>
          <button onClick={copyInviteCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors hover:bg-white"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: copied ? '#16A34A' : '#7A6B5F' }}>
            {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
      )}

      {error && <p className="text-[14px] text-red-600">{error}</p>}
      {success && <p className="text-[14px] text-green-600">{success}</p>}

      {/* Linked profiles (people with accounts) */}
      {linkedProfiles.length > 0 && (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider mb-2" style={{ color: '#A89888' }}>
            Family Members with Accounts
          </p>
          <div className="space-y-2">
            {linkedProfiles.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #E8860C, #6B1D2A)' }}>
                  {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium truncate" style={{ color: '#2C1810' }}>{p.full_name}</p>
                  <p className="text-[12px]" style={{ color: '#A89888' }}>
                    {p.family_role ? p.family_role.charAt(0).toUpperCase() + p.family_role.slice(1) : 'Member'}
                    {p.email && ` · ${p.email}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family members (dependents) */}
      {members.length > 0 && (
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider mb-2" style={{ color: '#A89888' }}>
            Dependents & Children
          </p>
          <div className="space-y-2">
            {members.map((m) => {
              const Icon = relationshipIcons[m.relationship] || User;
              const age = calculateAge(m.date_of_birth);
              const sseGroup = m.relationship === 'child' ? getSSEGroup(m.date_of_birth) : null;

              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: '#FDF8F0' }}>
                    <Icon size={18} style={{ color: '#E8860C' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium truncate" style={{ color: '#2C1810' }}>
                      {m.first_name} {m.last_name || ''}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] capitalize" style={{ color: '#7A6B5F' }}>
                        {m.relationship}
                      </span>
                      {age !== null && (
                        <span className="text-[12px]" style={{ color: '#A89888' }}>
                          · {age} yrs
                        </span>
                      )}
                      {sseGroup && age !== null && age >= 5 && age <= 17 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#FFF3E0', color: '#E8860C' }}>
                          SSE {sseGroup}
                        </span>
                      )}
                      {m.notes && (
                        <span className="text-[11px]" style={{ color: '#A89888' }}>· {m.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditMember(m)}
                      className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors">
                      <Pencil size={14} style={{ color: '#7A6B5F' }} />
                    </button>
                    <button onClick={() => handleDeleteMember(m.id, m.first_name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} style={{ color: '#DC2626' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {members.length === 0 && linkedProfiles.length === 0 && (
        <div className="text-center py-6">
          <Users size={32} className="mx-auto mb-2" style={{ color: '#A89888' }} />
          <p className="text-[14px]" style={{ color: '#7A6B5F' }}>
            No family members yet. Add your spouse, children, or other dependents.
          </p>
        </div>
      )}

      {/* Leave family */}
      {familyRole !== 'head' && (
        <button onClick={handleLeaveFamily}
          className="text-[13px] font-medium transition-colors hover:underline" style={{ color: '#DC2626' }}>
          Leave this family
        </button>
      )}

      {/* ── Add/Edit Member Modal ── */}
      {showMemberForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold" style={{ color: '#2C1810' }}>
                {editingMember ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
              <button onClick={() => setShowMemberForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} style={{ color: '#7A6B5F' }} />
              </button>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput label="First Name *" type="text" value={memberForm.first_name}
                onChange={(e) => setMemberForm(f => ({ ...f, first_name: e.target.value }))} required />
              <FloatingInput label="Last Name" type="text" value={memberForm.last_name}
                onChange={(e) => setMemberForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>

            {/* Relationship */}
            <FloatingSelect label="Relationship *" value={memberForm.relationship}
              onChange={(e) => setMemberForm(f => ({ ...f, relationship: e.target.value }))}>
              <option value="child">Child</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </FloatingSelect>

            {/* Date of Birth - only for children */}
            {memberForm.relationship === 'child' && (
              <FloatingInput label="Date of Birth (for SSE grouping)" type="date" value={memberForm.date_of_birth}
                onChange={(e) => setMemberForm(f => ({ ...f, date_of_birth: e.target.value }))} />
            )}

            {/* Gender */}
            <FloatingSelect label="Gender" value={memberForm.gender}
              onChange={(e) => setMemberForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="">-- Select --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </FloatingSelect>

            {/* Email (for spouse) - with lookup */}
            {memberForm.relationship === 'spouse' && (
              <div>
                <div className="relative">
                  <FloatingInput label="Spouse Email (check existing account)" type="email" value={memberForm.email}
                    icon={<Mail size={16} />}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMemberForm(f => ({ ...f, email: val }));
                      const timeout = setTimeout(() => lookupSpouseByEmail(val), 600);
                      return () => clearTimeout(timeout);
                    }} />
                  {spouseLookup.searching && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: '#A89888' }} />
                  )}
                </div>

                {/* Lookup result */}
                {memberForm.email && !spouseLookup.searching && spouseLookup.found && (
                  <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} style={{ color: '#16a34a' }} />
                      <span className="text-[13px] font-medium" style={{ color: '#16a34a' }}>
                        Account found: {spouseLookup.name}
                      </span>
                    </div>
                    {spouseLookup.hasFamily ? (
                      <p className="text-[12px] mt-1 ml-5" style={{ color: '#7A6B5F' }}>
                        This person is already part of a family.
                      </p>
                    ) : family?.invite_code ? (
                      <div className="mt-2 ml-5">
                        <p className="text-[12px] mb-2" style={{ color: '#7A6B5F' }}>
                          They don&apos;t have a family yet. Send them an invite to join yours!
                        </p>
                        <button
                          onClick={() => handleSendFamilyInvite(memberForm.email)}
                          disabled={inviteSending || inviteSent}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white disabled:opacity-60 transition-colors"
                          style={{ background: inviteSent ? '#16a34a' : '#E8860C' }}
                        >
                          {inviteSending ? (
                            <><Loader2 size={12} className="animate-spin" /> Sending...</>
                          ) : inviteSent ? (
                            <><CheckCircle size={12} /> Invite Sent!</>
                          ) : (
                            <><Send size={12} /> Send Family Invite</>
                          )}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {memberForm.email && memberForm.email.includes('@') && !spouseLookup.searching && !spouseLookup.found && (
                  <p className="text-[12px] mt-1.5 ml-1" style={{ color: '#A89888' }}>
                    No account found with this email. They can sign up and join using your family invite code.
                  </p>
                )}
              </div>
            )}

            {/* Phone (for spouse/parent) */}
            {(memberForm.relationship === 'spouse' || memberForm.relationship === 'parent') && (
              <FloatingInput label="Phone" type="tel" value={memberForm.phone}
                onChange={(e) => setMemberForm(f => ({ ...f, phone: e.target.value }))} />
            )}

            {/* Notes */}
            <FloatingInput label="Notes (allergies, special needs, etc.)" type="text" value={memberForm.notes}
              onChange={(e) => setMemberForm(f => ({ ...f, notes: e.target.value }))} />

            {error && <p className="text-[13px] text-red-600">{error}</p>}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveMember} disabled={actionLoading}
                className="flex-1 px-5 py-2.5 rounded-xl text-[14px] font-medium text-white disabled:opacity-60"
                style={{ background: '#6B1D2A' }}>
                {actionLoading ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
              </button>
              <button onClick={() => setShowMemberForm(false)}
                className="px-5 py-2.5 rounded-xl text-[14px] border" style={{ color: '#7A6B5F', borderColor: 'rgba(107,29,42,0.15)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
