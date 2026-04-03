'use client';

import { useState } from 'react';
import { Users, Home } from 'lucide-react';
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

      {/* Members tab */}
      {tab === 'members' && (
        <>
          {members.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Users size={40} className="mx-auto mb-3" />
              <p>No members found.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#FDF8F0' }}>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Email</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Location</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#7A6B5F' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FDF8F0]/50">
                        <td className="px-4 py-3 font-medium" style={{ color: '#2C1810' }}>{m.full_name}</td>
                        <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>{m.email ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>{m.phone ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                          {[m.city, m.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColors[m.role] ?? roleColors.member}`}>
                            {m.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#A89888' }}>{formatDate(m.created_at)}</td>
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
          {families.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Home size={40} className="mx-auto mb-3" />
              <p>No families registered yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {families.map((family) => {
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
              {unassigned.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FDF8F0' }}>
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: '#7A6B5F' }} />
                      <span className="text-sm font-medium" style={{ color: '#7A6B5F' }}>
                        Not Assigned to a Family
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#A89888' }}>
                      {unassigned.length} member{unassigned.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'rgba(107,29,42,0.08)' }}>
                    {unassigned.map((m) => (
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
