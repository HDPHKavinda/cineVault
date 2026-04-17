'use client';
import { useState, useEffect } from 'react';
import { Film, Clock, Heart, Bookmark, Star, TrendingUp } from 'lucide-react';

interface Props { user: { id: number; email: string; name?: string; avatar_url?: string }; token: string; }

export default function Profile({ user, token }: Props) {
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
    });
  }, [token]);

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  const STATS = [
    { label: 'Films Watched', value: stats.watched, icon: Clock, color: 'var(--teal)', bg: 'rgba(20,184,166,0.12)' },
    { label: 'Total Hours', value: stats.totalHours, icon: TrendingUp, color: 'var(--gold)', bg: 'rgba(245,197,24,0.12)' },
    { label: 'Favorites', value: stats.favorites, icon: Heart, color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    { label: 'Watchlist', value: stats.watchlist, icon: Bookmark, color: 'var(--purple)', bg: 'rgba(124,106,240,0.12)' },
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-1/4 rounded-xl" style={{ background: 'var(--bg3)' }} />
          <div className="h-40 rounded-2xl" style={{ background: 'var(--bg3)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {/* Avatar + info */}
      <div className="rounded-2xl border p-6 mb-6 flex items-center gap-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: 'white' }}>
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.name || 'Cinema Lover'}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{user.email}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star size={13} style={{ color: 'var(--gold)' }} />
            <span className="text-xs" style={{ color: 'var(--text2)' }}>CineVault Member</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="p-2.5 rounded-xl w-fit mb-3" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Cinema time bar */}
      <div className="rounded-2xl border p-5 mb-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={16} style={{ color: 'var(--gold)' }} /> Cinema Time
        </h3>
        <div className="flex items-end gap-4">
          <div>
            <span className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>{stats.totalHours}</span>
            <span className="text-sm ml-1" style={{ color: 'var(--text2)' }}>hours</span>
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text2)' }}>
            {stats.totalHours >= 24
              ? `That's ${Math.floor(stats.totalHours / 24)} days and ${stats.totalHours % 24} hours of cinema`
              : `Keep watching to grow your cinema time!`}
          </p>
        </div>
        {stats.watched > 0 && (
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (stats.watched / Math.max(stats.totalMovies, 1)) * 100)}%`, background: 'linear-gradient(90deg, var(--teal), var(--blue))' }} />
          </div>
        )}
      </div>

      {/* Recently watched */}
      {recent.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Recently Added</h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {recent.slice(0, 8).map((m: any) => (
              <div key={m.id} className="movie-card cursor-pointer">
                <div className="aspect-[2/3] rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'var(--bg3)' }}>
                  {m.poster_url
                    ? <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
                    : <span className="text-3xl">{m.type === 'tv' ? '📺' : '🎬'}</span>}
                </div>
                <p className="text-xs truncate mt-1.5 font-medium">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
