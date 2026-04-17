'use client';

import { Tv } from 'lucide-react';

interface User { id: number; email: string; name?: string; }

export default function TVSeries({ user }: { user: User }) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center">
          <Tv className="mr-3" size={32} /> TV Series
        </h1>
        <p className="text-[var(--text-muted)]">Track your TV shows and series.</p>
      </div>
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
        <Tv size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">TV Series Tracking Coming Soon</h3>
        <p className="text-[var(--text-muted)]">This feature is under construction.</p>
      </div>
    </div>
  );
}
