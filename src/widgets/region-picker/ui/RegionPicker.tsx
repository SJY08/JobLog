import { useEffect, useRef, useState } from 'react';
import { LoaderIcon, MapPinIcon } from 'lucide-react';
import { regionLabel, searchRegions, type Region } from '@/entities/region';

interface RegionPickerProps {
  value: Region | null;
  onChange: (region: Region | null) => void;
  id?: string;
  invalid?: boolean;
}

/**
 * @description 행정구역을 검색해 선택하는 컴포넌트
 */
export function RegionPicker({ value, onChange, id, invalid = false }: RegionPickerProps) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    let alive = true;
    setLoading(true);
    const t = window.setTimeout(() => {
      searchRegions(query).then((rows) => {
        if (!alive) return;
        setResults(rows);
        setCursor(0);
        setLoading(false);
      });
    }, 180);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [query, editing]);

  useEffect(() => {
    if (!editing) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setEditing(false);
        setQuery('');
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [editing]);

  function pick(region: Region) {
    onChange(region);
    setEditing(false);
    setQuery('');
    inputRef.current?.blur();
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <MapPinIcon
          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            value && !editing ? 'text-primary' : 'text-mute'
          }`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={editing}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          autoComplete="off"
          value={editing ? query : regionLabel(value)}
          placeholder="시 · 구 · 동으로 검색 (예: 유성구 관평)"
          onFocus={() => {
            setEditing(true);
            setQuery('');
          }}
          onChange={(e) => {
            setEditing(true);
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === 'Enter' && results[cursor]) {
              e.preventDefault();
              pick(results[cursor]);
            } else if (e.key === 'Escape') {
              setEditing(false);
              setQuery('');
              inputRef.current?.blur();
            }
          }}
          className={`h-11 w-full rounded-md border bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-mute/70 transition-colors duration-150 ease-out hover:bg-hover focus:bg-surface focus:border-primary focus:outline-none ${
            invalid ? 'border-danger' : 'border-line'
          }`}
        />
        {loading && editing && (
          <LoaderIcon
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mute"
            aria-hidden="true"
          />
        )}
      </div>

      {editing && (
        <ul
          role="listbox"
          className="thin-scroll absolute z-40 mt-1.5 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-pop"
        >
          {!loading && results.length === 0 && (
            <li className="px-3.5 py-3 text-[13px] text-mute">
              검색 결과가 없습니다. 시 · 구 · 동 이름을 다시 확인해 주세요.
            </li>
          )}
          {results.map((r, i) => (
            <li key={r.code}>
              <button
                type="button"
                role="option"
                aria-selected={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(r)}
                className={`flex w-full items-baseline gap-2 px-3.5 py-2.5 text-left text-[13px] transition-colors duration-150 ease-out ${
                  i === cursor ? 'bg-hover text-ink' : 'text-graphite'
                }`}
              >
                <span className="font-medium text-ink">{r.dong}</span>
                <span className="text-mute">
                  {r.sido} {r.sigungu}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
