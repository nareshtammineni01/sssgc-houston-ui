/**
 * Client-side helper to trigger on-demand revalidation.
 * Call this after any admin create/edit/delete operation.
 *
 * Usage:
 *   await triggerRevalidation({ type: 'resource', category: 'bhajan', slug: 'om-jai-jagadish-hare' });
 */
export async function triggerRevalidation(params: {
  type: 'resource' | 'event';
  slug?: string;
  category?: string;
}) {
  try {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      console.warn('Revalidation request failed:', res.status);
    }
  } catch (err) {
    // Fire-and-forget — don't block the admin UX if revalidation fails.
    // The ISR fallback (24h) will catch it eventually.
    console.warn('Revalidation request error:', err);
  }
}
