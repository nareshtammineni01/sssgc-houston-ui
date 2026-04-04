'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Users, Home, Search, Filter, KeyRound, CheckCircle2, X, MoreVertical,
  Eye, Mail, Phone, MapPin, Calendar, Shield, Baby, Heart, UserCheck, User,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address1?: string | null;
  address2?: string | null;
  zip?: string | null;
  whatsapp_opt_in?: boolean;
  role: string;
  family_id: string | null;
  family_role: string | null;
  created_at: string;
};

type Family = {
  id: string;
  family_name: string;
  invite_code?: string;
  created_at: string;
};

type Dependent = {
  id: string;
  family_id: string;
  first_name: string;
  last_name: string | null;
  relationship: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  notes: string | null;
};

interface MembersTabsProps {
  members: Member[];
  families: Family[];
  membersByFamily: Record<string, Member[]>;
  unassigned: Member[];
  dependentsByFamily: Record<string, Dependent[]>;
}

const roleColors: Record<string, string> = {
  member: 'bg-gray-100 text-gray-600',
  admin: 'bg-saffron-50 text-saffron-600',
  super_admin: 'bg-maroon-50 text-maroon-600',
};

const familyRoleLabels: Record<string, string> = {
  head: 'Head',
  spouse: 'Spouse',
  child: 'Child',
  other: 'Other',
};

const relationshipIcons: Record<string, typeof Heart> = {
  spouse: Heart,
  child: Baby,
  parent: UserCheck,
  sibling: User,
  other: User,
};

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getSSEGroup(dob: string | null): string | null {
  const age = calculateAge(dob);
  if (age === null) return null;
  if (age >= 5 && age <= 8) return 'Group 1';
  if (age >= 9 && age <= 12) return 'Group 2';
  if (age >= 13 && age <= 17) return 'Group 3';
  return null;
}

