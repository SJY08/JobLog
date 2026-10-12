import type { StoredFile } from '@/entities/file';
import type { PreviewStrategy } from './types';
import { pdfPreviewStrategy } from './strategies/pdfPreviewStrategy';
import { imagePreviewStrategy } from './strategies/imagePreviewStrategy';
import { fallbackPreviewStrategy } from './strategies/fallbackPreviewStrategy';

/** 새 형식을 지원하려면 전략을 만들어 여기에 한 줄 추가합니다. fallback은 넣지 않습니다. */
const strategies: PreviewStrategy[] = [pdfPreviewStrategy, imagePreviewStrategy];

/**
 * @description 파일에 맞는 미리보기 전략을 고르는 함수 (맞는 전략이 없으면 fallback)
 */
export function resolvePreviewStrategy(file: StoredFile): PreviewStrategy {
  return strategies.find((s) => s.supports(file)) ?? fallbackPreviewStrategy;
}
