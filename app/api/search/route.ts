import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to your environment variables.' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: 'You are a movie database assistant. Always respond with ONLY a valid JSON array — no markdown, no explanation, no code blocks. Return accurate real movie/TV data.',
        messages: [{
          role: 'user',
          content: `Search for movies and TV shows matching: "${query}". Return a JSON array of exactly up to 6 results. Each object must have these exact fields:
- title: string
- year: number (release year)
- type: "movie" or "tv"
- genre: string (primary genre)
- rating: number (1.0-10.0 IMDb-style)
- director: string
- cast: array of exactly 3 strings (top cast members)
- plot: string (2-3 sentence summary)
- runtime: number (minutes; for TV use average episode length)
- posterSearch: string (descriptive Google image search query to find the official poster, e.g. "Inception 2010 movie official poster")

Return ONLY the JSON array. No other text.`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return NextResponse.json({ error: 'AI search failed. Check your ANTHROPIC_API_KEY.' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '[]';

    let results;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      results = JSON.parse(cleaned);
      if (!Array.isArray(results)) results = [];
    } catch {
      results = [];
    }

    return NextResponse.json({ results: results.slice(0, 6) });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
