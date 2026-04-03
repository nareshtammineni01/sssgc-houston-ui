import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Music,
  FileText,
  Headphones,
  Eye,
  ExternalLink,
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
  bhajan: 'Bhajan',
  prayer: 'Prayer',
  study_circle: 'Study Circle',
  document: 'Document',
  bhajan_resource: 'Bhajan Resource',
};

const categoryColors: Record<string, string> = {
  bhajan: 'bg-saffron-50 text-saffron-600',
  prayer: 'bg-maroon-50 text-maroon-600',
  study_circle: 'bg-blue-50 text-blue-600',
  document: 'bg-gray-100 text-gray-600',
  bhajan_resource: 'bg-gold-50 text-gold-600',
};

export default async function ResourceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Increment view count
  await supabase.rpc('increment_view_count', { resource_id: params.id });

  // Fetch resource
  const { data: resource } = await supabase
    .from('resources')
    .select('*')
    .eq('id', params.id)
    .single() as { data: any };

  if (!resource) {
    notFound();
  }

  return (
    <div className="page-enter max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: '#E8860C' }}
      >
        <ArrowLeft size={16} />
        Back to Resources
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${
              categoryColors[resource.category] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {categoryLabels[resource.category] ?? resource.category}
          </span>
          {resource.deity && (
            <span className="text-[12px] font-medium" style={{ color: '#E8860C' }}>
              {resource.deity}
            </span>
          )}
        </div>

        <h1
          className="text-[22px] md:text-[26px] leading-tight mb-2"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            color: '#6B1D2A',
          }}
        >
          {resource.title}
        </h1>

        <div className="flex items-center gap-4 text-[12px]" style={{ color: '#A89888' }}>
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {resource.view_count} views
          </span>
          {resource.keywords && resource.keywords.length > 0 && (
            <div className="flex items-center gap-1.5">
              {resource.keywords.map((kw: string) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-cream-100"
                  style={{ color: '#7A6B5F' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons: PDF + Audio */}
      {(resource.file_url || resource.audio_url) && (
        <div className="flex flex-wrap gap-3">
          {resource.file_url && (
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: '#6B1D2A' }}
            >
              <FileText size={16} />
              View PDF
              <ExternalLink size={14} />
            </a>
          )}
          {resource.audio_url && (
            <a
              href={resource.audio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-cream-50"
              style={{ borderColor: 'rgba(107,29,42,0.15)', color: '#6B1D2A' }}
            >
              <Headphones size={16} />
              Listen to Audio
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {/* Content body */}
      {resource.content && (
        <div
          className="card p-6 md:p-8"
          style={{ borderColor: 'rgba(107,29,42,0.1)' }}
        >
          <div
            className="whitespace-pre-wrap text-[14px] leading-relaxed"
            style={{ color: '#2C1810' }}
          >
            {resource.content}
          </div>
        </div>
      )}

      {/* Bottom back link */}
      <div className="pt-4">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#E8860C' }}
        >
          <ArrowLeft size={16} />
          Back to Resources
        </Link>
      </div>
    </div>
  );
}
