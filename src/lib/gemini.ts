// ─── Google Gemini API helpers ──────────────────────────────
// Used for: embedding generation + AI search summaries
// Free tier: 10M tokens/min for embeddings, 10 RPM for Flash

const GEMINI_API_KEY = () => process.env.GEMINI_API_KEY ?? '';
const EMBEDDING_MODEL = 'gemini-embedding-001';
const CHAT_MODEL = 'gemini-2.5-flash';

// ─── Embeddings ─────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          taskType: 'RETRIEVAL_DOCUMENT',
        }),
      }
    );

    if (!res.ok) {
      console.error('Gemini embedding error:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.embedding?.values ?? null;
  } catch (err) {
    console.error('Gemini embedding error:', err);
    return null;
  }
}

export async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          taskType: 'RETRIEVAL_QUERY',
        }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.embedding?.values ?? null;
  } catch {
    return null;
  }
}

// ─── Chat / Summary ─────────────────────────────────────────

interface SearchResult {
  title: string;
  category: string;
  deity?: string | null;
  content?: string | null;
}

export async function generateSearchSummary(
  query: string,
  results: SearchResult[]
): Promise<string | null> {
  const apiKey = GEMINI_API_KEY();
  if (!apiKey || results.length === 0) return null;

  const context = results
    .slice(0, 5)
    .map((r, i) => `${i + 1}. "${r.title}" (${r.category}${r.deity ? `, ${r.deity}` : ''})${r.content ? `: ${r.content.replace(/<[^>]+>/g, '').slice(0, 200)}` : ''}`)
    .join('\n');

  const prompt = `You are a helpful assistant for Sri Sathya Sai Center Houston, a spiritual community. A visitor searched for: "${query}"

Here are the matching resources from our library:
${context}

Write a brief, warm 1-2 sentence response that helps the visitor understand what we found for them. Be specific about the results. Do not use markdown formatting. If the results don't closely match the query, say so gently and suggest browsing our collections.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.3,
          },
        }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ─── Prepare text for embedding ─────────────────────────────

export function prepareResourceText(resource: {
  title: string;
  content?: string | null;
  category: string;
  deity?: string | null;
  keywords?: string[] | null;
}): string {
  const parts = [
    `Title: ${resource.title}`,
    `Category: ${resource.category}`,
    resource.deity ? `Deity: ${resource.deity}` : '',
    resource.keywords?.length ? `Keywords: ${resource.keywords.join(', ')}` : '',
    resource.content
      ? `Content: ${resource.content.replace(/<[^>]+>/g, '').slice(0, 2000)}`
      : '',
  ];

  return parts.filter(Boolean).join('\n');
}
