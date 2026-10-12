import type { PdfDocumentLike } from './usePdfDocument';

export const RENDER_WIDTH = 1200;

const cache = new WeakMap<PdfDocumentLike, Map<number, ImageBitmap>>();

function getDocCache(doc: PdfDocumentLike) {
  let map = cache.get(doc);
  if (!map) {
    map = new Map();
    cache.set(doc, map);
  }
  return map;
}

/**
 * @description 캐시된 페이지 비트맵을 가져오는 함수
 */
export function getCachedPage(doc: PdfDocumentLike, pageNumber: number): ImageBitmap | undefined {
  return getDocCache(doc).get(pageNumber);
}

/**
 * @description PDF 페이지를 렌더링해 캐싱하는 함수
 */
export async function renderPageToBitmap(doc: PdfDocumentLike, pageNumber: number): Promise<ImageBitmap> {
  const docCache = getDocCache(doc);
  const cached = docCache.get(pageNumber);
  if (cached) return cached;

  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = (RENDER_WIDTH * dpr) / base.width;
  const viewport = page.getViewport({ scale });

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.floor(viewport.width);
  offscreen.height = Math.floor(viewport.height);
  const ctx = offscreen.getContext('2d');
  if (!ctx) throw new Error('2D context를 만들 수 없습니다.');
  await page.render({ canvasContext: ctx, viewport }).promise;

  const bitmap = await createImageBitmap(offscreen);
  docCache.set(pageNumber, bitmap);
  return bitmap;
}
