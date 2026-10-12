import type { StoredFile } from '@/entities/file';
import { resolvePreviewStrategy } from '../model/resolvePreviewStrategy';

interface FilePreviewProps {
  file: StoredFile;
}

/**
 * @description 파일 형식에 맞는 전략으로 미리보기를 그리는 컴포넌트
 */
export function FilePreview({ file }: FilePreviewProps) {
  return <>{resolvePreviewStrategy(file).render(file)}</>;
}
