'use client';

import { useState, useEffect } from 'react';
import { List, Film, Star, Calendar, Play } from 'lucide-react';

interface User { id: number; email: string; name?: string; }
interface Movie {
  id: number; title: string; year: number; poster_url: string;
  rating: number; status: string; added_at: string;
}

export default function Watchlist({ user }: { user: User }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWatchlist(); }, [user.id]);

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/movies/user?status=watchlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markWatched = async (movieId: number) => {
    const token = localStorage.getItem('authToken');
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;
    await fetch('/api/movies/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tmdb_id: movieId, status: 'watched' }),
    });
    fetchWatchlist();
  };

  if (loading) return <div className="p-6 text-[var(--text-muted)]">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center">
          <List className="mr-3" size={32} /> Watchlist
        </h1>
        <p className="text-[var(--text-muted)]">Movies you plan to watch ({movies.length})</p>
      </div>

      {movies.length === 0 ? (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
          <List size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-xl font-bold text-[var(--text)] mb-2">Your Watchlist is Empty</h3>
          <p className="text-[var(--text-muted)]">Discover movies and add them to your watchlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {movies.map(movie => (
            <div key={movie.id} className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden group">
              <div className="aspect-[2/3] relative">
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--navy)] flex items-center justify-center">
                    <Film size={32} className="text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={() => markWatched(movie.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium flex items-center gap-1">
                    <Play size={14} /> Watched
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-[var(--text)] truncate">{movie.title}</h3>
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span className="flex items-center"><Calendar size={11} className="mr-1" />{movie.year}</span>
                  {movie.rating && <span className="flex items-center"><Star size={11} className="text-yellow-400 mr-1" />{Number(movie.rating).toFixed(1)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
