'use client';
import { useState } from 'react';

interface AuthProps { onLogin: (user: any, token: string) => void; }

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) onLogin(data.user, data.token);
      else setError(data.error || 'Something went wrong');
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.06]" style={{ background: 'var(--blue)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-[0.07]" style={{ background: 'var(--gold)' }} />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎬</div>
          <h1 className="text-4xl font-bold">Cine<span style={{ color: 'var(--gold)' }}>Vault</span></h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text2)' }}>Your personal cinema universe</p>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'var(--bg3)' }}>
            {([['Sign In', true], ['Sign Up', false]] as const).map(([label, mode]) => (
              <button key={label} onClick={() => setIsLogin(mode)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{ background: isLogin === mode ? 'var(--gold)' : 'transparent', color: isLogin === mode ? '#060d1f' : 'var(--text2)' }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'var(--text3)' }}>Display Name</label>
                <input className="cv-input" type="text" placeholder="Your name"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'var(--text3)' }}>Email</label>
              <input className="cv-input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'var(--text3)' }}>Password</label>
              <input className="cv-input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            {error && (
              <div className="text-sm text-center py-2 px-3 rounded-lg" style={{ color: 'var(--red)', background: 'rgba(230,57,70,0.1)' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full mt-1">
              {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
