'use client';

import { Clock } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface WatchedProps {
  user: User;
}

export default function Watched({ user }: WatchedProps) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2 flex items-center">
          <Clock className="mr-3" size={32} />
          Watched Movies
        </h1>
        <p className="text-[var(--text-muted)]">
          Movies you've already seen.
        </p>
      </div>

      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
        <Clock size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">No Watched Movies Yet</h3>
        <p className="text-[var(--text-muted)]">
          Start watching movies and mark them as watched to see them here.
        </p>
      </div>
    </div>
  );
}