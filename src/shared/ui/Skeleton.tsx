/**
 * @description 로딩 중 자리를 잡아두는 스켈레톤 컴포넌트
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded bg-line-soft ${className}`} />;
}

/**
 * @description 목록 로딩 스켈레톤 컴포넌트
 */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" className="border-t border-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-line-soft px-3 py-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2.5 h-4 w-56 max-w-full" />
          <Skeleton className="mt-2.5 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
