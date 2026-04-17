'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, Film, Clock, Heart, List, Star } from 'lucide-react';

interface User { id: number; email: string; name?: string; avatar_url?: string; }
interface Stats {
  totalMovies: number; watched: number; watchlist: number;
  favorites: number; totalHours: number;
}

export default function Profile({ user }: { user: User }) {
  const [stats, setStats] = useState<Stats>({ totalMovies: 0, watched: 0, watchlist: 0, favorites: 0, totalHours: 0 });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/movies/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
      .catch(console.error);
  }, [user.id]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center">
          <UserIcon className="mr-3" size={32} /> Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--gold)] flex items-center justify-center mx-auto mb-4">
            <UserIcon size={40} className="text-[var(--navy-dark)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text)]">{user.name || 'Movie Lover'}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">{user.email}</p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { icon: Film, label: 'Total Movies', value: stats.totalMovies, color: 'bg-blue-500' },
            { icon: Clock, label: 'Hours Watched', value: stats.totalHours, color: 'bg-purple-500' },
            { icon: Star, label: 'Watched', value: stats.watched, color: 'bg-green-500' },
            { icon: Heart, label: 'Favorites', value: stats.favorites, color: 'bg-red-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">{label}</p>
                <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
