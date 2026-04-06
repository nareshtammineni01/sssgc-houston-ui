'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Music, BookOpen, FileText, Headphones, X, Loader2, Sparkles } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  deity: string | null;
  audio_url: string | null;
  content: string | null;
  similarity: number | null;
}

interface SearchResponse {
  results: SearchResult[];
  mode: 'standard' | 'ai';
  usedVector: boolean;
  aiSummary: string | null;
}

const categoryConfig: Record<string, { label: string; icon: typeof Music; iconBg: string; iconColor: string }> = {
  bhajan: { label: 'Bhajan', icon: Music, iconBg: '#FFF8EB', iconColor: '#E8860C' },
  prayer: { label: 'Prayer', icon: BookOpen, iconBg: '#FDF2F4', iconColor: '#6B1D2A' },
  study_circle: { label: 'Study Circle', icon: FileText, iconBg: '#EFF6FF', iconColor: '#2563EB' },
  document: { label: 'Document', icon: FileText, iconBg: '#F3F4F6', iconColor: '#6B7280' },
  bhajan_resource: { label: 'Bhajan Resource', icon: Headphones, iconBg: '#FFF8EB', iconColor: '#C46F0A' },
};

function getResultHref(result: SearchResult): string {
  if (result.category === 'bhajan') return `/bhajans/${result.slug}`;
  if (result.category === 'prayer') return `/prayers/${result.slug}`;
  return `/resources/${result.id}`;
}

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const results = response?.results ?? [];
  const aiSummary = response?.aiSummary ?? null;

  const search = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();

    if (q.length < 2) {
      setResponse(null);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const data: SearchResponse = await res.json();
      setResponse(data);
      setHasSearched(true);
    } catch {
      // Aborted or network error
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  const categoryOrder = ['bhajan', 'prayer', 'study_circle', 'document', 'bhajan_resource'];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="card overflow-hidden" style={{ borderColor: query ? '#E8860C' : undefined }}>
          <div className="flex items-center gap-3 px-4 py-3">
            {loading ? (
              <Loader2 size={18} className="animate-spin flex-shrink-0" style={{ color: '#E8860C' }} />
            ) : (
              <Search size={18} className="flex-shrink-0" style={{ color: '#A89888' }} />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bhajans, prayers, and more..."
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[#C4B8AD]"
              style={{ color: '#2C1810' }}
              autoFocus={autoFocus}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResponse(null); setHasSearched(false); inputRef.current?.focus(); }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-[#FDF8F0] transition-colors"
              >
                <X size={16} style={{ color: '#A89888' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #FFFCF7 0%, #FDF2F4 100%)', border: '1px solid rgba(232,134,12,0.2)' }}
        >
          <Sparkles size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#E8860C' }} />
          <div>
            <p className="text-[13px] leading-relaxed" style={{ color: '#2C1810' }}>
              {aiSummary}
            </p>
            <p className="text-[10px] mt-1.5" style={{ color: '#A89888' }}>
              AI-powered answer · Results below
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <p className="text-[12px] mb-3" style={{ color: '#A89888' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            {response?.usedVector && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px]" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                semantic
              </span>
            )}
          </p>

          {results.length > 0 ? (
            <div className="space-y-5">
              {categoryOrder.map((cat) => {
                const items = grouped[cat];
                if (!items || items.length === 0) return null;
                const config = categoryConfig[cat];

                return (
                  <div key={cat}>
                    <p className="text-[12px] font-medium mb-2 uppercase tracking-wider" style={{ color: '#7A6B5F' }}>
                      {config?.label ?? cat} ({items.length})
                    </p>
                    <div className="space-y-1.5">
                      {items.map((result) => {
                        const Icon = config?.icon ?? FileText;
                        return (
                          <Link
                            key={result.id}
                            href={getResultHref(result)}
                            className="card block px-4 py-3 group hover:border-[#E8860C] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: config?.iconBg ?? '#F3F4F6' }}
                              >
                                <Icon size={16} style={{ color: config?.iconColor ?? '#6B7280' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-[14px] font-medium group-hover:text-[#E8860C] truncate transition-colors"
                                  style={{ color: '#2C1810' }}
                                >
                                  {result.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {result.deity && (
                                    <span className="text-[11px]" style={{ color: '#A89888' }}>{result.deity}</span>
                                  )}
                                  {result.content && (
                                    <span className="text-[11px] truncate" style={{ color: '#C4B8AD' }}>
                                      {result.content}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center" style={{ color: '#A89888' }}>
              <Search size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-[14px] mb-3">No results found for &ldquo;{query}&rdquo;</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/bhajans" className="text-[13px] font-medium hover:underline" style={{ color: '#E8860C' }}>
                  Browse Bhajans
                </Link>
                <Link href="/prayers" className="text-[13px] font-medium hover:underline" style={{ color: '#6B1D2A' }}>
                  Browse Prayers
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && !loading && (
        <div className="text-center py-8">
          <p className="text-[13px] mb-4" style={{ color: '#A89888' }}>
            Start typing to search across all bhajans, prayers, and resources
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/bhajans" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors" style={{ background: '#FFF8EB', color: '#E8860C' }}>
              <Music size={14} /> Bhajans
            </Link>
            <Link href="/prayers" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors" style={{ background: '#FDF2F4', color: '#6B1D2A' }}>
              <BookOpen size={14} /> Prayers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
