'use client';
import { useState, useEffect } from 'react';
import { Film, Clock, Heart, Bookmark, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  user: { id: number; email: string; name?: string };
  token: string;
  onNavigate?: (page: any) => void;
}

export default function Dashboard({ user, token, onNavigate }: Props) {
  const [stats, setStats] = useState({ totalMovies: 0, watched: 0, watchlist: 0, favorites: 0, totalHours: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/movies/stats', { headers: h }).then(r => r.ok ? r.json() : null),
      fetch('/api/movies/recent', { headers: h }).then(r => r.ok ? r.json() : null),
    ]).then(([s, r]) => {
      if (s) setStats(s);
      if (r) setRecent(r.movies || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Still up late';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  };

  const STATS = [
    { icon: Film,     label: 'Movies watched',  value: stats.watched,     color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
    { icon: Bookmark, label: 'Watchlist count',  value: stats.watchlist,   color: '#f5c518', bg: 'rgba(245,197,24,0.12)' },
    { icon: Heart,    label: 'Favorites',        value: stats.favorites,   color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    { icon: Clock,    label: 'Hours watched',    value: stats.totalHours,  color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg3)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in-up">
      {/* Hero greeting */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--gold)' }}>
            ◆ Neon Library Online
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2">
            {greeting()},<br />
            <span style={{ color: 'var(--text)' }}>{user.name || 'Cinema Lover'}.</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Your watch history, lists, settings, and favorites are synced through Postgres.
          </p>
        </div>
        <button onClick={() => onNavigate?.('discover')}
          className="shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
          style={{ background: 'var(--gold)', color: '#060d1f' }}>
          <Sparkles size={16} />
          Discover tonight
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card rounded-2xl p-5 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
              <Icon size={18} style={{ color }} strokeWidth={2} />
            </div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recently added */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--text3)' }}>Recently Added</p>
            <h2 className="text-2xl font-bold">Fresh in the vault</h2>
          </div>
          <button onClick={() => onNavigate?.('watched')}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'var(--text2)' }}>
            View library <ArrowRight size={14} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border p-14 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="text-5xl mb-3">🎬</div>
            <h3 className="font-semibold mb-1">Your vault is empty</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>Head to Discover to find your first film.</p>
            <button onClick={() => onNavigate?.('discover')} className="btn-gold">Start Discovering</button>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {recent.slice(0, 10).map((m: any) => (
              <div key={m.id} className="movie-card cursor-pointer group">
                <div className="aspect-[2/3] rounded-xl overflow-hidden relative" style={{ background: 'var(--bg3)' }}>
                  {m.poster_url
                    ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                        <span className="text-4xl">{m.type === 'tv' ? '📺' : '🎬'}</span>
                        <span className="text-xs text-center line-clamp-2 font-medium" style={{ color: 'var(--text2)' }}>{m.title}</span>
                      </div>
                  }
                  {/* Status badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {m.status && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold leading-tight"
                        style={{
                          background: m.status === 'watched' ? 'rgba(20,184,166,0.9)' : m.status === 'watchlist' ? 'rgba(124,106,240,0.9)' : 'rgba(248,113,113,0.9)',
                          color: m.status === 'watched' ? '#060d1f' : 'white',
                        }}>
                        {m.status === 'watched' ? 'Watched' : m.status === 'watchlist' ? 'Watchlist' : '★'}
                      </span>
                    )}
                    {m.type === 'tv' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold leading-tight" style={{ background: 'rgba(79,142,247,0.9)', color: 'white' }}>TV</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 px-0.5">
                  <h3 className="text-xs font-semibold truncate">{m.title}</h3>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{m.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
