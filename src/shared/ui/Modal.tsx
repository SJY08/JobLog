import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

/**
 * @description 모달 컴포넌트
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-md'
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40" onMouseDown={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-t-xl border border-line bg-surface shadow-pop sm:rounded-xl`}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
          <div>
            <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{description}</p>}
          </div>
          <IconButton label="닫기" size="sm" onClick={onClose}>
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        {children && <div className="px-5 pb-2 sm:px-6">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 px-5 pb-5 pt-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}
