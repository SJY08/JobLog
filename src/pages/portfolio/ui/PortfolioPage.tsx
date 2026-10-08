import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadIcon, EyeIcon, FileTextIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useRecords } from '@/entities/application';
import { FILE_KINDS, isPdfFile, type FileKind } from '@/entities/file';
import { FileUploadModal } from '@/widgets/file-upload-modal';
import { ConfirmDialog } from '@/widgets/confirm-dialog';
import { Button, IconButton, ListSkeleton, SelectInput, buttonClass, useToast } from '@/shared/ui';
import { countChars, dotDate, fileSize, longDate } from '@/shared/lib';

/**
 * @description 포트폴리오를 정리하는 페이지
 */
export function PortfolioPage() {
  const { files, loading, error, reload, addFiles, updateFile, removeFile, coverLetter } = useRecords();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [kindFilter, setKindFilter] = useState<FileKind | 'all'>('all');
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const written = coverLetter.sections.filter((s) => countChars(s.body) > 0).length;
  const totalChars = coverLetter.sections.reduce((sum, s) => sum + countChars(s.body), 0);

  const visible = useMemo(
    () => (kindFilter === 'all' ? files : files.filter((f) => f.kind === kindFilter)),
    [files, kindFilter]
  );

  return (
    <>
      <div>
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">포트폴리오 정리</h1>
        <p className="mt-2 text-[13px] text-mute">
          제출용 서류를 한곳에 모아두고, 필요할 때 바로 미리보기하거나 내려받습니다.
        </p>
      </div>

      <section aria-labelledby="cover-letter-heading" className="mt-6 border-y border-line py-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft"
              aria-hidden="true"
            >
              <FileTextIcon className="h-4 w-4 text-primary" />
            </span>
            <div>
              <h2 id="cover-letter-heading" className="text-[17px] font-semibold text-ink">
                자기소개서 직접 작성
              </h2>
              <p className="mt-1.5 text-[13px] text-mute">
                항목{' '}
                <span className="tabular-nums text-graphite">
                  {written}/{coverLetter.sections.length}
                </span>
                개 작성 · 총 <span className="tabular-nums text-graphite">{totalChars}</span>자
                {coverLetter.updatedAt && ` · 마지막 저장 ${longDate(coverLetter.updatedAt)}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/cover-letter" className={buttonClass('primary')}>
              작성 · 수정하기
            </Link>
            <Link to="/cover-letter/preview" className={buttonClass('outline')}>
              미리보기 · PDF
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="files-heading" className="mt-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="files-heading" className="text-[17px] font-semibold text-ink">
            저장된 파일
          </h2>
          <div className="flex items-center gap-2">
            <SelectInput
              compact
              aria-label="파일 종류 필터"
              className="w-32.5"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as FileKind | 'all')}
            >
              <option value="all">전체 종류</option>
              {FILE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </SelectInput>
            <Button variant="primary" aria-label="파일 추가" title="파일 추가" onClick={() => setUploadOpen(true)} className="w-11 px-0">
              <PlusIcon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-3">
            <ListSkeleton rows={3} />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-[15px] font-semibold text-ink">파일 목록을 불러오지 못했습니다.</p>
            <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
              네트워크 상태를 확인한 뒤 다시 시도해 주세요.
            </p>
            <Button variant="outline" className="mt-5" onClick={reload}>
              다시 시도
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-3 border-t border-line">
              {visible.map((file) => (
                <li key={file.id} className="border-b border-line-soft">
                  <div className="flex flex-col gap-2.5 rounded-lg px-3 py-3.5 transition-colors duration-150 ease-out hover:bg-hover sm:flex-row sm:items-center sm:gap-4">
                    <span className="inline-flex w-19 shrink-0 items-center justify-center rounded border border-line px-2 py-1 text-2xs text-graphite">
                      {file.kind}
                    </span>

                    <input
                      value={file.label}
                      aria-label={`${file.fileName} 표시 이름`}
                      title="눌러서 이름 바꾸기"
                      onChange={(e) => updateFile(file.id, { label: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                      className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-line focus:border-primary focus:outline-none"
                    />

                    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-mute">
                      <span className="max-w-50 truncate">{file.fileName}</span>
                      <span className="tabular-nums">{fileSize(file.size)}</span>
                      <span className="whitespace-nowrap tabular-nums">{dotDate(file.uploadedAt)} 업로드</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                      {isPdfFile(file) && (
                        <Link
                          to={`/portfolio/preview/${file.id}`}
                          aria-label={`${file.label} 미리보기`}
                          title="미리보기"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-primary"
                        >
                          <EyeIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                      <a
                        href={file.url}
                        download={file.fileName}
                        aria-label={`${file.label} 다운로드`}
                        title="다운로드"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
                      >
                        <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <IconButton label={`${file.label} 삭제`} tone="danger" onClick={() => setPendingDelete(file.id)}>
                        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {visible.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[15px] font-semibold text-ink">
                  {files.length === 0 ? '아직 올린 파일이 없습니다.' : '이 종류의 파일이 없습니다.'}
                </p>
                <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
                  {files.length === 0
                    ? '이력서 PDF 하나만 올려두어도, 지원할 때마다 찾아 헤매지 않습니다.'
                    : '다른 종류를 선택하거나 새 파일을 추가해 보세요.'}
                </p>
                <Button variant="outline" className="mt-5" onClick={() => setUploadOpen(true)}>
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  파일 추가
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <FileUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={async (kind, list) => {
          await addFiles(kind, list);
          toast.success(`파일 ${list.length}개를 추가했습니다.`);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="이 파일을 삭제할까요?"
        description="저장된 파일이 영구히 삭제되며 되돌릴 수 없습니다."
        busy={deleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          try {
            await removeFile(pendingDelete);
            toast.success('파일을 삭제했습니다.');
            setPendingDelete(null);
          } catch {
            toast.error('삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
