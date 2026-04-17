import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const movies = await sql`
      SELECT m.id, m.title, m.year, m.poster_url, m.rating, um.status, um.added_at
      FROM movies m
      JOIN user_movies um ON m.id = um.movie_id
      WHERE um.user_id = ${user.id}
      ORDER BY um.added_at DESC
      LIMIT 10
    `;

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Recent movies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
