export type FileKind = '이력서' | '포트폴리오' | '자기소개서' | '기타';

export interface StoredFile {
  id: string;
  kind: FileKind;
  label: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
}
