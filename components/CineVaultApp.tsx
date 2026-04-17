'use client';

import { useState, useEffect } from 'react';
import { Film, Search, Heart, Clock, List, User, Settings, Moon, Sun, Menu, X } from 'lucide-react';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import Discover from '@/components/Discover';
import Watched from '@/components/Watched';
import Watchlist from '@/components/Watchlist';
import Favorites from '@/components/Favorites';
import TVSeries from '@/components/TVSeries';
import MyLists from '@/components/MyLists';
import Profile from '@/components/Profile';
import SettingsPage from '@/components/SettingsPage';

type Page = 'dashboard' | 'discover' | 'watched' | 'watchlist' | 'favorites' | 'tv' | 'lists' | 'profile' | 'settings';

interface User {
  id: number;
  email: string;
  name?: string;
  avatar_url?: string;
}

export default function CineVaultApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and set user
      validateToken(token);
    } else {
      setLoading(false);
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const validateToken = async (token: string) => {
    try {
      // In a real app, you'd validate the token with your backend
      const response = await fetch('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('authToken');
    }
    setLoading(false);
  };

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navigation = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Film },
    { id: 'discover' as Page, label: 'Discover', icon: Search },
    { id: 'watched' as Page, label: 'Watched', icon: Clock },
    { id: 'watchlist' as Page, label: 'Watchlist', icon: List },
    { id: 'favorites' as Page, label: 'Favorites', icon: Heart },
    { id: 'tv' as Page, label: 'TV Series', icon: Film },
    { id: 'lists' as Page, label: 'My Lists', icon: List },
    { id: 'profile' as Page, label: 'Profile', icon: User },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gold)]"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'discover':
        return <Discover user={user} />;
      case 'watched':
        return <Watched user={user} />;
      case 'watchlist':
        return <Watchlist user={user} />;
      case 'favorites':
        return <Favorites user={user} />;
      case 'tv':
        return <TVSeries user={user} />;
      case 'lists':
        return <MyLists user={user} />;
      case 'profile':
        return <Profile user={user} />;
      case 'settings':
        return <SettingsPage user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--navy)] border border-[var(--border)]"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--navy)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[var(--border)]">
            <h1 className="text-2xl font-bold text-[var(--gold)]">CineVault</h1>
            <p className="text-sm text-[var(--text-muted)]">Web Edition</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-[var(--gold)] text-[var(--navy-dark)]'
                      : 'text-[var(--text)] hover:bg-[var(--navy-light)]'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Theme toggle and user info */}
          <div className="p-4 border-t border-[var(--border)]">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 rounded-lg text-[var(--text)] hover:bg-[var(--navy-light)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <div className="mt-4 p-3 rounded-lg bg-[var(--navy-light)]">
              <p className="text-sm font-medium">{user.name || user.email}</p>
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] mt-1"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        <main className="min-h-screen">
          {renderPage()}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}