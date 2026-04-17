'use client';
import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastMsg { id: number; text: string; type: 'success' | 'error' | 'info'; }

export function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const toast = useCallback((text: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, text, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  return { toasts, toast, dismiss };
}

export function ToastContainer({ toasts, dismiss }: { toasts: ToastMsg[]; dismiss: (id: number) => void }) {
  const styles: Record<string, string> = {
    success: 'bg-[#0a2a20] border-[var(--teal)] text-[var(--teal)]',
    error:   'bg-[#2a0a0e] border-[var(--red)] text-[var(--red)]',
    info:    'bg-[#0a1a35] border-[var(--blue)] text-[var(--blue)]',
  };
  const icons = {
    success: CheckCircle,
    error:   XCircle,
    info:    Info,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl pointer-events-auto animate-toast-in min-w-[240px] ${styles[t.type]}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 text-[var(--text)]">{t.text}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
