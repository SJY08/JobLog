import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useRecords, type Platform } from '@/entities/application';
import { ApplicationList } from '@/widgets/application-list';
import { Pagination } from '@/widgets/pagination';
import { EMPTY_FILTERS, FilterBar, type Filters } from '@/widgets/filter-bar';
import { ConfirmDialog } from '@/widgets/confirm-dialog';
import { Button } from '@/shared/ui';

const PAGE_SIZE = 10;

/**
 * @description 지원 기록을 목록으로 보여주는 페이지
 */
export function ApplicationsPage() {
  const { applications, removeApplications } = useRecords();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const base: Record<Platform | 'all', number> = {
      all: applications.length,
      jobkorea: 0,
      wanted: 0,
      rallit: 0,
      etc: 0
    };
    applications.forEach((a) => {
      if (a.platform) base[a.platform] += 1;
    });
    return base;
  }, [applications]);

  const rows = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    return applications
      .filter((a) => {
        if (filters.platform !== 'all' && a.platform !== filters.platform) return false;
        if (filters.posting !== 'all' && a.postingStatus !== filters.posting) return false;
        if (filters.apply !== 'all' && a.applyStatus !== filters.apply) return false;
        if (filters.viewed === 'viewed' && !a.viewed) return false;
        if (filters.viewed === 'unviewed' && a.viewed) return false;
        if (filters.sido !== 'all' && a.region?.sido !== filters.sido) return false;
        if (filters.from && a.appliedAt < filters.from) return false;
        if (filters.to && a.appliedAt > filters.to) return false;
        if (kw && !`${a.company} ${a.position}`.toLowerCase().includes(kw)) return false;
        return true;
      })
      .sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : a.appliedAt > b.appliedAt ? -1 : 0));
  }, [applications, filters]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const waiting = applications.filter((a) => a.applyStatus === '지원완료' || a.applyStatus === '서류합격').length;
    const unviewed = applications.filter((a) => !a.viewed).length;
    const passed = applications.filter((a) => a.applyStatus === '최종합격').length;
    return { waiting, unviewed, passed };
  }, [applications]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    const ids = pageRows.map((r) => r.id);
    const allChecked = ids.length > 0 && ids.every((id) => selected.includes(id));
    setSelected(
      allChecked ? selected.filter((id) => !ids.includes(id)) : [...selected.filter((id) => !ids.includes(id)), ...ids]
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">취업활동 기록</h1>
          <p className="mt-2 text-[13px] text-mute">
            전체 <span className="tabular-nums text-graphite">{applications.length}</span>건 · 결과 대기{' '}
            <span className="tabular-nums text-graphite">{stats.waiting}</span>건 · 미열람{' '}
            <span className="tabular-nums text-graphite">{stats.unviewed}</span>건 · 최종합격{' '}
            <span className="tabular-nums text-success">{stats.passed}</span>건
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/applications/new')}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          새 지원 기록
        </Button>
      </div>

      <div className="mt-5">
        <FilterBar filters={filters} onChange={setFilters} counts={counts} />
      </div>

      <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 py-3">
        <p className="text-2xs text-mute">
          {rows.length === applications.length
            ? `${rows.length}건 · ${page}/${totalPages} 페이지`
            : `조건에 맞는 ${rows.length}건 / 전체 ${applications.length}건 · ${page}/${totalPages} 페이지`}
        </p>
        {selected.length > 0 && (
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-graphite">
              <span className="tabular-nums">{selected.length}</span>건 선택됨
            </span>
            <Button variant="danger" size="sm" onClick={() => setPendingDelete(selected)}>
              <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              선택 삭제
            </Button>
            <button
              type="button"
              onClick={() => setSelected([])}
              aria-label="선택 해제"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {pageRows.length > 0 ? (
        <>
          <ApplicationList
            rows={pageRows}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            onDelete={(id) => setPendingDelete([id])}
          />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="border-t border-line py-20 text-center">
          <p className="text-[15px] font-semibold text-ink">
            {applications.length === 0 ? '아직 기록이 없습니다.' : '조건에 맞는 기록이 없습니다.'}
          </p>
          <p className="mx-auto mt-2 max-w-[42ch] text-[13px] leading-relaxed text-mute">
            {applications.length === 0 ? '오늘 지원한 공고 하나부터 남겨보세요.' : '필터를 조금 넓히거나 조건을 초기화해 보세요.'}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`${pendingDelete?.length ?? 0}건의 지원 기록을 삭제할까요?`}
        description="삭제한 기록은 되돌릴 수 없습니다. 열람 여부와 메모도 함께 지워집니다."
        onConfirm={() => {
          if (pendingDelete) {
            removeApplications(pendingDelete);
            setSelected((prev) => prev.filter((id) => !pendingDelete.includes(id)));
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
