'use client';
import { useState } from 'react';
import { Key, Save, LogOut, Shield, Info } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';

interface Props { user: { id: number; email: string; name?: string }; token: string; onLogout?: () => void; }

export default function SettingsPage({ user, token, onLogout }: Props) {
  const [anthropicKey, setAnthropicKey] = useState('');
  const [displayName, setDisplayName] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const { toasts, toast, dismiss } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tmdbApiKey: anthropicKey }),
      });
      if (res.ok) toast('Settings saved', 'success');
      else toast('Failed to save', 'error');
    } catch { toast('Network error', 'error'); }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>Manage your account and integrations.</p>
      </div>

      <div className="max-w-xl space-y-5">
        {/* Anthropic API Key */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-1 flex items-center gap-2"><Key size={16} style={{ color: 'var(--gold)' }} /> Anthropic API Key</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
            Required for AI-powered movie search in Discover. Get yours at{' '}
            <span style={{ color: 'var(--blue)' }}>console.anthropic.com</span>
          </p>
          <div className="flex flex-col gap-1 p-3 rounded-xl mb-4 border" style={{ background: 'rgba(79,142,247,0.06)', borderColor: 'rgba(79,142,247,0.2)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--blue)' }}>
              <Info size={11} className="inline mr-1" />
              For production: add ANTHROPIC_API_KEY to your Vercel environment variables.
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              The key below is stored in your user preferences in the database.
            </p>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            <input type="password" className="cv-input" placeholder="sk-ant-api03-…"
              value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} />
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
              <Save size={14} />{saving ? 'Saving…' : 'Save Key'}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Shield size={16} style={{ color: 'var(--blue)' }} /> Account</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text2)' }}>Email</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text2)' }}>Display Name</span>
              <span className="text-sm font-medium">{user.name || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm" style={{ color: 'var(--text2)' }}>Data Storage</span>
              <span className="text-sm font-medium" style={{ color: 'var(--teal)' }}>Neon PostgreSQL</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'rgba(230,57,70,0.2)' }}>
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-red-400"><LogOut size={16} /> Sign Out</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
            Your library is safely stored in the cloud. You can sign back in anytime.
          </p>
          <button onClick={onLogout} className="btn-danger flex items-center gap-2">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
