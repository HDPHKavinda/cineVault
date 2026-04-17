'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bookmark, Star, Grid3X3, List, Trash2, Eye } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';

interface Props { user: any; token: string; }

export default function Watchlist({ user, token }: Props) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { toasts, toast, dismiss } = useToast();

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/movies/user?status=watchlist', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMovies((await res.json()).movies || []);
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const remove = async (movieId: number, title: string) => {
    await fetch(`/api/movies/user?movieId=${movieId}&status=watchlist`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast(`${title} removed from Watchlist`, 'info');
    fetchMovies();
  };

  const markWatched = async (m: any) => {
    await fetch('/api/movies/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ movie_data: { title: m.title, year: m.year, genre: m.genre_text, rating: m.rating, type: m.type || 'movie', plot: m.plot, director: m.director }, status: 'watched' }),
    });
    toast(`${m.title} marked as Watched`, 'success');
    fetchMovies();
  };

  const MovieCard = ({ m }: { m: any }) => (
    <div className="movie-card rounded-xl border overflow-hidden group relative" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
      <div className="aspect-[2/3] relative overflow-hidden" style={{ background: 'var(--bg3)' }}>
        {m.poster_url
          ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center flex-col gap-2">
              <span className="text-4xl">{m.type === 'tv' ? '📺' : '🎬'}</span>
              <span className="text-xs text-center px-2 line-clamp-2" style={{ color: 'var(--text3)' }}>{m.title}</span>
            </div>}
        <div className="absolute top-2 left-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(124,106,240,0.85)', color: 'white' }}>Watchlist</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(6,13,31,0.85)' }}>
          <button onClick={() => markWatched(m)} title="Mark Watched" className="p-2 rounded-lg" style={{ background: 'rgba(20,184,166,0.2)', color: 'var(--teal)' }}><Eye size={15} /></button>
          <button onClick={() => remove(m.id, m.title)} title="Remove" className="p-2 rounded-lg" style={{ background: 'rgba(230,57,70,0.2)', color: 'var(--red)' }}><Trash2 size={15} /></button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate mb-1">{m.title}</h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
          <span>{m.year}</span>
          {m.rating && <span className="flex items-center gap-0.5"><Star size={10} style={{ color: 'var(--gold)' }} />{Number(m.rating).toFixed(1)}</span>}
        </div>
      </div>
    </div>
  );

  const ListRow = ({ m }: { m: any }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl border group" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-2xl" style={{ background: 'var(--bg3)' }}>
        {m.poster_url ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" /> : (m.type === 'tv' ? '📺' : '🎬')}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{m.title}</h3>
        <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--text2)' }}>
          <span>{m.year}</span>
          {m.rating && <span className="flex items-center gap-0.5"><Star size={10} style={{ color: 'var(--gold)' }} />{Number(m.rating).toFixed(1)}</span>}
          <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,106,240,0.15)', color: 'var(--purple)' }}>Watchlist</span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => markWatched(m)} className="p-1.5 rounded-lg" style={{ color: 'var(--teal)' }}><Eye size={14} /></button>
        <button onClick={() => remove(m.id, m.title)} className="p-1.5 rounded-lg" style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2"><Bookmark size={28} style={{ color: 'var(--purple)' }} /> Watchlist</h1>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>{movies.length} film{movies.length !== 1 ? 's' : ''} queued to watch</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className="p-2 rounded-lg" style={{ background: view === 'grid' ? 'var(--gold)' : 'var(--bg3)', color: view === 'grid' ? '#060d1f' : 'var(--text2)' }}><Grid3X3 size={16} /></button>
          <button onClick={() => setView('list')} className="p-2 rounded-lg" style={{ background: view === 'list' ? 'var(--gold)' : 'var(--bg3)', color: view === 'list' ? '#060d1f' : 'var(--text2)' }}><List size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] rounded-xl animate-pulse" style={{ background: 'var(--bg3)' }} />)}
        </div>
      ) : movies.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <Bookmark size={48} className="mx-auto mb-3 opacity-30" />
          <h3 className="font-semibold mb-1">Your watchlist is empty</h3>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Discover films and add them to your watchlist.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))' }}>
          {movies.map(m => <MovieCard key={m.id} m={m} />)}
        </div>
      ) : (
        <div className="space-y-3">{movies.map(m => <ListRow key={m.id} m={m} />)}</div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
