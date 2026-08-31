import type { StoredFile } from '../model/types';

/**
 * @description PDF 파일인지 확인하는 함수
 */
export function isPdfFile(file: StoredFile): boolean {
  return file.mimeType === 'application/pdf' || file.fileName.toLowerCase().endsWith('.pdf');
}
