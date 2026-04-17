'use client';
import { useState } from 'react';
import { Search, Loader2, Star, Clock, Film, Tv, X, BookmarkPlus, Eye, Heart } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';

interface SearchResult {
  title: string; year: number; type: 'movie' | 'tv'; genre: string;
  rating: number; director: string; cast: string[]; plot: string; runtime: number; posterSearch: string;
}
interface Props { user: any; token: string; }

export default function Discover({ user, token }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const { toasts, toast, dismiss } = useToast();

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setResults(data.results || []);
      else setError(data.error || 'Search failed');
    } catch { setError('Search failed. Please try again.'); }
    setLoading(false);
  };

  const addToLibrary = async (movie: SearchResult, status: string) => {
    const key = `${movie.title}-${status}`;
    setAdding(p => ({ ...p, [key]: true }));
    try {
      const endpoint = movie.type === 'tv' ? '/api/tv' : '/api/movies/user';
      const body = movie.type === 'tv'
        ? { series_data: movie, tv_status: status === 'watchlist' ? 'watching' : status }
        : { movie_data: movie, status };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const labels: Record<string, string> = { watched: 'Marked as Watched', watchlist: 'Added to Watchlist', favorite: 'Added to Favorites' };
        toast(`${movie.title} — ${labels[status] || 'Added'}`, 'success');
      } else {
        const d = await res.json();
        toast(d.error || 'Failed to add', 'error');
      }
    } catch { toast('Failed to add to library', 'error'); }
    setAdding(p => ({ ...p, [key]: false }));
  };

  const MovieCard = ({ m }: { m: SearchResult }) => (
    <div className="movie-card rounded-2xl border overflow-hidden cursor-pointer group"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
      onClick={() => setSelected(m)}>
      <div className="aspect-[2/3] relative overflow-hidden" style={{ background: 'var(--bg3)' }}>
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
          <span className="text-5xl">{m.type === 'tv' ? '📺' : '🎬'}</span>
          <span className="text-xs text-center font-medium line-clamp-2">{m.title}</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(6,13,31,0.92)' }}>
          <button onClick={e => { e.stopPropagation(); addToLibrary(m, 'watchlist'); }}
            disabled={adding[`${m.title}-watchlist`]}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-36 justify-center"
            style={{ background: 'var(--purple)', color: 'white' }}>
            <BookmarkPlus size={13} /> Watchlist
          </button>
          <button onClick={e => { e.stopPropagation(); addToLibrary(m, 'watched'); }}
            disabled={adding[`${m.title}-watched`]}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-36 justify-center"
            style={{ background: 'var(--teal)', color: '#060d1f' }}>
            <Eye size={13} /> Mark Watched
          </button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          {m.type === 'tv' && <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(124,106,240,0.2)', color: 'var(--purple)' }}>TV</span>}
          <span className="text-xs" style={{ color: 'var(--text3)' }}>{m.genre}</span>
        </div>
        <h3 className="font-semibold text-sm line-clamp-1 mb-1">{m.title}</h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
          <span>{m.year}</span>
          {m.rating > 0 && <span className="flex items-center gap-0.5"><Star size={10} style={{ color: 'var(--gold)' }} />{m.rating.toFixed(1)}</span>}
          {m.runtime > 0 && <span className="flex items-center gap-0.5"><Clock size={10} />{m.runtime}m</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Discover</h1>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>AI-powered search — find any film or TV show instantly.</p>
      </div>

      {/* Search */}
      <form onSubmit={search} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input className="cv-input pl-11" type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, actor, director, or genre…" />
        </div>
        <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 px-6">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl border text-sm" style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.3)', color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>{results.length} results for "{query}"</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))' }}>
            {results.map((m, i) => <MovieCard key={i} m={m} />)}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && !query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Start your search</h3>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Try "Christopher Nolan films", "best horror 2020s", or just a movie title.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border overflow-hidden animate-slide-up"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selected.type === 'tv' && <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: 'rgba(124,106,240,0.2)', color: 'var(--purple)' }}>TV SERIES</span>}
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>{selected.genre}</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">{selected.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text2)' }}>
                  {selected.year > 0 && <span>{selected.year}</span>}
                  {selected.rating > 0 && <span className="flex items-center gap-1"><Star size={13} style={{ color: 'var(--gold)' }} />{selected.rating.toFixed(1)}</span>}
                  {selected.runtime > 0 && <span className="flex items-center gap-1"><Clock size={13} />{selected.runtime} min</span>}
                  {selected.director && <span>Dir. {selected.director}</span>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text2)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{selected.plot}</p>

              {selected.cast?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Cast</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.cast.map((c, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => { addToLibrary(selected, 'watchlist'); setSelected(null); }}
                  className="btn-ghost flex items-center gap-2 text-sm">
                  <BookmarkPlus size={15} /> Add to Watchlist
                </button>
                <button onClick={() => { addToLibrary(selected, 'watched'); setSelected(null); }}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold"
                  style={{ background: 'var(--teal)', color: '#060d1f' }}>
                  <Eye size={15} /> Mark as Watched
                </button>
                <button onClick={() => { addToLibrary(selected, 'favorite'); setSelected(null); }}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold"
                  style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                  <Heart size={15} /> Favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
