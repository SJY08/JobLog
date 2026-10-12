import type { PreviewStrategy } from '../types';
import { PdfViewer } from '../../ui/PdfViewer';

/**
 * @description PDF 파일을 페이지 단위로 보여주는 전략
 */
export const pdfPreviewStrategy: PreviewStrategy = {
  name: 'pdf',
  canPreview: true,
  supports: (file) => file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.fileName),
  render: (file) => <PdfViewer file={file} />,
};
