'use client';
import { useState, useEffect } from 'react';
import { Film, Clock, Heart, Bookmark, Star, TrendingUp } from 'lucide-react';

interface Props { user: { id: number; email: string; name?: string }; token: string; }

export default function Dashboard({ user, token }: Props) {
  const [stats, setStats] = useState({ totalMovies: 0, watched: 0, watchlist: 0, favorites: 0, totalHours: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        fetch('/api/movies/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/movies/recent', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (rRes.ok) setRecent((await rRes.json()).movies || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const STAT_CARDS = [
    { label: 'Total in Library', value: stats.totalMovies, icon: Film, color: 'var(--blue)', bg: 'rgba(79,142,247,0.12)' },
    { label: 'Films Watched', value: stats.watched, icon: Clock, color: 'var(--teal)', bg: 'rgba(20,184,166,0.12)' },
    { label: 'Watchlist', value: stats.watchlist, icon: Bookmark, color: 'var(--purple)', bg: 'rgba(124,106,240,0.12)' },
    { label: 'Favorites', value: stats.favorites, icon: Heart, color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 rounded-xl w-1/3" style={{ background: 'var(--bg3)' }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--bg3)' }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{greeting()}, {user.name || 'Cinephile'}.</h1>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>Here's your cinema universe at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card rounded-2xl p-5 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold mb-0.5">{value}</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Hours banner */}
      {stats.totalHours > 0 && (
        <div className="rounded-2xl p-5 mb-8 flex items-center gap-4 border" style={{ background: 'rgba(245,197,24,0.06)', borderColor: 'rgba(245,197,24,0.2)' }}>
          <TrendingUp size={24} style={{ color: 'var(--gold)' }} />
          <div>
            <p className="font-semibold" style={{ color: 'var(--gold)' }}>{stats.totalHours} hours of cinema</p>
            <p className="text-xs" style={{ color: 'var(--text2)' }}>That's {Math.floor(stats.totalHours / 24)} days spent in your cinema universe.</p>
          </div>
        </div>
      )}

      {/* Recently added */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>Recently Added</span>
          <span className="text-sm font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>{recent.length}</span>
        </h2>

        {recent.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="text-5xl mb-3">🎬</div>
            <h3 className="font-semibold mb-1">Your library is empty</h3>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Head to Discover to find your first film.</p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {recent.slice(0, 10).map((m: any) => (
              <div key={m.id} className="movie-card group cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 relative"
                  style={{ background: 'var(--bg3)' }}>
                  {m.poster_url ? (
                    <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <span className="text-3xl">{m.type === 'tv' ? '📺' : '🎬'}</span>
                      <span className="text-xs text-center px-1 line-clamp-2" style={{ color: 'var(--text3)' }}>{m.title}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium truncate">{m.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {m.rating && <><Star size={10} style={{ color: 'var(--gold)' }} /><span className="text-xs" style={{ color: 'var(--text3)' }}>{Number(m.rating).toFixed(1)}</span></>}
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>{m.year && `• ${m.year}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
