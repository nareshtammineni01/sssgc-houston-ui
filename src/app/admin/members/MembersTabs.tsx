'use client';

import { useState } from 'react';
import { Users, Home, Search, Filter, KeyRound, CheckCircle2, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  role: string;
  family_id: string | null;
  family_role: string | null;
  created_at: string;
};

type Family = {
  id: string;
  family_name: string;
  created_at: string;
};

interface MembersTabsProps {
  members: Member[];
  families: Family[];
  membersByFamily: Record<string, Member[]>;
  unassigned: Member[];
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

export default function MembersTabs({ members, families, membersByFamily, unassigned }: MembersTabsProps) {
  const [tab, setTab] = useState<'members' | 'families'>('members');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [resetSending, setResetSending] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Filter members based on search and role
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

  // Filter families based on search
  const filteredFamilies = families.filter((f) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const familyMembers = membersByFamily[f.id] ?? [];
    return (
      f.family_name.toLowerCase().includes(searchLower) ||
      familyMembers.some(
        (m) =>
          m.full_name?.toLowerCase().includes(searchLower) ||
          m.email?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Filter unassigned based on search
  const filteredUnassigned = unassigned.filter((m) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      m.full_name?.toLowerCase().includes(searchLower) ||
      m.email?.toLowerCase().includes(searchLower) ||
      m.phone?.includes(search)
    );
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
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#A89888' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {tab === 'members' && (
          <div className="flex gap-2">
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
              {roleFilter !== 'all' && (
                <span className="w-2 h-2 rounded-full" style={{ background: '#6B1D2A' }} />
              )}
            </button>
          </div>
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
          {resetSuccess ? (
            <>
              <CheckCircle2 size={16} />
              Password reset email sent to {resetSuccess}
            </>
          ) : (
            <>
              <X size={16} />
              {resetError}
            </>
          )}
          <button
            onClick={() => { setResetSuccess(null); setResetError(null); }}
            className="ml-auto"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search results count */}
      {search && (
        <p className="text-xs mb-3" style={{ color: '#A89888' }}>
          {tab === 'members'
            ? `Showing ${filteredMembers.length} of ${members.length} members`
            : `Showing ${filteredFamilies.length} of ${families.length} families`
          }
        </p>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <>
          {filteredMembers.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Users size={40} className="mx-auto mb-3" />
              <p>{search || roleFilter !== 'all' ? 'No members match your search.' : 'No members found.'}</p>
              {(search || roleFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setRoleFilter('all'); }}
                  className="mt-2 text-sm font-medium" style={{ color: '#E8860C' }}
                >
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
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden sm:table-cell" style={{ color: '#7A6B5F' }}>Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: '#7A6B5F' }}>Location</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium hidden lg:table-cell" style={{ color: '#7A6B5F' }}>Joined</th>
                      <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FDF8F0]/50">
                        <td className="px-4 py-3 font-medium" style={{ color: '#2C1810' }}>{m.full_name}</td>
                        <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                          <span className="text-xs sm:text-sm">{m.email ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell" style={{ color: '#7A6B5F' }}>{m.phone ?? '—'}</td>
                        <td className="px-4 py-3 hidden md:table-cell" style={{ color: '#7A6B5F' }}>
                          {[m.city, m.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColors[m.role] ?? roleColors.member}`}>
                            {m.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs hidden lg:table-cell" style={{ color: '#A89888' }}>{formatDate(m.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          {m.email && (
                            <button
                              onClick={() => handleSendReset(m.email!)}
                              disabled={resetSending === m.email}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                              style={{ background: 'rgba(107,29,42,0.06)', color: '#6B1D2A' }}
                              title={`Send password reset to ${m.email}`}
                            >
                              {resetSending === m.email ? (
                                <span className="w-3 h-3 border-2 border-[#6B1D2A]/30 border-t-[#6B1D2A] rounded-full animate-spin" />
                              ) : (
                                <KeyRound size={12} />
                              )}
                              <span className="hidden xl:inline">Reset Password</span>
                            </button>
                          )}
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

      {/* Families tab */}
      {tab === 'families' && (
        <>
          {filteredFamilies.length === 0 && filteredUnassigned.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Home size={40} className="mx-auto mb-3" />
              <p>{search ? 'No families match your search.' : 'No families registered yet.'}</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-sm font-medium" style={{ color: '#E8860C' }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFamilies.map((family) => {
                const familyMembers = membersByFamily[family.id] ?? [];
                return (
                  <div key={family.id} className="card overflow-hidden">
                    {/* Family header */}
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FDF8F0' }}>
                      <div className="flex items-center gap-2">
                        <Home size={16} style={{ color: '#6B1D2A' }} />
                        <span className="text-sm font-medium" style={{ color: '#2C1810' }}>
                          {family.family_name}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: '#A89888' }}>
                        {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Family members list */}
                    {familyMembers.length > 0 ? (
                      <div className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                        {familyMembers.map((m) => (
                          <div key={m.id} className="px-4 py-3 flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium" style={{ color: '#2C1810' }}>{m.full_name}</span>
                                {m.family_role && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(232,134,12,0.1)', color: '#E8860C' }}>
                                    {familyRoleLabels[m.family_role] ?? m.family_role}
                                  </span>
                                )}
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColors[m.role] ?? roleColors.member}`}>
                                  {m.role.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: '#7A6B5F' }}>
                                {[m.email, m.phone].filter(Boolean).join(' · ') || 'No contact info'}
                              </p>
                            </div>
                            <span className="text-xs flex-shrink-0" style={{ color: '#A89888' }}>
                              {[m.city, m.state].filter(Boolean).join(', ') || ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-xs" style={{ color: '#A89888' }}>
                        No members assigned to this family yet.
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned members */}
              {filteredUnassigned.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FDF8F0' }}>
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: '#7A6B5F' }} />
                      <span className="text-sm font-medium" style={{ color: '#7A6B5F' }}>
                        Not Assigned to a Family
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#A89888' }}>
                      {filteredUnassigned.length} member{filteredUnassigned.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                    {filteredUnassigned.map((m) => (
                      <div key={m.id} className="px-4 py-3 flex items-center gap-4">
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
