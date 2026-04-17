import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'watched', 'watchlist', 'favorite'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    let query;
    let countQuery;

    if (status) {
      query = sql`
        SELECT
          m.*,
          um.rating as user_rating,
          um.review,
          um.added_at,
          um.watched_at
        FROM movies m
        JOIN user_movies um ON m.id = um.movie_id
        WHERE um.user_id = ${user.id} AND um.status = ${status}
        ORDER BY um.added_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countQuery = sql`
        SELECT COUNT(*) as total
        FROM user_movies
        WHERE user_id = ${user.id} AND status = ${status}
      `;
    } else {
      // Get all user movies
      query = sql`
        SELECT
          m.*,
          um.status,
          um.rating as user_rating,
          um.review,
          um.added_at,
          um.watched_at
        FROM movies m
        JOIN user_movies um ON m.id = um.movie_id
        WHERE um.user_id = ${user.id}
        ORDER BY um.added_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countQuery = sql`
        SELECT COUNT(*) as total
        FROM user_movies
        WHERE user_id = ${user.id}
      `;
    }

    const [movies, countResult] = await Promise.all([query, countQuery]);
    const total = countResult[0].total;

    return NextResponse.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user movies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { tmdb_id, status, rating, review } = await request.json();

    if (!tmdb_id || !status) {
      return NextResponse.json(
        { error: 'Movie ID and status are required' },
        { status: 400 }
      );
    }

    // First, ensure the movie exists in our database
    let movie = await sql`
      SELECT id FROM movies WHERE tmdb_id = ${tmdb_id}
    `;

    if (movie.length === 0) {
      // Fetch movie details from TMDB and insert
      const TMDB_API_KEY = process.env.TMDB_API_KEY;
      if (!TMDB_API_KEY) {
        return NextResponse.json(
          { error: 'TMDB API key not configured' },
          { status: 500 }
        );
      }

      const axios = (await import('axios')).default;
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdb_id}`, {
        params: { api_key: TMDB_API_KEY },
      });

      const movieData = response.data;
      const insertResult = await sql`
        INSERT INTO movies (
          tmdb_id, title, year, genre, rating, plot, runtime,
          poster_url, backdrop_url
        ) VALUES (
          ${tmdb_id},
          ${movieData.title},
          ${movieData.release_date ? new Date(movieData.release_date).getFullYear() : null},
          ${movieData.genres?.map((g: any) => g.name) || []},
          ${movieData.vote_average},
          ${movieData.overview},
          ${movieData.runtime},
          ${movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null},
          ${movieData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}` : null}
        )
        RETURNING id
      `;
      movie = insertResult;
    }

    const movieId = movie[0]?.id || (movie as any).id;

    // Add or update user movie status
    await sql`
      INSERT INTO user_movies (user_id, movie_id, status, rating, review)
      VALUES (${user.id}, ${movieId}, ${status}, ${rating || null}, ${review || null})
      ON CONFLICT (user_id, movie_id, status)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        review = EXCLUDED.review,
        watched_at = CASE WHEN EXCLUDED.status = 'watched' THEN CURRENT_TIMESTAMP ELSE user_movies.watched_at END
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add user movie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const status = searchParams.get('status');

    if (!movieId || !status) {
      return NextResponse.json(
        { error: 'Movie ID and status are required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM user_movies
      WHERE user_id = ${user.id} AND movie_id = ${movieId} AND status = ${status}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user movie error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}