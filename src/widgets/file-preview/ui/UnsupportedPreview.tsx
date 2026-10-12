import { DownloadIcon, FileWarningIcon } from 'lucide-react';
import type { StoredFile } from '@/entities/file';
import { buttonClass } from '@/shared/ui';

interface UnsupportedPreviewProps {
  file: StoredFile;
}

/**
 * @description 미리보기를 지원하지 않는 파일의 안내 화면
 */
export function UnsupportedPreview({ file }: UnsupportedPreviewProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-20 text-center">
      <FileWarningIcon className="h-7 w-7 text-mute" aria-hidden="true" />
      <p className="mt-4 text-[15px] font-semibold text-ink">이 형식은 미리보기를 지원하지 않습니다.</p>
      <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
        원본을 내려받아 확인해 주세요.
      </p>
      <a href={file.url} download={file.fileName} className={`mt-5 ${buttonClass('primary', 'sm')}`}>
        <DownloadIcon className="h-4 w-4" aria-hidden="true" />
        원본 다운로드
      </a>
    </div>
  );
}