export default function MembersTabs({ members, families, membersByFamily, unassigned, dependentsByFamily }: MembersTabsProps) {
  const [tab, setTab] = useState<'members' | 'families'>('members');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset password
  const [resetSending, setResetSending] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Reset confirmation modal
  const [confirmResetEmail, setConfirmResetEmail] = useState<string | null>(null);
  const [confirmResetName, setConfirmResetName] = useState<string>('');

  // View member modal
  const [viewMember, setViewMember] = useState<Member | null>(null);

  // Family detail modal
  const [viewFamily, setViewFamily] = useState<Family | null>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search) ||
      m.city?.toLowerCase().includes(search.toLowerCase()) ||
      m.state?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter families
  const filteredFamilies = families.filter((f) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const fm = membersByFamily[f.id] ?? [];
    return (
      f.family_name.toLowerCase().includes(s) ||
      fm.some((m) => m.full_name?.toLowerCase().includes(s) || m.email?.toLowerCase().includes(s))
    );
  });

  const filteredUnassigned = unassigned.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return m.full_name?.toLowerCase().includes(s) || m.email?.toLowerCase().includes(s) || m.phone?.includes(search);
  });

  async function handleSendReset(email: string) {
    setResetSending(email);
    setResetError(null);
    setResetSuccess(null);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || 'Failed to send reset email');
      } else {
        setResetSuccess(email);
        setTimeout(() => setResetSuccess(null), 4000);
      }
    } catch {
      setResetError('Network error. Please try again.');
    } finally {
      setResetSending(null);
    }
  }

  function getMemberFamily(member: Member) {
    if (!member.family_id) return null;
    return families.find((f) => f.id === member.family_id) ?? null;
  }

  function getFamilyProfileMembers(familyId: string) {
    return membersByFamily[familyId] ?? [];
  }

  function getFamilyDependents(familyId: string) {
    return dependentsByFamily[familyId] ?? [];
  }

  const uniqueRoles = Array.from(new Set(members.map((m) => m.role)));

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: '#FDF8F0' }}>
        <button
          onClick={() => setTab('members')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={tab === 'members'
            ? { background: '#fff', color: '#2C1810', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
            : { color: '#7A6B5F' }
          }
        >
          <Users size={16} />
          Members ({members.length})
        </button>
        <button
          onClick={() => setTab('families')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={tab === 'families'
            ? { background: '#fff', color: '#2C1810', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
            : { color: '#7A6B5F' }
          }
        >
          <Home size={16} />
          Families ({families.length})
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or location..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E8860C]/40 transition-colors"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89888' }}>
              <X size={14} />
            </button>
          )}
        </div>
        {tab === 'members' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{
              borderColor: roleFilter !== 'all' ? '#6B1D2A' : 'rgba(107,29,42,0.15)',
              color: roleFilter !== 'all' ? '#6B1D2A' : '#7A6B5F',
              background: roleFilter !== 'all' ? 'rgba(107,29,42,0.05)' : 'transparent',
            }}
          >
            <Filter size={14} />
            Filter
            {roleFilter !== 'all' && <span className="w-2 h-2 rounded-full" style={{ background: '#6B1D2A' }} />}
          </button>
        )}
      </div>

      {/* Role filter pills */}
      {tab === 'members' && showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl" style={{ background: '#FDF8F0' }}>
          <span className="text-xs font-medium self-center mr-1" style={{ color: '#7A6B5F' }}>Role:</span>
          <button
            onClick={() => setRoleFilter('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={roleFilter === 'all'
              ? { background: '#6B1D2A', color: '#fff' }
              : { background: '#fff', color: '#7A6B5F', border: '1px solid rgba(107,29,42,0.15)' }
            }
          >
            All ({members.length})
          </button>
          {uniqueRoles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
              style={roleFilter === role
                ? { background: '#6B1D2A', color: '#fff' }
                : { background: '#fff', color: '#7A6B5F', border: '1px solid rgba(107,29,42,0.15)' }
              }
            >
              {role.replace('_', ' ')} ({members.filter((m) => m.role === role).length})
            </button>
          ))}
        </div>
      )}

      {/* Reset feedback toast */}
      {(resetSuccess || resetError) && (
        <div
          className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
          style={resetSuccess
            ? { background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
            : { background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }
          }
        >
          {resetSuccess ? <><CheckCircle2 size={16} /> Password reset email sent to {resetSuccess}</> : <><X size={16} /> {resetError}</>}
          <button onClick={() => { setResetSuccess(null); setResetError(null); }} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Search results count */}
      {search && (
        <p className="text-xs mb-3" style={{ color: '#A89888' }}>
          {tab === 'members'
            ? `Showing ${filteredMembers.length} of ${members.length} members`
            : `Showing ${filteredFamilies.length} of ${families.length} families`}
        </p>
      )}

      {/* ═══════════ MEMBERS TAB ═══════════ */}
      {tab === 'members' && (
        <>
          {filteredMembers.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Users size={40} className="mx-auto mb-3" />
              <p>{search || roleFilter !== 'all' ? 'No members match your search.' : 'No members found.'}</p>
              {(search || roleFilter !== 'all') && (
                <button onClick={() => { setSearch(''); setRoleFilter('all'); }} className="mt-2 text-sm font-medium" style={{ color: '#E8860C' }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#FDF8F0' }}>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden sm:table-cell" style={{ color: '#7A6B5F' }}>Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: '#7A6B5F' }}>Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden lg:table-cell" style={{ color: '#7A6B5F' }}>Location</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden lg:table-cell" style={{ color: '#7A6B5F' }}>Joined</th>
                      <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FDF8F0]/50">
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: '#2C1810' }}>{m.full_name}</p>
                          <p className="text-xs sm:hidden" style={{ color: '#7A6B5F' }}>{m.email ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: '#7A6B5F' }}>{m.email ?? '—'}</td>
                        <td className="px-4 py-3 hidden md:table-cell" style={{ color: '#7A6B5F' }}>{m.phone ?? '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell" style={{ color: '#7A6B5F' }}>
                          {[m.city, m.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColors[m.role] ?? roleColors.member}`}>
                            {m.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs hidden lg:table-cell" style={{ color: '#A89888' }}>{formatDate(m.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block" ref={openMenuId === m.id ? menuRef : undefined}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                              className="p-1.5 rounded-lg hover:bg-[#FDF8F0] transition-colors"
                              style={{ color: '#7A6B5F' }}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openMenuId === m.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border z-20 py-1"
                                style={{ borderColor: 'rgba(107,29,42,0.1)' }}>
                                <button
                                  onClick={() => { setViewMember(m); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-[#FDF8F0] transition-colors"
                                  style={{ color: '#2C1810' }}
                                >
                                  <Eye size={14} style={{ color: '#7A6B5F' }} />
                                  View Details
                                </button>
                                {m.email && (
                                  <button
                                    onClick={() => { setConfirmResetEmail(m.email!); setConfirmResetName(m.full_name); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-[#FDF8F0] transition-colors"
                                    style={{ color: '#2C1810' }}
                                  >
                                    <KeyRound size={14} style={{ color: '#7A6B5F' }} />
                                    Reset Password
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════ FAMILIES TAB ═══════════ */}
      {tab === 'families' && (
        <>
          {filteredFamilies.length === 0 && filteredUnassigned.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Home size={40} className="mx-auto mb-3" />
              <p>{search ? 'No families match your search.' : 'No families registered yet.'}</p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-sm font-medium" style={{ color: '#E8860C' }}>Clear search</button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFamilies.map((family) => {
                const profileMembers = membersByFamily[family.id] ?? [];
                const deps = dependentsByFamily[family.id] ?? [];
                const totalCount = profileMembers.length + deps.length;

                return (
                  <button
                    key={family.id}
                    onClick={() => setViewFamily(family)}
                    className="card overflow-hidden w-full text-left hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FDF8F0' }}>
                      <div className="flex items-center gap-2">
                        <Home size={16} style={{ color: '#6B1D2A' }} />
                        <span className="text-sm font-medium" style={{ color: '#2C1810' }}>
                          {family.family_name}
                        </span>
                        {family.invite_code && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full hidden sm:inline-block" style={{ background: 'rgba(107,29,42,0.06)', color: '#7A6B5F' }}>
                            {family.invite_code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: '#A89888' }}>
                          {totalCount} member{totalCount !== 1 ? 's' : ''}
                        </span>
                        <Eye size={14} style={{ color: '#A89888' }} />
                      </div>
                    </div>

                    {/* Preview of members */}
                    <div className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        {profileMembers.map((m) => (
                          <span key={m.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: '#FDF8F0', color: '#2C1810' }}>
                            {m.full_name}
                            {m.family_role && (
                              <span className="text-[10px]" style={{ color: '#E8860C' }}>
                                ({familyRoleLabels[m.family_role] ?? m.family_role})
                              </span>
                            )}
                          </span>
                        ))}
                        {deps.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: '#FFF3E0', color: '#E8860C' }}>
                            <Baby size={10} />
                            +{deps.length} dependent{deps.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Unassigned members */}
              {filteredUnassigned.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FDF8F0' }}>
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: '#7A6B5F' }} />
                      <span className="text-sm font-medium" style={{ color: '#7A6B5F' }}>Not Assigned to a Family</span>
                    </div>
                    <span className="text-xs" style={{ color: '#A89888' }}>
                      {filteredUnassigned.length} member{filteredUnassigned.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                    {filteredUnassigned.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setViewMember(m)}
                        className="px-4 py-3 flex items-center gap-4 hover:bg-[#FDF8F0]/50 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: '#2C1810' }}>{m.full_name}</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColors[m.role] ?? roleColors.member}`}>
                              {m.role.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: '#7A6B5F' }}>
                            {[m.email, m.phone].filter(Boolean).join(' · ') || 'No contact info'}
                          </p>
                        </div>
                        <Eye size={14} style={{ color: '#A89888' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════ VIEW MEMBER MODAL ═══════════ */}
      {viewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setViewMember(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
              <h3 className="text-[17px] font-semibold" style={{ color: '#2C1810' }}>Member Details</h3>
              <button onClick={() => setViewMember(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} style={{ color: '#7A6B5F' }} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #E8860C, #6B1D2A)' }}>
                  {viewMember.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-semibold truncate" style={{ color: '#2C1810' }}>{viewMember.full_name}</h4>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColors[viewMember.role] ?? roleColors.member}`}>
                      {viewMember.role.replace('_', ' ')}
                    </span>
                    {viewMember.family_role && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,134,12,0.1)', color: '#E8860C' }}>
                        {familyRoleLabels[viewMember.family_role] ?? viewMember.family_role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#A89888' }}>Contact Information</p>

                {viewMember.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDF8F0' }}>
                      <Mail size={14} style={{ color: '#E8860C' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px]" style={{ color: '#A89888' }}>Email</p>
                      <p className="text-sm truncate" style={{ color: '#2C1810' }}>{viewMember.email}</p>
                    </div>
                  </div>
                )}

                {viewMember.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDF8F0' }}>
                      <Phone size={14} style={{ color: '#E8860C' }} />
                    </div>
                    <div>
                      <p className="text-[11px]" style={{ color: '#A89888' }}>Phone {viewMember.whatsapp_opt_in && '· WhatsApp ✓'}</p>
                      <p className="text-sm" style={{ color: '#2C1810' }}>{viewMember.phone}</p>
                    </div>
                  </div>
                )}

                {(viewMember.address1 || viewMember.city || viewMember.state) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDF8F0' }}>
                      <MapPin size={14} style={{ color: '#E8860C' }} />
                    </div>
                    <div>
                      <p className="text-[11px]" style={{ color: '#A89888' }}>Address</p>
                      <p className="text-sm" style={{ color: '#2C1810' }}>
                        {[
                          viewMember.address1,
                          viewMember.address2 ? `Apt ${viewMember.address2}` : null,
                          [viewMember.city, viewMember.state].filter(Boolean).join(', '),
                          viewMember.zip,
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FDF8F0' }}>
                    <Calendar size={14} style={{ color: '#E8860C' }} />
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: '#A89888' }}>Member Since</p>
                    <p className="text-sm" style={{ color: '#2C1810' }}>{formatDate(viewMember.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Family section */}
              {viewMember.family_id && (() => {
                const fam = getMemberFamily(viewMember);
                const profiles = getFamilyProfileMembers(viewMember.family_id).filter(p => p.id !== viewMember.id);
                const deps = getFamilyDependents(viewMember.family_id);
                return (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: '#A89888' }}>
                      Family — {fam?.family_name ?? 'Unknown'}
                    </p>

                    <div className="space-y-2">
                      {profiles.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#FDF8F0' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #E8860C, #6B1D2A)' }}>
                            {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>{p.full_name}</p>
                            <p className="text-[11px]" style={{ color: '#7A6B5F' }}>
                              {[p.family_role ? familyRoleLabels[p.family_role] ?? p.family_role : null, p.email].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>
                      ))}

                      {deps.map((d) => {
                        const Icon = relationshipIcons[d.relationship] ?? User;
                        const age = calculateAge(d.date_of_birth);
                        const sse = d.relationship === 'child' ? getSSEGroup(d.date_of_birth) : null;
                        return (
                          <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#FDF8F0' }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FFF3E0' }}>
                              <Icon size={14} style={{ color: '#E8860C' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>
                                {d.first_name} {d.last_name || ''}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] capitalize" style={{ color: '#7A6B5F' }}>{d.relationship}</span>
                                {age !== null && <span className="text-[11px]" style={{ color: '#A89888' }}>· {age} yrs</span>}
                                {d.gender && <span className="text-[11px] capitalize" style={{ color: '#A89888' }}>· {d.gender}</span>}
                                {sse && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#FFF3E0', color: '#E8860C' }}>
                                    SSE {sse}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {profiles.length === 0 && deps.length === 0 && (
                        <p className="text-xs py-2" style={{ color: '#A89888' }}>No other family members.</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {!viewMember.family_id && (
                <div className="px-3 py-3 rounded-xl text-center" style={{ background: '#FDF8F0' }}>
                  <p className="text-xs" style={{ color: '#A89888' }}>Not assigned to a family</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                {viewMember.email && (
                  <button
                    onClick={() => { setConfirmResetEmail(viewMember.email!); setConfirmResetName(viewMember.full_name); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
                    style={{ background: 'rgba(107,29,42,0.06)', color: '#6B1D2A' }}
                  >
                    <KeyRound size={14} />
                    Reset Password
                  </button>
                )}
                <button
                  onClick={() => setViewMember(null)}
                  className="px-4 py-2.5 rounded-xl text-[13px] border"
                  style={{ color: '#7A6B5F', borderColor: 'rgba(107,29,42,0.15)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ VIEW FAMILY MODAL ═══════════ */}
      {viewFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setViewFamily(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
              <div>
                <h3 className="text-[17px] font-semibold" style={{ color: '#2C1810' }}>{viewFamily.family_name}</h3>
                {viewFamily.invite_code && (
                  <p className="text-[11px] mt-0.5" style={{ color: '#A89888' }}>Invite Code: {viewFamily.invite_code}</p>
                )}
              </div>
              <button onClick={() => setViewFamily(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} style={{ color: '#7A6B5F' }} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Profile members (with accounts) */}
              {(() => {
                const profiles = getFamilyProfileMembers(viewFamily.id);
                const deps = getFamilyDependents(viewFamily.id);

                return (
                  <>
                    {profiles.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: '#A89888' }}>
                          Members with Accounts ({profiles.length})
                        </p>
                        <div className="space-y-2">
                          {profiles.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => { setViewMember(p); setViewFamily(null); }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border hover:bg-[#FDF8F0]/50 cursor-pointer transition-colors"
                              style={{ borderColor: 'rgba(107,29,42,0.08)' }}
                            >
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #E8860C, #6B1D2A)' }}>
                                {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>{p.full_name}</p>
                                  {p.family_role && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(232,134,12,0.1)', color: '#E8860C' }}>
                                      {familyRoleLabels[p.family_role] ?? p.family_role}
                                    </span>
                                  )}
                                  <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize flex-shrink-0 ${roleColors[p.role] ?? roleColors.member}`}>
                                    {p.role.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: '#7A6B5F' }}>
                                  {[p.email, p.phone].filter(Boolean).join(' · ') || 'No contact info'}
                                </p>
                                {p.city && (
                                  <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: '#A89888' }}>
                                    <MapPin size={10} /> {[p.city, p.state].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                              <Eye size={14} className="flex-shrink-0" style={{ color: '#A89888' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {deps.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: '#A89888' }}>
                          Dependents ({deps.length})
                        </p>
                        <div className="space-y-2">
                          {deps.map((d) => {
                            const Icon = relationshipIcons[d.relationship] ?? User;
                            const age = calculateAge(d.date_of_birth);
                            const sse = d.relationship === 'child' ? getSSEGroup(d.date_of_birth) : null;
                            return (
                              <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                                style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FFF3E0' }}>
                                  <Icon size={16} style={{ color: '#E8860C' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                                      {d.first_name} {d.last_name || ''}
                                    </p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ background: '#FDF8F0', color: '#7A6B5F' }}>
                                      {d.relationship}
                                    </span>
                                    {sse && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#FFF3E0', color: '#E8860C' }}>
                                        SSE {sse}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                    {age !== null && <span className="text-[11px]" style={{ color: '#7A6B5F' }}>{age} years old</span>}
                                    {d.gender && <span className="text-[11px] capitalize" style={{ color: '#A89888' }}>· {d.gender}</span>}
                                    {d.phone && <span className="text-[11px]" style={{ color: '#A89888' }}>· {d.phone}</span>}
                                  </div>
                                  {d.notes && <p className="text-[11px] mt-1" style={{ color: '#A89888' }}>{d.notes}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {profiles.length === 0 && deps.length === 0 && (
                      <div className="text-center py-8">
                        <Users size={32} className="mx-auto mb-2" style={{ color: '#A89888' }} />
                        <p className="text-sm" style={{ color: '#7A6B5F' }}>No members in this family yet.</p>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Created date */}
              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                <p className="text-[11px]" style={{ color: '#A89888' }}>Created {formatDate(viewFamily.created_at)}</p>
                <button
                  onClick={() => setViewFamily(null)}
                  className="px-4 py-2 rounded-xl text-[13px] border"
                  style={{ color: '#7A6B5F', borderColor: 'rgba(107,29,42,0.15)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════ RESET PASSWORD CONFIRMATION MODAL ═══════════ */}
      {confirmResetEmail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirmResetEmail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Icon header */}
            <div className="pt-6 pb-2 flex justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(107,29,42,0.08)' }}>
                <KeyRound size={24} style={{ color: '#6B1D2A' }} />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2 text-center">
              <h3 className="text-[17px] font-semibold mb-2" style={{ color: '#2C1810' }}>Reset Password?</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7A6B5F' }}>
                This will send a password reset email to{' '}
                <span className="font-medium" style={{ color: '#2C1810' }}>{confirmResetName}</span>{' '}
                at <span className="font-medium" style={{ color: '#2C1810' }}>{confirmResetEmail}</span>.
              </p>
              <p className="text-xs mt-2" style={{ color: '#A89888' }}>
                They will need to click the link in the email to set a new password.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmResetEmail(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                style={{ color: '#7A6B5F', borderColor: 'rgba(107,29,42,0.15)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSendReset(confirmResetEmail);
                  setConfirmResetEmail(null);
                }}
                disabled={resetSending === confirmResetEmail}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white whitespace-nowrap transition-colors disabled:opacity-50"
                style={{ background: '#6B1D2A' }}
              >
                {resetSending === confirmResetEmail ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                Send Reset Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
