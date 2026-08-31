import { RAW_REGIONS } from '../model/data';
import type { Region } from '../model/types';

/**
 * @description 행정구역 라벨을 만드는 함수
 */
export function regionLabel(region: Region | null): string {
  if (!region) return '';
  return `${region.sido} ${region.sigungu} ${region.dong}`;
}

/**
 * @description 시도명을 줄이는 함수
 */
export function shortSido(sido: string): string {
  return sido
    .replace('특별자치시', '')
    .replace('특별자치도', '')
    .replace('특별시', '')
    .replace('광역시', '')
    .replace('충청남도', '충남')
    .replace('충청북도', '충북')
    .replace('경상남도', '경남')
    .replace('경상북도', '경북')
    .replace('전라남도', '전남')
    .replace('경기도', '경기');
}

/**
 * @description 행정구역을 검색하는 함수
 */
export function searchRegions(query: string): Promise<Region[]> {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  return new Promise((resolve) => {
    const delay = 160 + Math.random() * 140;
    window.setTimeout(() => {
      if (tokens.length === 0) {
        resolve(RAW_REGIONS.slice(0, 12));
        return;
      }
      const matched = RAW_REGIONS.filter((r) => {
        const haystack = `${r.sido} ${r.sigungu} ${r.dong} ${shortSido(r.sido)}`;
        return tokens.every((t) => haystack.includes(t));
      });
      resolve(matched.slice(0, 40));
    }, delay);
  });
}
