import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const [counts] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('watched','watchlist','favorite')) AS total_movies,
        COUNT(*) FILTER (WHERE status = 'watched') AS watched,
        COUNT(*) FILTER (WHERE status = 'watchlist') AS watchlist,
        COUNT(*) FILTER (WHERE status = 'favorite') AS favorites
      FROM user_movies
      WHERE user_id = ${user.id}
    `;

    const runtimeResult = await sql`
      SELECT COALESCE(SUM(m.runtime), 0) AS total_minutes
      FROM user_movies um
      JOIN movies m ON m.id = um.movie_id
      WHERE um.user_id = ${user.id} AND um.status = 'watched' AND m.runtime IS NOT NULL
    `;

    return NextResponse.json({
      totalMovies: Number(counts.total_movies),
      watched: Number(counts.watched),
      watchlist: Number(counts.watchlist),
      favorites: Number(counts.favorites),
      totalHours: Math.round(Number(runtimeResult[0]?.total_minutes || 0) / 60),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
