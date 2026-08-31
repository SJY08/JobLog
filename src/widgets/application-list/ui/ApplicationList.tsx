import { Link } from 'react-router-dom';
import { CalendarIcon, ExternalLinkIcon, MapPinIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { APPLY_STYLE, PLATFORM_DOT, PLATFORM_LABEL, POSTING_STYLE, type Application } from '@/entities/application';
import { shortSido } from '@/entities/region';
import { dotDate, shortDate } from '@/shared/lib';
import { IconButton } from '@/shared/ui';

interface ApplicationListProps {
  rows: Application[];
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (id: string) => void;
}

/**
 * @description 지원 기록 목록 컴포넌트
 */
export function ApplicationList({ rows, selected, onToggle, onToggleAll, onDelete }: ApplicationListProps) {
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const someChecked = rows.some((r) => selected.includes(r.id)) && !allChecked;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-line px-3 pb-2.5">
        <input
          type="checkbox"
          aria-label="이 페이지 전체 선택"
          checked={allChecked}
          ref={(el) => {
            if (el) el.indeterminate = someChecked;
          }}
          onChange={onToggleAll}
          className="h-4 w-4 cursor-pointer rounded border-line accent-primary"
        />
        <span className="text-2xs text-mute">이 페이지 전체 선택</span>
      </div>

      <ul>
        {rows.map((row) => {
          const checked = selected.includes(row.id);
          return (
            <li key={row.id} className="border-b border-lineSoft">
              <div
                className={`flex gap-3 rounded-lg px-3 py-4 transition-colors duration-150 ease-out ${
                  checked ? 'bg-primarySoft' : 'hover:bg-hover'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(row.id)}
                  aria-label={`${row.company || '이름 없는 지원'} 선택`}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-line accent-primary"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    {row.platform && (
                      <span className="inline-flex items-center gap-1.5 text-2xs text-graphite">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: PLATFORM_DOT[row.platform] }}
                          aria-hidden="true"
                        />
                        {PLATFORM_LABEL[row.platform]}
                      </span>
                    )}
                    <span className="text-2xs text-line" aria-hidden="true">
                      |
                    </span>
                    <span className={`text-2xs ${POSTING_STYLE[row.postingStatus]}`}>{row.postingStatus}</span>
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-2xs ${APPLY_STYLE[row.applyStatus]}`}>
                      {row.applyStatus}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5">
                    <Link
                      to={`/applications/${row.id}`}
                      className="text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
                    >
                      {row.company || <span className="text-mute">회사명 미입력</span>}
                    </Link>
                    <span className="text-[13px] text-graphite">{row.position}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-mute">
                    {row.region && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {shortSido(row.region.sido)} {row.region.sigungu} {row.region.dong}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      지원 {dotDate(row.appliedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${row.viewed ? 'bg-success' : 'bg-line'}`}
                        aria-hidden="true"
                      />
                      {row.viewed ? (
                        <span className="text-graphite">
                          열람
                          {row.viewedAt && <span className="ml-1 tabular-nums text-mute">{shortDate(row.viewedAt)}</span>}
                        </span>
                      ) : (
                        '미열람'
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-0.5 sm:flex-row">
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${row.company} 공고 열기`}
                      title="공고 링크 열기"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-primary"
                    >
                      <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  <Link
                    to={`/applications/${row.id}`}
                    aria-label={`${row.company} 수정`}
                    title="세부 내용 수정"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
                  >
                    <PencilLineIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <IconButton label={`${row.company} 삭제`} tone="danger" onClick={() => onDelete(row.id)}>
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
