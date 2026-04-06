'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Sparkles, Database, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface SettingsFormProps {
  currentMode: string;
  totalResources: number;
}

export default function SettingsForm({ currentMode, totalResources }: SettingsFormProps) {
  const supabase = createClient();

  const [searchMode, setSearchMode] = useState(currentMode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Embedding stats
  const [embeddingStats, setEmbeddingStats] = useState<{ embedded: number; missing: number } | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildProgress, setRebuildProgress] = useState('');

  // Fetch embedding stats on mount
  useEffect(() => {
    fetchEmbeddingStats();
  }, []);

  async function fetchEmbeddingStats() {
    try {
      const res = await fetch('/api/embeddings/stats');
      const data = await res.json();
      setEmbeddingStats(data);
    } catch {
      // Stats not available yet (migration not run)
      setEmbeddingStats({ embedded: 0, missing: totalResources });
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();

    const { error: err } = await supabase
      .from('site_settings')
      .upsert({
        key: 'search_mode',
        value: JSON.stringify(searchMode),
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      });

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleRebuildEmbeddings() {
    setRebuilding(true);
    setRebuildProgress('Starting embedding generation...');
    setError('');

    try {
      const res = await fetch('/api/embeddings/rebuild', { method: 'POST' });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          // Parse SSE-style messages
          const lines = text.split('\n').filter(Boolean);
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const msg = JSON.parse(line.slice(6));
                if (msg.progress) setRebuildProgress(msg.progress);
                if (msg.error) setError(msg.error);
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }

      // Refresh stats
      await fetchEmbeddingStats();
      setRebuildProgress('');
    } catch (err: unknown) {
      setError('Failed to rebuild embeddings. Make sure GEMINI_API_KEY is set.');
    } finally {
      setRebuilding(false);
    }
  }

  const hasGeminiKey = true; // We'll check server-side

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Search Mode Toggle */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Search size={18} style={{ color: '#6B1D2A' }} />
          <p className="text-[15px] font-medium" style={{ color: '#2C1810' }}>
            Search Mode
          </p>
        </div>
        <p className="text-[12px]" style={{ color: '#7A6B5F' }}>
          Choose how search works for visitors on the public site.
        </p>

        <div className="space-y-3">
          {/* Standard: Vector Search */}
          <label
            className="card flex items-start gap-4 p-4 cursor-pointer transition-all"
            style={{
              borderColor: searchMode === 'standard' ? '#E8860C' : undefined,
              background: searchMode === 'standard' ? '#FFFCF7' : undefined,
            }}
          >
            <input
              type="radio"
              name="search_mode"
              value="standard"
              checked={searchMode === 'standard'}
              onChange={() => setSearchMode('standard')}
              className="mt-1 accent-[#E8860C]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Database size={16} style={{ color: '#E8860C' }} />
                <span className="text-[14px] font-medium" style={{ color: '#2C1810' }}>
                  Smart Search (Vector)
                </span>
              </div>
              <p className="text-[12px] mt-1" style={{ color: '#7A6B5F' }}>
                Semantic search powered by pgvector. Understands meaning — &ldquo;songs about peace&rdquo; finds
                shanti bhajans even without the exact word. Fast, free, no external API calls at search time.
              </p>
            </div>
          </label>

          {/* AI: Vector + Gemini Summary */}
          <label
            className="card flex items-start gap-4 p-4 cursor-pointer transition-all"
            style={{
              borderColor: searchMode === 'ai' ? '#E8860C' : undefined,
              background: searchMode === 'ai' ? '#FFFCF7' : undefined,
            }}
          >
            <input
              type="radio"
              name="search_mode"
              value="ai"
              checked={searchMode === 'ai'}
              onChange={() => setSearchMode('ai')}
              className="mt-1 accent-[#E8860C]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: '#E8860C' }} />
                <span className="text-[14px] font-medium" style={{ color: '#2C1810' }}>
                  AI Search (Vector + Gemini)
                </span>
              </div>
              <p className="text-[12px] mt-1" style={{ color: '#7A6B5F' }}>
                Everything in Smart Search plus a natural language summary from Google Gemini.
                Users can ask questions like &ldquo;which bhajan for Ganesh Chaturthi?&rdquo; and get a
                helpful answer. Requires GEMINI_API_KEY environment variable.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || searchMode === currentMode}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: '#6B1D2A' }}
          >
            {saved ? <Check size={16} /> : null}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Setting'}
          </button>
          {searchMode !== currentMode && (
            <span className="text-[11px]" style={{ color: '#E8860C' }}>
              Unsaved change
            </span>
          )}
        </div>
      </div>

      {/* Embedding Management */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Database size={18} style={{ color: '#6B1D2A' }} />
          <p className="text-[15px] font-medium" style={{ color: '#2C1810' }}>
            Embeddings
          </p>
        </div>
        <p className="text-[12px]" style={{ color: '#7A6B5F' }}>
          Embeddings power semantic search. They&apos;re generated automatically when you save a resource,
          but you can also rebuild all at once.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg text-center" style={{ background: '#FDF8F0' }}>
            <p className="text-xl font-bold" style={{ color: '#2C1810' }}>{totalResources}</p>
            <p className="text-[11px]" style={{ color: '#7A6B5F' }}>Total Resources</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: '#F0FDF4' }}>
            <p className="text-xl font-bold" style={{ color: '#16A34A' }}>
              {embeddingStats?.embedded ?? '—'}
            </p>
            <p className="text-[11px]" style={{ color: '#7A6B5F' }}>Embedded</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: embeddingStats?.missing ? '#FEF2F2' : '#FDF8F0' }}>
            <p className="text-xl font-bold" style={{ color: embeddingStats?.missing ? '#DC2626' : '#2C1810' }}>
              {embeddingStats?.missing ?? '—'}
            </p>
            <p className="text-[11px]" style={{ color: '#7A6B5F' }}>Missing</p>
          </div>
        </div>

        {/* Rebuild Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRebuildEmbeddings}
            disabled={rebuilding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 hover:bg-[#FDF8F0]"
            style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#6B1D2A' }}
          >
            <RefreshCw size={16} className={rebuilding ? 'animate-spin' : ''} />
            {rebuilding ? 'Rebuilding...' : 'Rebuild All Embeddings'}
          </button>
          {rebuildProgress && (
            <span className="text-[12px]" style={{ color: '#E8860C' }}>
              {rebuildProgress}
            </span>
          )}
        </div>

        <div
          className="p-3 rounded-lg text-[11px]"
          style={{ background: '#FFF8EB', color: '#7A6B5F' }}
        >
          <strong style={{ color: '#2C1810' }}>Note:</strong> Rebuilding uses the Google Gemini Embedding API
          (free tier). For ~770 resources it takes about 30 seconds. New resources are embedded automatically on save.
        </div>
      </div>

      {/* Environment Status */}
      <div className="card p-5 space-y-3">
        <p className="text-[15px] font-medium" style={{ color: '#2C1810' }}>
          Environment Status
        </p>
        <EnvironmentCheck />
      </div>
    </div>
  );
}

function EnvironmentCheck() {
  const [status, setStatus] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch('/api/embeddings/status').then(r => r.json()).then(setStatus).catch(() => null);
  }, []);

  if (!status) return <p className="text-[12px]" style={{ color: '#A89888' }}>Checking...</p>;

  const items = [
    { key: 'supabase', label: 'Supabase Connected' },
    { key: 'geminiKey', label: 'GEMINI_API_KEY Set' },
    { key: 'vectorExtension', label: 'pgvector Extension' },
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2 text-[13px]">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: status[item.key] ? '#16A34A' : '#DC2626' }}
          />
          <span style={{ color: status[item.key] ? '#2C1810' : '#DC2626' }}>
            {item.label}
          </span>
          {!status[item.key] && item.key === 'geminiKey' && (
            <span className="text-[11px]" style={{ color: '#A89888' }}>
              — Add to Vercel env vars
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
