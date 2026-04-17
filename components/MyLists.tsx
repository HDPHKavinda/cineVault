'use client';
import { useState, useEffect, useCallback } from 'react';
import { List, Plus, Trash2, X } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';

interface Props { user: any; token: string; }

export default function MyLists({ user, token }: Props) {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const { toasts, toast, dismiss } = useToast();

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lists', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLists((await res.json()).lists || []);
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (res.ok) {
        toast(`"${newName}" created`, 'success');
        setNewName('');
        setNewDesc('');
        setShowCreate(false);
        fetchLists();
      }
    } catch { toast('Failed to create list', 'error'); }
    setCreating(false);
  };

  const deleteList = async (listId: number, name: string) => {
    await fetch(`/api/lists?listId=${listId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast(`"${name}" deleted`, 'info');
    fetchLists();
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2"><List size={28} style={{ color: 'var(--gold)' }} /> My Lists</h1>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Custom collections of your favourite films.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> New List
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl border p-6 animate-slide-up"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Create New List</h2>
              <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text2)' }}><X size={18} /></button>
            </div>
            <form onSubmit={createList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>List Name</label>
                <input className="cv-input" placeholder="e.g. Saturday Night Picks" value={newName}
                  onChange={e => setNewName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>Description (optional)</label>
                <input className="cv-input" placeholder="A short description…" value={newDesc}
                  onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={creating} className="btn-gold flex-1">{creating ? 'Creating…' : 'Create List'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--bg3)' }} />)}
        </div>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <List size={48} className="mx-auto mb-3 opacity-30" />
          <h3 className="font-semibold mb-1">No lists yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>Create themed collections — date night picks, classics, hidden gems…</p>
          <button onClick={() => setShowCreate(true)} className="btn-gold inline-flex items-center gap-2"><Plus size={15} /> Create First List</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map(l => (
            <div key={l.id} className="movie-card rounded-2xl border p-5 group" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{l.emoji || '🎬'}</span>
                  <div>
                    <h3 className="font-semibold">{l.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>{l.item_count || 0} films</p>
                  </div>
                </div>
                <button onClick={() => deleteList(l.id, l.name)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity btn-danger">
                  <Trash2 size={13} />
                </button>
              </div>

              {l.description && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text2)' }}>{l.description}</p>
              )}

              {/* Preview thumbnails */}
              {l.preview_items?.length > 0 ? (
                <div className="flex gap-1.5">
                  {l.preview_items.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="w-12 h-16 rounded-lg overflow-hidden flex items-center justify-center text-xl" style={{ background: 'var(--bg3)' }}>
                      {item.poster_url ? <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" /> : (item.type === 'tv' ? '📺' : '🎬')}
                    </div>
                  ))}
                  {l.item_count > 4 && (
                    <div className="w-12 h-16 rounded-lg flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                      +{l.item_count - 4}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--text3)' }}>Empty — add films from your library</p>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
