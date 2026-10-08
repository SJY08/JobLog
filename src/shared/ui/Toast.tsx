import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';

type ToastTone = 'success' | 'error';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const DURATION = 2800;

/**
 * @description 토스트 알림 프로바이더 컴포넌트
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback((tone: ToastTone, message: string) => {
    seq.current += 1;
    const id = seq.current;
    setItems((prev) => [...prev.slice(-2), { id, tone, message }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), DURATION);
  }, []);

  const value = useMemo(
    () => ({
      success: (message: string) => push('success', message),
      error: (message: string) => push('error', message)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-70 flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+20px)]"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="toast-in pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg bg-ink px-4 py-3 text-[13px] font-medium text-bg shadow-pop"
          >
            {t.tone === 'success' ? (
              <CheckCircle2Icon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <AlertCircleIcon className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * @description 토스트 알림을 띄우는 훅
 */
export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
