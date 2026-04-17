'use client';
import { useState } from 'react';
import { Search, Loader2, Star, Clock, BookmarkPlus, Eye, Heart, X, Film, Tv } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';

interface TmdbResult {
  tmdb_id: number; title: string; year: number; type: 'movie' | 'tv';
  genre: string; genres: string[]; rating: number; plot: string;
  poster_url: string | null; backdrop_url: string | null;
}
interface Props { user: any; token: string; }

export default function Discover({ user, token }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, string>>({});
  const { toasts, toast, dismiss } = useToast();

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
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

  const addToLibrary = async (item: TmdbResult, status: string) => {
    const key = `${item.tmdb_id}-${status}`;
    setAdding(p => ({ ...p, [key]: true }));
    try {
      const endpoint = item.type === 'tv' ? '/api/tv' : '/api/movies/user';
      const body = item.type === 'tv'
        ? { series_data: { title: item.title, year: item.year, genre: item.genre, genres: item.genres, rating: item.rating, plot: item.plot }, tv_status: status === 'watchlist' ? 'watching' : status }
        : { tmdb_id: item.tmdb_id, type: item.type, title: item.title, year: item.year, genre: item.genre, genres: item.genres, rating: item.rating, plot: item.plot, poster_url: item.poster_url, backdrop_url: item.backdrop_url, status };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const labels: Record<string, string> = { watched: 'Marked as Watched', watchlist: 'Added to Watchlist', favorite: 'Added to Favorites', watching: 'Added to TV Series' };
        toast(`${item.title} — ${labels[status] || 'Added'}`, 'success');
        setAdded(p => ({ ...p, [item.tmdb_id]: status }));
      } else {
        const d = await res.json();
        toast(d.error || 'Failed to add', 'error');
      }
    } catch { toast('Failed to add', 'error'); }
    setAdding(p => ({ ...p, [key]: false }));
  };

  const MovieCard = ({ m }: { m: TmdbResult }) => {
    const isAdded = added[m.tmdb_id];
    return (
      <div className="movie-card rounded-xl border overflow-hidden cursor-pointer group"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
        onClick={() => setSelected(m)}>
        {/* Poster */}
        <div className="aspect-[2/3] relative overflow-hidden" style={{ background: 'var(--bg3)' }}>
          {m.poster_url
            ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                <span className="text-4xl">{m.type === 'tv' ? '📺' : '🎬'}</span>
                <span className="text-xs text-center font-medium line-clamp-2" style={{ color: 'var(--text2)' }}>{m.title}</span>
              </div>
          }
          {/* Type badge */}
          {m.type === 'tv' && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(79,142,247,0.9)', color: 'white' }}>TV</span>
            </div>
          )}
          {isAdded && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(20,184,166,0.9)', color: '#060d1f' }}>✓ Added</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(to top, rgba(6,13,31,0.97) 0%, rgba(6,13,31,0.7) 50%, transparent 100%)' }}>
            <div className="absolute bottom-3 left-0 right-0 px-3 flex flex-col gap-1.5">
              <button onClick={e => { e.stopPropagation(); addToLibrary(m, m.type === 'tv' ? 'watching' : 'watchlist'); }}
                disabled={adding[`${m.tmdb_id}-watchlist`] || adding[`${m.tmdb_id}-watching`]}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--purple)', color: 'white' }}>
                <BookmarkPlus size={12} />{m.type === 'tv' ? 'Watching' : 'Watchlist'}
              </button>
              <button onClick={e => { e.stopPropagation(); addToLibrary(m, 'watched'); }}
                disabled={adding[`${m.tmdb_id}-watched`]}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--teal)', color: '#060d1f' }}>
                <Eye size={12} />Watched
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate mb-1">{m.title}</h3>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
            {m.year > 0 && <span>{m.year}</span>}
            {m.rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star size={10} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
                {m.rating.toFixed(1)}
              </span>
            )}
            {m.genre && <span className="truncate" style={{ color: 'var(--text3)' }}>{m.genre}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text3)' }}>◆ Powered by TMDB</p>
        <h1 className="text-4xl font-bold mb-1">Discover</h1>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>Search any movie or TV show and add it to your vault.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={search} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
          <input className="cv-input pl-11 h-12 text-base" type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Try "Inception", "Breaking Bad", or "Christopher Nolan"…' />
        </div>
        <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 px-7 h-12">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl border text-sm" style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.25)', color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>
            {results.length} results for <span className="font-semibold text-white">"{query}"</span>
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))' }}>
            {results.map(m => <MovieCard key={m.tmdb_id} m={m} />)}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && !query && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Search your next film</h3>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Over a million movies and shows waiting in the vault.
          </p>
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎬</div>
          <h3 className="font-semibold mb-1">No results found</h3>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Try a different title or search by actor name.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border overflow-hidden animate-slide-up"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            {/* Backdrop */}
            {selected.backdrop_url && (
              <div className="h-40 relative overflow-hidden">
                <img src={selected.backdrop_url} alt={selected.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--bg2))' }} />
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4">
                  {selected.poster_url && (
                    <img src={selected.poster_url} alt={selected.title}
                      className="w-20 h-28 rounded-xl object-cover shrink-0 -mt-10 border-2 shadow-xl"
                      style={{ borderColor: 'var(--border)' }} />
                  )}
                  <div className="pt-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {selected.type === 'tv' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(79,142,247,0.2)', color: 'var(--blue)' }}>TV SERIES</span>
                      )}
                      {selected.genres?.slice(0, 2).map(g => (
                        <span key={g} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>{g}</span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold">{selected.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text2)' }}>
                      {selected.year > 0 && <span>{selected.year}</span>}
                      {selected.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={13} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
                          {selected.rating.toFixed(1)} / 10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg shrink-0 hover:bg-white/5 transition-colors" style={{ color: 'var(--text2)' }}>
                  <X size={18} />
                </button>
              </div>

              {selected.plot && (
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text2)' }}>{selected.plot}</p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button onClick={() => { addToLibrary(selected, selected.type === 'tv' ? 'watching' : 'watchlist'); setSelected(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  <BookmarkPlus size={14} />{selected.type === 'tv' ? 'Add to Watching' : 'Add to Watchlist'}
                </button>
                <button onClick={() => { addToLibrary(selected, 'watched'); setSelected(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--teal)', color: '#060d1f' }}>
                  <Eye size={14} />Mark as Watched
                </button>
                <button onClick={() => { addToLibrary(selected, 'favorite'); setSelected(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                  <Heart size={14} />Favourite
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
