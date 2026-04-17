import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const TMDB = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });

  try {
    const res = await fetch(
      `${TMDB}/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&page=1`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) return NextResponse.json({ error: 'TMDB search failed' }, { status: 502 });

    const data = await res.json();
    const results = (data.results || [])
      .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 12)
      .map((r: any) => {
        const isTV = r.media_type === 'tv';
        const genres = (r.genre_ids || []).map((id: number) => GENRE_MAP[id]).filter(Boolean);
        return {
          tmdb_id: r.id,
          title: isTV ? r.name : r.title,
          year: isTV
            ? (r.first_air_date ? new Date(r.first_air_date).getFullYear() : null)
            : (r.release_date ? new Date(r.release_date).getFullYear() : null),
          type: isTV ? 'tv' : 'movie',
          genre: genres[0] || 'Unknown',
          genres,
          rating: r.vote_average ? Math.round(r.vote_average * 10) / 10 : 0,
          plot: r.overview || '',
          poster_url: r.poster_path ? `${IMG}/w500${r.poster_path}` : null,
          backdrop_url: r.backdrop_path ? `${IMG}/w1280${r.backdrop_path}` : null,
          popularity: r.popularity || 0,
        };
      })
      .sort((a: any, b: any) => b.popularity - a.popularity);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
