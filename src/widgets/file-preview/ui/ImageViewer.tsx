import { useState } from 'react';
import { DownloadIcon, FileWarningIcon, LoaderIcon } from 'lucide-react';
import type { StoredFile } from '@/entities/file';
import { buttonClass } from '@/shared/ui';

interface ImageViewerProps {
  file: StoredFile;
}

/**
 * @description 이미지 미리보기 뷰어 컴포넌트
 */
export function ImageViewer({ file }: ImageViewerProps) {
  return <ImageFrame key={file.id} file={file} />;
}

function ImageFrame({ file }: ImageViewerProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-20 text-center">
        <FileWarningIcon className="h-7 w-7 text-mute" aria-hidden="true" />
        <p className="mt-4 text-[15px] font-semibold text-ink">이미지를 불러오지 못했습니다.</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
          파일이 손상되었을 수 있습니다. 원본을 내려받아 확인해 주세요.
        </p>
        <a href={file.url} download={file.fileName} className={`mt-5 ${buttonClass('primary', 'sm')}`}>
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
          원본 다운로드
        </a>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-80 items-center justify-center rounded-lg border border-line bg-surface p-4">
      {status === 'loading' && (
        <span className="absolute inset-0 inline-flex items-center justify-center gap-2 text-[13px] text-mute">
          <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
          이미지를 불러오는 중…
        </span>
      )}
      <img
        src={file.url}
        alt={file.label}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`max-h-[80vh] max-w-full object-contain transition-opacity duration-150 ease-out ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
