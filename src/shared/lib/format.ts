/**
 * @description 오늘 날짜를 구하는 함수
 */
export function today(): string {
  return toISODate(new Date());
}

/**
 * @description 날짜를 ISO 문자열로 바꾸는 함수
 */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * @description 날짜/시각 문자열에서 날짜(YYYY-MM-DD) 부분만 떼어내는 함수. timestamptz처럼 시각이 붙어 와도 앞 10자만 씀
 */
function datePart(iso: string): [string, string, string] | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return null;
  return [y, m, d];
}

/**
 * @description 날짜를 점 구분 형식으로 바꾸는 함수
 */
export function dotDate(iso: string): string {
  const parts = datePart(iso);
  if (!parts) return iso;
  const [y, m, d] = parts;
  return `${y}.${m}.${d}`;
}

/**
 * @description 날짜를 짧은 형식으로 바꾸는 함수
 */
export function shortDate(iso: string): string {
  const parts = datePart(iso);
  if (!parts) return iso;
  const [, m, d] = parts;
  return `${m}.${d}`;
}

/**
 * @description 날짜를 긴 한국어 형식으로 바꾸는 함수
 */
export function longDate(iso: string): string {
  const parts = datePart(iso);
  if (!parts) return iso;
  const [y, m, d] = parts;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

/**
 * @description 파일 크기를 읽기 쉬운 문자열로 바꾸는 함수
 */
export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * @description 글자 수를 세는 함수
 */
export function countChars(text: string): number {
  return text.replace(/\s/g, '').length;
}

/**
 * @description 고유 ID를 만드는 함수
 */
export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @description URL 형식을 검사하는 함수
 */
export function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @description 파일명에 못 쓰는 문자를 정리하는 함수
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
