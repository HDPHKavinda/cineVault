import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { ensureSchema } from '@/lib/init-db';

export async function GET(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let series: Record<string, any>[];
    if (status && status !== 'all') {
      series = await sql`
        SELECT ts.*, uts.status as tv_status, uts.current_season, uts.current_episode, uts.rating as user_rating, uts.added_at
        FROM tv_series ts JOIN user_tv_series uts ON ts.id = uts.tv_series_id
        WHERE uts.user_id = ${user.id} AND uts.status = ${status}
        ORDER BY uts.added_at DESC
      `;
    } else {
      series = await sql`
        SELECT ts.*, uts.status as tv_status, uts.current_season, uts.current_episode, uts.rating as user_rating, uts.added_at
        FROM tv_series ts JOIN user_tv_series uts ON ts.id = uts.tv_series_id
        WHERE uts.user_id = ${user.id}
        ORDER BY uts.added_at DESC
      `;
    }

    return NextResponse.json({ series });
  } catch (error) {
    console.error('Get TV series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { series_data, tv_status } = await request.json();
    if (!series_data?.title) return NextResponse.json({ error: 'Series title required' }, { status: 400 });

    const { title, year, genre, rating, director, cast, plot } = series_data;
    const genreText = Array.isArray(genre) ? genre.join(', ') : (genre || '');
    const castArr = Array.isArray(cast) ? cast : [];

    const existing = await sql`
      SELECT id FROM tv_series WHERE LOWER(title) = LOWER(${title})
    `;

    let seriesId: number;
    if (existing.length > 0) {
      seriesId = existing[0].id;
    } else {
      const inserted = await sql`
        INSERT INTO tv_series (title, year, genre, genre_text, rating, director, cast_members, plot)
        VALUES (${title}, ${year || null}, ${genreText ? [genreText] : []}, ${genreText}, ${rating || null}, ${director || null}, ${castArr}, ${plot || null})
        RETURNING id
      `;
      seriesId = inserted[0].id;
    }

    await sql`
      INSERT INTO user_tv_series (user_id, tv_series_id, status)
      VALUES (${user.id}, ${seriesId}, ${tv_status || 'watching'})
      ON CONFLICT (user_id, tv_series_id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add TV series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { series_id, tv_status, current_season, current_episode } = await request.json();
    if (!series_id) return NextResponse.json({ error: 'series_id required' }, { status: 400 });

    await sql`
      UPDATE user_tv_series SET
        status = COALESCE(${tv_status || null}, status),
        current_season = COALESCE(${current_season || null}, current_season),
        current_episode = COALESCE(${current_episode || null}, current_episode),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id} AND tv_series_id = ${series_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update TV series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');
    if (!seriesId) return NextResponse.json({ error: 'seriesId required' }, { status: 400 });

    await sql`DELETE FROM user_tv_series WHERE user_id = ${user.id} AND tv_series_id = ${seriesId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete TV series error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
