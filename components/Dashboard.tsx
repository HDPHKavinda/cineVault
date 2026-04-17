'use client';

import { useState, useEffect } from 'react';
import { Film, Clock, Heart, List, Calendar, Star } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface Movie {
  id: number;
  title: string;
  year: number;
  poster_url: string;
  rating: number;
  status?: string;
  added_at: string;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState({
    totalMovies: 0,
    watched: 0,
    watchlist: 0,
    favorites: 0,
    totalHours: 0,
  });
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [statsResponse, recentResponse] = await Promise.all([
        fetch('/api/movies/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/movies/recent', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentMovies(recentData.movies);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 hover:bg-[var(--card-hover)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-sm">{label}</p>
          <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--navy)] rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--navy)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          {getGreeting()}, {user.name || 'Movie Lover'}!
        </h1>
        <p className="text-[var(--text-muted)]">
          Here's what's happening with your movie collection.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Film}
          label="Total Movies"
          value={stats.totalMovies}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          label="Watched"
          value={stats.watched}
          color="bg-green-500"
        />
        <StatCard
          icon={List}
          label="Watchlist"
          value={stats.watchlist}
          color="bg-yellow-500"
        />
        <StatCard
          icon={Heart}
          label="Favorites"
          value={stats.favorites}
          color="bg-red-500"
        />
      </div>

      {/* Recent Movies */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
        <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center">
          <Calendar className="mr-2" size={20} />
          Recently Added
        </h2>

        {recentMovies.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <Film size={48} className="mx-auto mb-4 opacity-50" />
            <p>No movies added yet. Start exploring!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentMovies.slice(0, 10).map((movie) => (
              <div key={movie.id} className="group cursor-pointer">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[var(--navy)] mb-2">
                  {movie.poster_url ? (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={32} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-[var(--text)] truncate">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{movie.year}</span>
                  {movie.rating && (
                    <div className="flex items-center">
                      <Star size={12} className="text-yellow-400 mr-1" />
                      {movie.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}