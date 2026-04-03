'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryPhoto } from '@/types/database';

interface PhotoGridProps {
  photos: GalleryPhoto[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function openLightbox(index: number) {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }

  function prev() {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : photos.length - 1);
  }

  function next() {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex < photos.length - 1 ? lightboxIndex + 1 : 0);
  }

  if (photos.length === 0) {
    return (
      <div className="card p-12 text-center" style={{ color: '#A89888' }}>
        No photos in this album yet.
      </div>
    );
  }

  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(i)}
            className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
            style={{ background: '#FDF8F0' }}
          >
            <img
              src={photo.thumbnail_url || photo.image_url}
              alt={photo.caption || ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {photo.caption && (
              <div
                className="absolute inset-x-0 bottom-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}
              >
                <p className="text-[11px] text-white truncate">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Prev/Next */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].image_url}
              alt={photos[lightboxIndex].caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {photos[lightboxIndex].caption && (
              <p className="text-white/80 text-sm mt-3 text-center">
                {photos[lightboxIndex].caption}
              </p>
            )}
            <p className="text-white/40 text-xs mt-1">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
