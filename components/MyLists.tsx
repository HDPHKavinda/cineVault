'use client';

import { List } from 'lucide-react';

interface User { id: number; email: string; name?: string; }

export default function MyLists({ user }: { user: User }) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center">
          <List className="mr-3" size={32} /> My Lists
        </h1>
        <p className="text-[var(--text-muted)]">Create and manage custom movie lists.</p>
      </div>
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
        <List size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">Custom Lists Coming Soon</h3>
        <p className="text-[var(--text-muted)]">Create themed collections of your favorite movies.</p>
      </div>
    </div>
  );
}
