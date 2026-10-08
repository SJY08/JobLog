import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DownloadIcon, FileWarningIcon } from 'lucide-react';
import { useRecords } from '@/entities/application';
import { isPdfFile } from '@/entities/file';
import { DocumentViewer } from '@/widgets/document-viewer';
import { Button, Skeleton, buttonClass } from '@/shared/ui';
import { dotDate, fileSize } from '@/shared/lib';

/**
 * @description 업로드한 파일을 미리보는 페이지
 */
export function PortfolioPreviewPage() {
  const { id = '' } = useParams();
  const { files, loading, error, reload } = useRecords();
  const file = files.find((f) => f.id === id);

  if (loading) {
    return (
      <div role="status" aria-label="불러오는 중">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-6 h-7 w-64 max-w-full" />
        <Skeleton className="mt-3 h-3 w-48" />
        <Skeleton className="mt-8 h-[60vh] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px] font-semibold text-ink">파일 정보를 불러오지 못했습니다.</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
          네트워크 상태를 확인한 뒤 다시 시도해 주세요.
        </p>
        <Button variant="outline" className="mt-5" onClick={reload}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px] font-semibold text-ink">파일을 찾을 수 없습니다.</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
          삭제되었거나 주소가 잘못되었을 수 있습니다. 목록에서 다시 선택해 주세요.
        </p>
        <Link to="/portfolio" className="mt-4 inline-block text-[13px] text-primary underline underline-offset-4">
          포트폴리오 정리로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/portfolio"
        className="inline-flex items-center gap-1.5 text-[13px] text-mute transition-colors duration-150 ease-out hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        포트폴리오 정리
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <p className="text-2xs font-medium text-primary">{file.kind}</p>
          <h1 className="mt-1.5 truncate text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">
            {file.label}
          </h1>
          <p className="mt-2 text-2xs text-mute">
            {file.fileName} · {fileSize(file.size)} · {dotDate(file.uploadedAt)} 업로드
          </p>
        </div>
        <a href={file.url} download={file.fileName} className={buttonClass('outline')}>
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
          원본 다운로드
        </a>
      </div>

      <div className="mt-7">
        {isPdfFile(file) ? (
          <DocumentViewer file={file} />
        ) : (
          <div className="flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-20 text-center">
            <FileWarningIcon className="h-7 w-7 text-mute" aria-hidden="true" />
            <p className="mt-4 text-[15px] font-semibold text-ink">미리보기는 PDF 파일만 지원합니다.</p>
            <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
              원본을 내려받아 확인해 주세요. 제출용이라면 PDF로 변환해 다시 올려두는 편이 안전합니다.
            </p>
            <a href={file.url} download={file.fileName} className={`mt-5 ${buttonClass('primary', 'sm')}`}>
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              원본 다운로드
            </a>
          </div>
        )}
      </div>
    </>
  );
}
