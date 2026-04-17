'use client';
import { useState, useEffect, useCallback } from 'react';
import { Tv, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';

interface Props { user: any; token: string; }
const STATUS_TABS = ['all', 'watching', 'completed', 'paused', 'dropped'];
const STATUS_LABELS: Record<string, string> = { all: 'All', watching: 'Watching', completed: 'Completed', paused: 'Paused', dropped: 'Dropped' };
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  watching:  { bg: 'rgba(79,142,247,0.15)',  color: 'var(--blue)' },
  completed: { bg: 'rgba(20,184,166,0.15)',  color: 'var(--teal)' },
  paused:    { bg: 'rgba(245,197,24,0.15)',  color: 'var(--gold)' },
  dropped:   { bg: 'rgba(230,57,70,0.15)',   color: 'var(--red)' },
};

export default function TVSeries({ user, token }: Props) {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toasts, toast, dismiss } = useToast();

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    try {
      const q = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/tv${q}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSeries((await res.json()).series || []);
    } catch { /* silent */ }
    setLoading(false);
  }, [statusFilter, token]);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const updateStatus = async (seriesId: number, tv_status: string) => {
    await fetch('/api/tv', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ series_id: seriesId, tv_status }),
    });
    toast('Status updated', 'success');
    fetchSeries();
  };

  const updateEpisode = async (seriesId: number, field: 'current_season' | 'current_episode', delta: number, current: number) => {
    const newVal = Math.max(1, current + delta);
    await fetch('/api/tv', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ series_id: seriesId, [field]: newVal }),
    });
    setSeries(prev => prev.map(s => s.id === seriesId ? { ...s, [field]: newVal } : s));
  };

  const remove = async (seriesId: number, title: string) => {
    await fetch(`/api/tv?seriesId=${seriesId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast(`${title} removed`, 'info');
    fetchSeries();
  };

  const SeriesCard = ({ s }: { s: any }) => {
    const sc = STATUS_COLORS[s.tv_status] || STATUS_COLORS.watching;
    return (
      <div className="rounded-2xl border p-5 group" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: 'var(--bg3)' }}>📺</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{s.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {s.year && <span className="text-xs" style={{ color: 'var(--text3)' }}>{s.year}</span>}
                  {s.genre_text && <span className="text-xs" style={{ color: 'var(--text3)' }}>{s.genre_text}</span>}
                </div>
              </div>
              <button onClick={() => remove(s.id, s.title)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
            </div>

            {/* Status badge + selector */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}>
                {STATUS_LABELS[s.tv_status] || s.tv_status}
              </span>
              <select
                value={s.tv_status}
                onChange={e => updateStatus(s.id, e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
                style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
                {STATUS_TABS.filter(t => t !== 'all').map(t => <option key={t} value={t}>{STATUS_LABELS[t]}</option>)}
              </select>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--text3)' }}>S</span>
                <button onClick={() => updateEpisode(s.id, 'current_season', -1, s.current_season || 1)} className="p-0.5 rounded" style={{ color: 'var(--text2)' }}><ChevronDown size={12} /></button>
                <span className="text-sm font-semibold w-6 text-center">{s.current_season || 1}</span>
                <button onClick={() => updateEpisode(s.id, 'current_season', 1, s.current_season || 1)} className="p-0.5 rounded" style={{ color: 'var(--text2)' }}><ChevronUp size={12} /></button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--text3)' }}>EP</span>
                <button onClick={() => updateEpisode(s.id, 'current_episode', -1, s.current_episode || 1)} className="p-0.5 rounded" style={{ color: 'var(--text2)' }}><ChevronDown size={12} /></button>
                <span className="text-sm font-semibold w-6 text-center">{s.current_episode || 1}</span>
                <button onClick={() => updateEpisode(s.id, 'current_episode', 1, s.current_episode || 1)} className="p-0.5 rounded" style={{ color: 'var(--text2)' }}><ChevronUp size={12} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2"><Tv size={28} style={{ color: 'var(--blue)' }} /> TV Series</h1>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>Track your shows season by season.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_TABS.map(t => (
          <button key={t} className={`pill-btn ${statusFilter === t ? 'active' : ''}`} onClick={() => setStatusFilter(t)}>
            {STATUS_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--bg3)' }} />)}
        </div>
      ) : series.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <Tv size={48} className="mx-auto mb-3 opacity-30" />
          <h3 className="font-semibold mb-1">No TV series yet</h3>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Search for shows in Discover and add them here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {series.map(s => <SeriesCard key={s.id} s={s} />)}
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
