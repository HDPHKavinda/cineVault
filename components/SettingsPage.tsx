'use client';

import { useState } from 'react';
import { Settings, Key, Save } from 'lucide-react';

interface User { id: number; email: string; name?: string; }

export default function SettingsPage({ user, onLogout }: { user: User; onLogout?: () => void }) {
  const [tmdbKey, setTmdbKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tmdbApiKey: tmdbKey }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center">
          <Settings className="mr-3" size={32} /> Settings
        </h1>
        <p className="text-[var(--text-muted)]">Manage your account and API keys.</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center">
            <Key size={18} className="mr-2" /> API Keys
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                TMDB API Key
              </label>
              <input
                type="password"
                value={tmdbKey}
                onChange={e => setTmdbKey(e.target.value)}
                placeholder="Enter your TMDB API key"
                className="w-full px-3 py-2 bg-[var(--navy)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--gold)] text-[var(--text)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Get your free key at themoviedb.org/settings/api
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[var(--gold)] text-[var(--navy-dark)] rounded-lg font-medium hover:bg-[var(--gold-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </button>
          </form>
        </div>

        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-bold text-[var(--text)] mb-2">Account</h2>
          <p className="text-[var(--text-muted)] text-sm">Email: {user.email}</p>
          <p className="text-[var(--text-muted)] text-sm">Name: {user.name || '—'}</p>
        </div>
      </div>
    </div>
  );
}
