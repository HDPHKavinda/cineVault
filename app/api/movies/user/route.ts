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
    const genre = searchParams.get('genre');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 40;
    const offset = (page - 1) * limit;

    let movies: Record<string, any>[];
    let countRows: Record<string, any>[];

    if (status) {
      if (genre && genre !== 'All') {
        movies = await sql`
          SELECT m.*, um.status, um.rating as user_rating, um.review, um.added_at, um.watched_at
          FROM movies m JOIN user_movies um ON m.id = um.movie_id
          WHERE um.user_id = ${user.id} AND um.status = ${status}
            AND (m.genre::text ILIKE ${'%' + genre + '%'} OR m.genre_text ILIKE ${'%' + genre + '%'})
          ORDER BY um.added_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countRows = await sql`
          SELECT COUNT(*) as total FROM user_movies um
          JOIN movies m ON m.id = um.movie_id
          WHERE um.user_id = ${user.id} AND um.status = ${status}
            AND (m.genre::text ILIKE ${'%' + genre + '%'} OR m.genre_text ILIKE ${'%' + genre + '%'})
        `;
      } else {
        movies = await sql`
          SELECT m.*, um.status, um.rating as user_rating, um.review, um.added_at, um.watched_at
          FROM movies m JOIN user_movies um ON m.id = um.movie_id
          WHERE um.user_id = ${user.id} AND um.status = ${status}
          ORDER BY um.added_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countRows = await sql`
          SELECT COUNT(*) as total FROM user_movies WHERE user_id = ${user.id} AND status = ${status}
        `;
      }
    } else {
      movies = await sql`
        SELECT m.*, um.status, um.rating as user_rating, um.review, um.added_at, um.watched_at
        FROM movies m JOIN user_movies um ON m.id = um.movie_id
        WHERE um.user_id = ${user.id}
        ORDER BY um.added_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`SELECT COUNT(*) as total FROM user_movies WHERE user_id = ${user.id}`;
    }

    return NextResponse.json({
      movies,
      total: Number(countRows[0]?.total || 0),
      page,
    });
  } catch (error) {
    console.error('Get user movies error:', error);
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

    const body = await request.json();
    const { status, rating, review, movie_data } = body;

    if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 });

    let movieId: number;

    if (movie_data) {
      // Claude AI sourced movie
      const { title, year, type, genre, rating: movieRating, director, cast, plot, runtime } = movie_data;
      if (!title) return NextResponse.json({ error: 'Movie title required' }, { status: 400 });

      const genreText = Array.isArray(genre) ? genre.join(', ') : (genre || '');
      const castArr = Array.isArray(cast) ? cast : [];

      const existing = await sql`
        SELECT id FROM movies WHERE LOWER(title) = LOWER(${title}) AND year = ${year || null}
      `;

      if (existing.length > 0) {
        movieId = existing[0].id;
      } else {
        const inserted = await sql`
          INSERT INTO movies (title, year, genre, genre_text, rating, director, cast, plot, runtime, type)
          VALUES (
            ${title},
            ${year || null},
            ${genreText ? [genreText] : []},
            ${genreText},
            ${movieRating || null},
            ${director || null},
            ${castArr},
            ${plot || null},
            ${runtime || null},
            ${type || 'movie'}
          )
          RETURNING id
        `;
        movieId = inserted[0].id;
      }
    } else {
      return NextResponse.json({ error: 'movie_data required' }, { status: 400 });
    }

    await sql`
      INSERT INTO user_movies (user_id, movie_id, status, rating, review)
      VALUES (${user.id}, ${movieId}, ${status}, ${rating || null}, ${review || null})
      ON CONFLICT (user_id, movie_id, status)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        review = EXCLUDED.review,
        watched_at = CASE WHEN EXCLUDED.status = 'watched' THEN CURRENT_TIMESTAMP ELSE user_movies.watched_at END
    `;

    return NextResponse.json({ success: true, movieId });
  } catch (error) {
    console.error('Add movie error:', error);
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
    const movieId = searchParams.get('movieId');
    const status = searchParams.get('status');

    if (!movieId) return NextResponse.json({ error: 'movieId required' }, { status: 400 });

    if (status) {
      await sql`DELETE FROM user_movies WHERE user_id = ${user.id} AND movie_id = ${movieId} AND status = ${status}`;
    } else {
      await sql`DELETE FROM user_movies WHERE user_id = ${user.id} AND movie_id = ${movieId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete movie error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
