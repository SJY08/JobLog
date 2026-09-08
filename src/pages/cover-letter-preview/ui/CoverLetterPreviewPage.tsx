import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react';
import { useRecords } from '@/entities/application';
import type { CoverLetter, CoverLetterSection } from '@/entities/cover-letter';
import { Button } from '@/shared/ui';
import { countChars, longDate, sanitizeFileName } from '@/shared/lib';

const MM_TO_PX = 96 / 25.4;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_PADDING_MM = 20;
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;
const PAGE_PADDING_PX = PAGE_PADDING_MM * MM_TO_PX;
const PAGE_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_PADDING_PX * 2;
const SECTION_GAP_PX = 36;

/**
 * @description 자기소개서를 미리보는 페이지
 */
export function CoverLetterPreviewPage() {
  const navigate = useNavigate();
  const { coverLetter } = useRecords();
  const filled = coverLetter.sections.filter((s) => s.body.trim().length > 0);
  const total = coverLetter.sections.reduce((sum, s) => sum + countChars(s.body), 0);

  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [pages, setPages] = useState<string[][]>([]);

  useLayoutEffect(() => {
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    const footerHeight = footerRef.current?.offsetHeight ?? 0;

    const result: string[][] = [[]];
    let pageIndex = 0;
    let used = headerHeight;

    coverLetter.sections.forEach((section) => {
      const height = (sectionRefs.current[section.id]?.offsetHeight ?? 0) + SECTION_GAP_PX;
      const isFirstOnPage = result[pageIndex].length === 0;
      if (!isFirstOnPage && used + height > PAGE_CONTENT_HEIGHT_PX) {
        pageIndex += 1;
        result[pageIndex] = [];
        used = 0;
      }
      result[pageIndex].push(section.id);
      used += height;
    });

    if (used + footerHeight > PAGE_CONTENT_HEIGHT_PX && result[pageIndex].length > 0) {
      pageIndex += 1;
      result[pageIndex] = [];
    }

    setPages(result);
  }, [coverLetter]);

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
              {pages.length > 1 && ` · 총 ${pages.length}페이지`}
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

      {/* 페이지 분배 계산을 위한 숨은 측정용 렌더링 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: -99999,
          width: PAGE_WIDTH_PX - PAGE_PADDING_PX * 2,
          visibility: 'hidden'
        }}
      >
        <div ref={headerRef}>
          <HeaderBlock coverLetter={coverLetter} />
        </div>
        {coverLetter.sections.map((section, i) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            style={{ marginTop: SECTION_GAP_PX }}
          >
            <SectionBlock section={section} index={i} />
          </div>
        ))}
        <div ref={footerRef} style={{ marginTop: SECTION_GAP_PX }}>
          <FooterBlock applicantName={coverLetter.applicantName} />
        </div>
      </div>

      {/* 실제 A4 페이지 미리보기 */}
      <div className="thin-scroll mt-7 overflow-x-auto pb-4">
        <div className="flex w-max flex-col items-center gap-8 px-4">
          {pages.map((sectionIds, pageIdx) => (
            <article
              key={pageIdx}
              className="print-sheet shrink-0 rounded-lg border border-neutral-200 bg-white shadow-sheet"
              style={{ width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX, padding: PAGE_PADDING_PX }}
            >
              {pageIdx === 0 && <HeaderBlock coverLetter={coverLetter} />}
              {sectionIds.map((id) => {
                const index = coverLetter.sections.findIndex((s) => s.id === id);
                return (
                  <div key={id} style={{ marginTop: SECTION_GAP_PX }}>
                    <SectionBlock section={coverLetter.sections[index]} index={index} />
                  </div>
                );
              })}
              {pageIdx === pages.length - 1 && (
                <div style={{ marginTop: SECTION_GAP_PX }}>
                  <FooterBlock applicantName={coverLetter.applicantName} />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * @description 자기소개서 머리말(성명/회사/포지션)을 보여주는 컴포넌트
 */
function HeaderBlock({ coverLetter }: { coverLetter: CoverLetter }) {
  return (
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
  );
}

/**
 * @description 자기소개서 항목 하나를 보여주는 컴포넌트
 */
function SectionBlock({ section, index }: { section: CoverLetterSection; index: number }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="text-[16px] font-semibold text-neutral-900">
        <span className="mr-2 text-2xs font-normal tabular-nums text-neutral-500">
          {String(index + 1).padStart(2, '0')}
        </span>
        {section.title || '제목 없는 항목'}
      </h3>
      {section.body.trim() ? (
        <>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.95] text-neutral-700">{section.body}</p>
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
  );
}

/**
 * @description 자기소개서 마지막 확인 문구를 보여주는 컴포넌트
 */
function FooterBlock({ applicantName }: { applicantName: string }) {
  return (
    <footer className="border-t border-neutral-200 pt-5 text-center text-[13px] text-neutral-500">
      위의 기재 내용은 사실과 다름이 없습니다.
      {applicantName && ` — ${applicantName}`}
    </footer>
  );
}
