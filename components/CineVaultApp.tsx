'use client';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Compass, Clock, Bookmark, Heart, Tv,
  List, User, Settings, Menu, X, LogOut, CheckCircle
} from 'lucide-react';
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
interface CvUser { id: number; email: string; name?: string; }

const NAV = [
  { section: 'Main', items: [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover' as Page, label: 'Discover', icon: Compass },
  ]},
  { section: 'Library', items: [
    { id: 'watched' as Page, label: 'Watched', icon: CheckCircle },
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

  const handleLogin = (u: CvUser, token: string) => {
    setUser(u);
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    setPage('dashboard');
  };

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
  const initials = (u: CvUser) => (u.name || u.email).slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center space-y-4">
          <p className="text-3xl font-bold">Cine<span style={{ color: 'var(--gold)' }}>Vault</span></p>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  const renderPage = () => {
    const props = { user, token };
    switch (page) {
      case 'dashboard': return <Dashboard {...props} onNavigate={navigate} />;
      case 'discover': return <Discover {...props} />;
      case 'watched': return <Watched {...props} />;
      case 'watchlist': return <Watchlist {...props} />;
      case 'favorites': return <Favorites {...props} />;
      case 'tv': return <TVSeries {...props} />;
      case 'lists': return <MyLists {...props} />;
      case 'profile': return <Profile {...props} />;
      case 'settings': return <SettingsPage {...props} onLogout={handleLogout} />;
      default: return <Dashboard {...props} onNavigate={navigate} />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ width: 232 }}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-2xl">🎬</span>
        <div>
          <h1 className="text-lg font-bold leading-none tracking-tight">
            Cine<span style={{ color: 'var(--gold)' }}>Vault</span>
          </h1>
          <p className="text-[10px] mt-0.5 font-medium tracking-widest uppercase" style={{ color: 'var(--text3)' }}>
            Web Edition
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="px-2 mb-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text3)' }}>
              {section}
            </p>
            {items.map(({ id, label, icon: Icon }) => {
              const active = page === id;
              return (
                <button key={id} onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all border-l-[3px] ${active ? 'nav-active' : 'border-transparent hover:bg-white/5'}`}
                  style={{ color: active ? 'var(--gold)' : 'var(--text2)' }}>
                  <Icon size={16} className="shrink-0" strokeWidth={active ? 2.5 : 1.75} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,var(--blue),var(--purple))', color: 'white' }}>
            {initials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.name || 'Cinema Lover'}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text3)' }}>Neon synced</p>
          </div>
          <button onClick={handleLogout} title="Sign out" className="p-1 rounded-lg transition-colors hover:text-red-400" style={{ color: 'var(--text3)' }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r"
        style={{ width: 232, background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="flex flex-col border-r" style={{ width: 232, background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
            <SidebarContent />
          </aside>
          <div className="flex-1" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile menu btn */}
      <button onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <Menu size={18} />
      </button>

      {/* Main content */}
      <main className="flex-1 md:ml-[232px] min-h-screen overflow-x-hidden">
        {renderPage()}
      </main>
    </div>
  );
}
