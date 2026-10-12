import type { ReactNode } from 'react';
import type { StoredFile } from '@/entities/file';

/**
 * @description 파일 형식별 미리보기 방법을 담는 전략 인터페이스
 */
export interface PreviewStrategy {
  name: string;
  /** 목록에서 미리보기 버튼을 보여줄지 여부 */
  canPreview: boolean;
  /** 이 전략이 처리할 수 있는 파일인지 확인 */
  supports(file: StoredFile): boolean;
  /** 미리보기 화면을 그림 */
  render(file: StoredFile): ReactNode;
}
