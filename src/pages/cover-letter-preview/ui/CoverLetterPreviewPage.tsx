import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react';
import { useRecords } from '@/entities/application';
import { Button } from '@/shared/ui';
import { countChars, longDate, sanitizeFileName } from '@/shared/lib';

/**
 * @description 자기소개서를 미리보는 페이지
 */
export function CoverLetterPreviewPage() {
  const navigate = useNavigate();
  const { coverLetter } = useRecords();
  const filled = coverLetter.sections.filter((s) => s.body.trim().length > 0);
  const total = coverLetter.sections.reduce((sum, s) => sum + countChars(s.body), 0);

  const handlePrint = useCallback(() => {
    const name = sanitizeFileName(coverLetter.applicantName) || '이름미입력';
    const position = sanitizeFileName(coverLetter.targetPosition);
    const fileName = position ? `[${position}]${name}_자기소개서` : `${name}_자기소개서`;

    const prevTitle = document.title;
    document.title = fileName;
    const restoreTitle = () => {
      document.title = prevTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);
    window.print();
  }, [coverLetter.applicantName, coverLetter.targetPosition]);

  return (
    <>
      <div className="no-print">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] text-mute transition-colors duration-150 ease-out hover:text-ink"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
          뒤로
        </button>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">
              자기소개서 미리보기
            </h1>
            <p className="mt-2 text-[13px] text-mute">
              작성된 항목 <span className="tabular-nums text-graphite">{filled.length}</span>/
              {coverLetter.sections.length}개 · 공백 제외{' '}
              <span className="tabular-nums text-graphite">{total}</span>자
              {coverLetter.updatedAt && ` · 마지막 저장 ${longDate(coverLetter.updatedAt)}`}
            </p>
          </div>
          <Button variant="primary" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4" aria-hidden="true" />
            PDF로 저장 · 인쇄
          </Button>
        </div>
        <p className="mt-3 text-2xs text-mute">
          인쇄 창에서 대상을 &lsquo;PDF로 저장&rsquo;으로 선택하면 A4 규격 파일로 내려받을 수 있습니다.
        </p>
      </div>

      <article className="print-sheet mx-auto mt-7 w-full max-w-198.5 rounded-lg border border-neutral-200 bg-white px-6 py-10 shadow-sheet sm:px-17 sm:py-18">
        <header className="border-b-2 border-neutral-900 pb-5">
          <h2 className="text-[26px] font-bold tracking-tight text-neutral-900">자기소개서</h2>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-[13px] text-neutral-600">
            <span>
              성명 <span className="ml-1 font-medium text-neutral-900">{coverLetter.applicantName || '—'}</span>
            </span>
            {coverLetter.targetCompany && (
              <span>
                지원 회사 <span className="ml-1 font-medium text-neutral-900">{coverLetter.targetCompany}</span>
              </span>
            )}
            {coverLetter.targetPosition && (
              <span>
                지원 포지션 <span className="ml-1 font-medium text-neutral-900">{coverLetter.targetPosition}</span>
              </span>
            )}
          </div>
        </header>

        {coverLetter.sections.map((section, i) => (
          <section key={section.id} className="mt-9 break-inside-avoid">
            <h3 className="text-[16px] font-semibold text-neutral-900">
              <span className="mr-2 text-2xs font-normal tabular-nums text-neutral-500">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.title || '제목 없는 항목'}
            </h3>
            {section.body.trim() ? (
              <>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.95] text-neutral-700">
                  {section.body}
                </p>
                <p className="no-print mt-2 text-right text-2xs tabular-nums text-neutral-500">
                  {countChars(section.body)}자
                </p>
              </>
            ) : (
              <p className="no-print mt-3 border-l-2 border-neutral-200 pl-3 text-[13px] text-neutral-500">
                아직 작성되지 않은 항목입니다.
              </p>
            )}
          </section>
        ))}

        <footer className="mt-12 border-t border-neutral-200 pt-5 text-center text-[13px] text-neutral-500">
          위의 기재 내용은 사실과 다름이 없습니다.
          {coverLetter.applicantName && ` — ${coverLetter.applicantName}`}
        </footer>
      </article>
    </>
  );
}
