-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies table
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
);

-- User movie status (watched, watchlist, favorites)
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
);

-- TV Series table
CREATE TABLE IF NOT EXISTS tv_series (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title VARCHAR(500) NOT NULL,
  year INTEGER,
  genre TEXT[],
  rating DECIMAL(3,1),
  director VARCHAR(255),
  cast TEXT[],
  plot TEXT,
  poster_url VARCHAR(500),
  backdrop_url VARCHAR(500),
  total_seasons INTEGER,
  total_episodes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User TV series status
CREATE TABLE IF NOT EXISTS user_tv_series (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tv_series_id INTEGER REFERENCES tv_series(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('watching', 'completed', 'paused', 'dropped')),
  current_season INTEGER DEFAULT 1,
  current_episode INTEGER DEFAULT 1,
  rating DECIMAL(3,1),
  review TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tv_series_id)
);

-- Custom lists
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- List items
CREATE TABLE IF NOT EXISTS list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
  tv_series_id INTEGER REFERENCES tv_series(id) ON DELETE SET NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- User preferences/settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme VARCHAR(20) DEFAULT 'dark',
  default_view VARCHAR(20) DEFAULT 'grid',
  tmdb_api_key VARCHAR(255),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_status ON user_movies(status);
CREATE INDEX IF NOT EXISTS idx_user_tv_series_user_id ON user_tv_series(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);