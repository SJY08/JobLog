import type { PreviewStrategy } from '../types';
import { UnsupportedPreview } from '../../ui/UnsupportedPreview';

/**
 * @description 미리보기를 지원하지 않는 파일에 쓰는 기본 전략
 */
export const fallbackPreviewStrategy: PreviewStrategy = {
  name: 'fallback',
  canPreview: false,
  supports: () => true,
  render: (file) => <UnsupportedPreview file={file} />,
};
