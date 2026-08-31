import { RotateCcwIcon, SearchIcon } from 'lucide-react';
import { APPLY_STATUSES, PLATFORMS, POSTING_STATUSES, type Platform } from '@/entities/application';
import { SIDO_LIST, shortSido } from '@/entities/region';
import { DatePicker, SelectInput } from '@/shared/ui';
import { EMPTY_FILTERS, type Filters } from '../model/types';

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  counts: Record<Platform | 'all', number>;
}

const LABEL = 'mb-1.5 block text-2xs font-medium text-mute';

/**
 * @description 지원 내역 필터 컴포넌트
 */
export function FilterBar({ filters, onChange, counts }: FilterBarProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <section aria-label="지원 내역 필터" className="border-y border-line py-5">
      <div className="thin-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {[{ value: 'all' as const, label: '전체' }, ...PLATFORMS].map((p) => {
          const active = filters.platform === p.value;
          return (
            <button
              key={p.value}
              type="button"
              aria-pressed={active}
              onClick={() => set('platform', p.value as Filters['platform'])}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] transition-colors duration-150 ease-out ${
                active
                  ? 'border-primary bg-primarySoft font-semibold text-primary'
                  : 'border-line bg-surface text-graphite hover:bg-hover'
              }`}
            >
              {p.label}
              <span className="tabular-nums text-2xs text-mute">{counts[p.value as Platform | 'all'] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-4">
        <div className="min-w-55 flex-1">
          <label htmlFor="filter-keyword" className={LABEL}>
            검색
          </label>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
              aria-hidden="true"
            />
            <input
              id="filter-keyword"
              value={filters.keyword}
              onChange={(e) => set('keyword', e.target.value)}
              placeholder="회사명 · 포지션"
              className="h-11 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-mute/70 transition-colors duration-150 ease-out hover:bg-hover focus:bg-surface focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="w-31">
          <label htmlFor="filter-posting" className={LABEL}>
            공고상태
          </label>
          <SelectInput
            id="filter-posting"
            value={filters.posting}
            onChange={(e) => set('posting', e.target.value as Filters['posting'])}
          >
            <option value="all">전체</option>
            {POSTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="w-34">
          <label htmlFor="filter-apply" className={LABEL}>
            지원상태
          </label>
          <SelectInput
            id="filter-apply"
            value={filters.apply}
            onChange={(e) => set('apply', e.target.value as Filters['apply'])}
          >
            <option value="all">전체</option>
            {APPLY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="w-28">
          <label htmlFor="filter-viewed" className={LABEL}>
            열람여부
          </label>
          <SelectInput
            id="filter-viewed"
            value={filters.viewed}
            onChange={(e) => set('viewed', e.target.value as Filters['viewed'])}
          >
            <option value="all">전체</option>
            <option value="viewed">열람</option>
            <option value="unviewed">미열람</option>
          </SelectInput>
        </div>

        <div className="w-31">
          <label htmlFor="filter-sido" className={LABEL}>
            지역
          </label>
          <SelectInput id="filter-sido" value={filters.sido} onChange={(e) => set('sido', e.target.value)}>
            <option value="all">전체</option>
            {SIDO_LIST.map((s) => (
              <option key={s} value={s}>
                {shortSido(s)}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="flex items-end gap-2">
          <div className="w-37.5">
            <label htmlFor="filter-from" className={LABEL}>
              지원일 시작
            </label>
            <DatePicker
              id="filter-from"
              value={filters.from}
              onChange={(v) => set('from', v)}
              max={filters.to || undefined}
              placeholder="시작일"
              allowClear
            />
          </div>
          <span className="pb-3 text-mute" aria-hidden="true">
            –
          </span>
          <div className="w-37.5">
            <label htmlFor="filter-to" className={LABEL}>
              지원일 종료
            </label>
            <DatePicker
              id="filter-to"
              value={filters.to}
              onChange={(v) => set('to', v)}
              min={filters.from || undefined}
              placeholder="종료일"
              allowClear
            />
          </div>
        </div>

        {dirty && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="mb-1 inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
            초기화
          </button>
        )}
      </div>
    </section>
  );
}
