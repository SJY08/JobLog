import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/**
 * @description 페이지네이션 컴포넌트
 */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav aria-label="페이지" className="mt-6 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <React.Fragment key={p}>
            {gap && (
              <span className="px-1 text-2xs text-mute" aria-hidden="true">
                …
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-[13px] tabular-nums transition-colors duration-150 ease-out ${
                p === page ? 'bg-primary font-semibold text-white' : 'text-graphite hover:bg-hover hover:text-ink'
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
