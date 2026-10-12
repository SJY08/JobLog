import type { PreviewStrategy } from '../types';
import { ImageViewer } from '../../ui/ImageViewer';

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'];

/**
 * @description PNG·JPG 이미지를 그대로 보여주는 전략
 */
export const imagePreviewStrategy: PreviewStrategy = {
  name: 'image',
  canPreview: true,
  supports: (file) => IMAGE_MIME_TYPES.includes(file.mimeType) || /\.(png|jpe?g)$/i.test(file.fileName),
  render: (file) => <ImageViewer file={file} />,
};
