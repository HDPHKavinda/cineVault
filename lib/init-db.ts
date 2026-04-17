import sql from '@/lib/db';

let initialized = false;

export async function ensureSchema() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      avatar_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      tmdb_id INTEGER UNIQUE,
      title VARCHAR(500) NOT NULL,
      year INTEGER,
      genre TEXT[],
      rating DECIMAL(3,1),
      director VARCHAR(255),
      cast TEXT[],
      plot TEXT,
      runtime INTEGER,
      poster_url VARCHAR(500),
      backdrop_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_movies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
      status VARCHAR(20) CHECK (status IN ('watched', 'watchlist', 'favorite')),
      rating DECIMAL(3,1),
      review TEXT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      watched_at TIMESTAMP,
      UNIQUE(user_id, movie_id, status)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      theme VARCHAR(20) DEFAULT 'dark',
      tmdb_api_key VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_movies_status ON user_movies(status)`;

  initialized = true;
}
