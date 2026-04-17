import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { tmdbApiKey } = await request.json();

    await sql`
      INSERT INTO user_preferences (user_id, tmdb_api_key)
      VALUES (${user.id}, ${tmdbApiKey || null})
      ON CONFLICT (user_id) DO UPDATE SET
        tmdb_api_key = EXCLUDED.tmdb_api_key,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
