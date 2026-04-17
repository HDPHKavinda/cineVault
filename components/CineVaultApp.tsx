'use client';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Compass, Clock, Bookmark, Heart, Tv, List, User, Settings, Menu, X, LogOut } from 'lucide-react';
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
interface CvUser { id: number; email: string; name?: string; avatar_url?: string; }

const NAV = [
  { section: 'Main', items: [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover' as Page, label: 'Discover', icon: Compass },
  ]},
  { section: 'Library', items: [
    { id: 'watched' as Page, label: 'Watched', icon: Clock },
    { id: 'watchlist' as Page, label: 'Watchlist', icon: Bookmark },
    { id: 'favorites' as Page, label: 'Favorites', icon: Heart },
    { id: 'tv' as Page, label: 'TV Series', icon: Tv },
  ]},
  { section: 'Organize', items: [
    { id: 'lists' as Page, label: 'My Lists', icon: List },
  ]},
  { section: 'Account', items: [
    { id: 'profile' as Page, label: 'Profile', icon: User },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ]},
];

export default function CineVaultApp() {
  const [page, setPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<CvUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) validateToken(token);
    else setLoading(false);
  }, []);

  const validateToken = async (token: string) => {
    try {
      const res = await fetch('/api/auth/validate', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUser((await res.json()).user);
      else localStorage.removeItem('authToken');
    } catch { localStorage.removeItem('authToken'); }
    setLoading(false);
  };

  const handleLogin = (userData: CvUser, token: string) => {
    setUser(userData);
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    setPage('dashboard');
  };

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };

  const initials = (u: CvUser) => (u.name || u.email).slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎬</div>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  const renderPage = () => {
    const props = { user, token: localStorage.getItem('authToken') || '' };
    switch (page) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'discover': return <Discover {...props} />;
      case 'watched': return <Watched {...props} />;
      case 'watchlist': return <Watchlist {...props} />;
      case 'favorites': return <Favorites {...props} />;
      case 'tv': return <TVSeries {...props} />;
      case 'lists': return <MyLists {...props} />;
      case 'profile': return <Profile {...props} />;
      case 'settings': return <SettingsPage {...props} onLogout={handleLogout} />;
      default: return <Dashboard {...props} />;
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <span className="text-2xl">🎬</span>
        <div>
          <h1 className="text-xl font-bold leading-none">
            Cine<span style={{ color: 'var(--gold)' }}>Vault</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>Web Edition</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section} className="mb-5">
            <p className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text3)' }}>{section}</p>
            {items.map(({ id, label, icon: Icon }) => {
              const active = page === id;
              return (
                <button key={id} onClick={() => navigate(id)}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all border-l-[3px] ${active ? 'nav-active' : 'border-transparent'}`}
                  style={{ color: active ? 'var(--gold)' : 'var(--text2)' }}>
                  <Icon size={17} className="shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'var(--gold)', color: '#060d1f' }}>
            {initials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'Movie Lover'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>{user.email}</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
            style={{ color: 'var(--text3)' }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[232px] shrink-0 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-[232px] h-full">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile menu button */}
      <button onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <Menu size={20} />
      </button>

      {/* Main */}
      <main className="flex-1 md:ml-[232px] min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}
