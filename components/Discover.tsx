'use client';

import { useState } from 'react';
import { Search, Star, Calendar, Clock } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface Movie {
  tmdb_id: number;
  title: string;
  year: number;
  rating: number;
  plot: string;
  poster_url: string;
  runtime: number;
}

interface DiscoverProps {
  user: User;
}

export default function Discover({ user }: DiscoverProps) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const searchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMovies(data.movies);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const addToWatchlist = async (movie: Movie) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/movies/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: movie.tmdb_id,
          status: 'watchlist',
        }),
      });

      if (response.ok) {
        alert('Added to watchlist!');
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  const markAsWatched = async (movie: Movie) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/movies/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: movie.tmdb_id,
          status: 'watched',
        }),
      });

      if (response.ok) {
        alert('Marked as watched!');
      }
    } catch (error) {
      console.error('Failed to mark as watched:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Discover Movies</h1>
        <p className="text-[var(--text-muted)]">
          Search for movies and add them to your collection.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 mb-8">
        <form onSubmit={searchMovies} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full px-4 py-3 bg-[var(--navy)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] text-[var(--text)]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[var(--gold)] text-[var(--navy-dark)] rounded-lg font-medium hover:bg-[var(--gold-hover)] transition-colors disabled:opacity-50 flex items-center"
          >
            <Search size={20} className="mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {movies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.tmdb_id}
              className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--gold)] transition-colors cursor-pointer group"
              onClick={() => setSelectedMovie(movie)}
            >
              <div className="aspect-[2/3] relative">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--navy)] flex items-center justify-center">
                    <Search size={48} className="text-[var(--text-muted)]" />
                  </div>
                )}

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchlist(movie);
                      }}
                      className="px-3 py-1 bg-[var(--gold)] text-[var(--navy-dark)] rounded text-sm font-medium hover:bg-[var(--gold-hover)]"
                    >
                      Watchlist
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsWatched(movie);
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600"
                    >
                      Watched
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-[var(--text)] mb-2 line-clamp-2">
                  {movie.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-[var(--text-muted)] mb-2">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {movie.year}
                  </div>
                  {movie.rating && (
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 mr-1" />
                      {movie.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {movie.runtime && (
                  <div className="flex items-center text-sm text-[var(--text-muted)] mb-2">
                    <Clock size={14} className="mr-1" />
                    {movie.runtime} min
                  </div>
                )}

                <p className="text-sm text-[var(--text-muted)] line-clamp-3">
                  {movie.plot}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {movies.length === 0 && query && !loading && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">No movies found. Try a different search term.</p>
        </div>
      )}

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex">
              <div className="w-1/3">
                {selectedMovie.poster_url ? (
                  <img
                    src={selectedMovie.poster_url}
                    alt={selectedMovie.title}
                    className="w-full h-auto rounded-l-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-[var(--navy)] rounded-l-lg flex items-center justify-center">
                    <Search size={48} className="text-[var(--text-muted)]" />
                  </div>
                )}
              </div>

              <div className="w-2/3 p-6">
                <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
                  {selectedMovie.title}
                </h2>

                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
                  <span>{selectedMovie.year}</span>
                  {selectedMovie.rating && (
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 mr-1" />
                      {selectedMovie.rating.toFixed(1)}
                    </div>
                  )}
                  {selectedMovie.runtime && (
                    <span>{selectedMovie.runtime} min</span>
                  )}
                </div>

                <p className="text-[var(--text)] mb-6">{selectedMovie.plot}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => addToWatchlist(selectedMovie)}
                    className="px-4 py-2 bg-[var(--gold)] text-[var(--navy-dark)] rounded-lg font-medium hover:bg-[var(--gold-hover)]"
                  >
                    Add to Watchlist
                  </button>
                  <button
                    onClick={() => markAsWatched(selectedMovie)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                  >
                    Mark as Watched
                  </button>
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="px-4 py-2 bg-[var(--navy)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--navy-light)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}