import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Pencil, Music, BookOpen, FileText } from 'lucide-react';

export const metadata: Metadata = { title: 'Manage Resources' };

const categoryColors: Record<string, string> = {
  bhajan: 'bg-saffron-50 text-saffron-600',
  prayer: 'bg-maroon-50 text-maroon-600',
  study_circle: 'bg-blue-50 text-blue-600',
  document: 'bg-gray-100 text-gray-600',
  bhajan_resource: 'bg-gold-50 text-gold-600',
};

export default async function AdminResourcesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/resources');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: resources, count } = await supabase
    .from('resources')
    .select('id, title, category, deity, view_count, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100);

  // Category counts
  const cats = (resources ?? []).reduce(
    (acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Resources</h1>
          <p className="text-sm mt-1" style={{ color: '#7A6B5F' }}>
            {count ?? 0} resources in library
          </p>
        </div>
        <Link
          href="/admin/resources/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: '#6B1D2A' }}
        >
          <Plus size={18} />
          Add Resource
        </Link>
      </div>

      {/* Category stats */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(cats).map(([cat, n]) => (
          <div key={cat} className="card px-4 py-2 flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${categoryColors[cat] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {cat.replace('_', ' ')}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#2C1810' }}>{n}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {!resources || resources.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89888' }}>
            <p className="text-lg mb-2">No resources yet</p>
            <p className="text-sm">Click &ldquo;Add Resource&rdquo; to add your first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FDF8F0', color: '#7A6B5F' }}>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Deity</th>
                <th className="text-left px-4 py-3 font-medium">Views</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-cream-50 transition-colors"
                  style={{ borderColor: 'rgba(107,29,42,0.06)' }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: '#2C1810' }}>
                    {r.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[r.category] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                    {r.deity ?? '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#7A6B5F' }}>
                    {r.view_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/resources/${r.id}`}
                      className="p-1.5 rounded-lg hover:bg-cream-100 inline-block transition-colors"
                      style={{ color: '#7A6B5F' }}
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
