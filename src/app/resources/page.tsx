'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  BookOpen,
  Music,
  FileText,
  Heart,
  Eye,
  ExternalLink,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types/database';

const categories = [
  { key: 'all', label: 'All', icon: BookOpen },
  { key: 'bhajan', label: 'Bhajans', icon: Music },
  { key: 'prayer', label: 'Prayers', icon: BookOpen },
  { key: 'study_circle', label: 'Study Circle', icon: FileText },
  { key: 'document', label: 'Documents', icon: FileText },
  { key: 'bhajan_resource', label: 'Bhajan Resources', icon: Headphones },
];

const categoryColors: Record<string, string> = {
  bhajan: 'bg-saffron-50 text-saffron-600',
  prayer: 'bg-maroon-50 text-maroon-600',
  study_circle: 'bg-blue-50 text-blue-600',
  document: 'bg-gray-100 text-gray-600',
  bhajan_resource: 'bg-gold-50 text-gold-600',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  // Get current user + favorites on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: favs } = await supabase
          .from('favorites')
          .select('resource_id')
          .eq('user_id', user.id);
        if (favs) {
          setFavorites(new Set(favs.map((f: { resource_id: string }) => f.resource_id)));
        }
      }
    })();
  }, []);

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
    setResources(data ?? []);
    setLoading(false);
  }

  async function toggleFavorite(resourceId: string) {
    if (!userId) return;

    if (favorites.has(resourceId)) {
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);
    } else {
      setFavorites((prev) => new Set(prev).add(resourceId));
      await supabase
        .from('favorites')
        .insert({ user_id: userId, resource_id: resourceId });
    }
  }

  async function trackView(resourceId: string) {
    await supabase.rpc('increment_view_count', { resource_id: resourceId });
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
              placeholder="Search bhajans, prayers, documents..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#2C1810' }}
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
                : 'bg-white border hover:bg-cream-50'
            )}
            style={
              activeCategory !== cat.key
                ? { borderColor: 'rgba(107,29,42,0.12)', color: '#7A6B5F' }
                : {}
            }
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
            <div
              key={resource.id}
              className="card p-5 group hover:border-[#E8860C] transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize',
                    categoryColors[resource.category] ?? 'bg-gray-100 text-gray-600'
                  )}
                >
                  {resource.category.replace('_', ' ')}
                </span>
                {userId && (
                  <button
                    onClick={() => toggleFavorite(resource.id)}
                    className="p-1 rounded-lg hover:bg-cream-100 transition-colors"
                    title={favorites.has(resource.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      size={16}
                      className={
                        favorites.has(resource.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                )}
              </div>

              <h3
                className="text-[14px] font-medium mb-1"
                style={{ color: '#2C1810' }}
              >
                {resource.title}
              </h3>

              {resource.deity && (
                <p className="text-[11px] mb-1" style={{ color: '#E8860C' }}>
                  {resource.deity}
                </p>
              )}

              {resource.content && (
                <p
                  className="text-[12px] line-clamp-2 mb-3"
                  style={{ color: '#7A6B5F' }}
                >
                  {resource.content.slice(0, 120)}
                  {resource.content.length > 120 ? '...' : ''}
                </p>
              )}

              <div className="flex items-center gap-3 text-[11px]" style={{ color: '#A89888' }}>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {resource.view_count}
                </span>
                {resource.file_url && (
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackView(resource.id)}
                    className="flex items-center gap-1 hover:text-saffron-500 transition-colors"
                  >
                    <FileText size={12} />
                    PDF
                  </a>
                )}
                {resource.audio_url && (
                  <a
                    href={resource.audio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackView(resource.id)}
                    className="flex items-center gap-1 hover:text-saffron-500 transition-colors"
                  >
                    <Headphones size={12} />
                    Audio
                  </a>
                )}
              </div>

              {/* Keywords */}
              {resource.keywords && resource.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {resource.keywords.slice(0, 4).map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-cream-100"
                      style={{ color: '#7A6B5F' }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="mx-auto mb-4" style={{ color: '#A89888' }} />
          <p style={{ color: '#7A6B5F' }}>No resources found. Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
