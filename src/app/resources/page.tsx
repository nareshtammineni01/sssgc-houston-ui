'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, BookOpen, Music, FileText, Filter } from 'lucide-react';
import { cn, truncate } from '@/lib/utils';
import type { Resource } from '@/types/database';

const categories = [
  { key: 'all', label: 'All', icon: BookOpen },
  { key: 'bhajan', label: 'Bhajans', icon: Music },
  { key: 'veda', label: 'Vedam', icon: BookOpen },
  { key: 'study', label: 'Study', icon: FileText },
  { key: 'newsletter', label: 'Newsletter', icon: FileText },
  { key: 'document', label: 'Documents', icon: FileText },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchResources();
  }, [activeCategory]);

  async function fetchResources() {
    setLoading(true);
    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory);
    }

    const { data } = await query;
    setResources(data ?? []);
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchResources();
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc('search_resources', {
      search_query: searchQuery,
    });
    // search_resources returns a different shape, map it
    if (data) {
      const { data: fullResources } = await supabase
        .from('resources')
        .select('*')
        .in('id', data.map((r: { id: string }) => r.id));
      setResources(fullResources ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-h1">Resources</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bhajans, documents..."
              className="input pl-10"
            />
          </div>
        </form>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === cat.key
                ? 'bg-saffron-500 text-white'
                : 'bg-white text-gray-600 hover:bg-cream-200 border border-gray-200'
            )}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resource list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div key={resource.id} className="card p-5">
              <span className="badge-saffron text-[10px] mb-2">{resource.category}</span>
              <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
              {resource.description && (
                <p className="text-sm text-gray-500 mb-3">
                  {truncate(resource.description, 100)}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {resource.language && <span>{resource.language}</span>}
                <span>{resource.view_count} views</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No resources found. Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
