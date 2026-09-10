import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, LoaderIcon } from 'lucide-react';
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
const PAGE_CONTENT_WIDTH_PX = PAGE_WIDTH_PX - PAGE_PADDING_PX * 2;
const PAGE_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_PADDING_PX * 2;
const SECTION_GAP_PX = 36;
const PAGE_SPREAD_GAP_PX = 24;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
const VIEWER_BOTTOM_RESERVED_PX = 144;

interface Chunk {
  sectionIndex: number;
  text: string;
  showHeader: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 })
};

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
  const [pages, setPages] = useState<Chunk[][]>([]);

  useLayoutEffect(() => {
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    const footerHeight = footerRef.current?.offsetHeight ?? 0;

    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.top = '0px';
    host.style.left = '-99999px';
    host.style.width = `${PAGE_CONTENT_WIDTH_PX}px`;
    host.style.visibility = 'hidden';
    host.style.pointerEvents = 'none';

    const section = document.createElement('section');
    section.className = 'break-inside-avoid';
    const titleEl = document.createElement('h3');
    titleEl.className = 'text-[16px] font-semibold text-neutral-900';
    const badge = document.createElement('span');
    badge.className = 'mr-2 text-2xs font-normal tabular-nums text-neutral-500';
    const titleText = document.createTextNode('');
    titleEl.appendChild(badge);
    titleEl.appendChild(titleText);
    const bodyEl = document.createElement('p');
    section.appendChild(titleEl);
    section.appendChild(bodyEl);
    host.appendChild(section);
    document.body.appendChild(host);

    const measure = (label: string, title: string | null, bodyText: string) => {
      if (title === null) {
        titleEl.style.display = 'none';
      } else {
        titleEl.style.display = '';
        badge.textContent = label;
        titleText.textContent = title;
      }
      bodyEl.className = title === null
        ? 'whitespace-pre-wrap text-[15px] leading-[1.95] text-neutral-700'
        : 'mt-3 whitespace-pre-wrap text-[15px] leading-[1.95] text-neutral-700';
      bodyEl.textContent = bodyText;
      bodyEl.style.display = bodyText ? '' : 'none';
      return section.getBoundingClientRect().height;
    };

    const fitLength = (label: string, title: string | null, text: string, maxHeight: number) => {
      let lo = 0;
      let hi = text.length;
      let best = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const height = measure(label, title, text.slice(0, mid));
        if (height <= maxHeight) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      while (best > 0 && best < text.length && /[A-Za-z0-9]/.test(text[best - 1]) && /[A-Za-z0-9]/.test(text[best])) {
        best -= 1;
      }
      return best;
    };

    try {
      const result: Chunk[][] = [[]];
      let pageIndex = 0;
      let used = headerHeight;

      coverLetter.sections.forEach((sec, sectionIndex) => {
        const label = String(sectionIndex + 1).padStart(2, '0');
        const title = sec.title || '제목 없는 항목';
        let remaining = sec.body;
        let isFirstChunk = true;

        for (;;) {
          const chunkTitle = isFirstChunk ? title : null;
          const available = PAGE_CONTENT_HEIGHT_PX - used - SECTION_GAP_PX;
          const fullHeight = measure(label, chunkTitle, remaining);

          if (fullHeight <= available) {
            result[pageIndex].push({ sectionIndex, text: remaining, showHeader: isFirstChunk });
            used += SECTION_GAP_PX + fullHeight;
            break;
          }

          if (remaining.length === 0) {
            if (used > 0) {
              pageIndex += 1;
              result[pageIndex] = [];
              used = 0;
              continue;
            }
            result[pageIndex].push({ sectionIndex, text: remaining, showHeader: isFirstChunk });
            used += SECTION_GAP_PX + fullHeight;
            break;
          }

          let n = fitLength(label, chunkTitle, remaining, available);

          if (n === 0) {
            if (used > 0) {
              pageIndex += 1;
              result[pageIndex] = [];
              used = 0;
              continue;
            }
            n = 1;
          }

          const chunkText = remaining.slice(0, n);
          const chunkHeight = measure(label, chunkTitle, chunkText);
          result[pageIndex].push({ sectionIndex, text: chunkText, showHeader: isFirstChunk });
          used += SECTION_GAP_PX + chunkHeight;
          remaining = remaining.slice(n);
          isFirstChunk = false;

          if (remaining.length === 0) break;

          pageIndex += 1;
          result[pageIndex] = [];
          used = 0;
        }
      });

      if (used + SECTION_GAP_PX + footerHeight > PAGE_CONTENT_HEIGHT_PX && result[pageIndex].length > 0) {
        pageIndex += 1;
        result[pageIndex] = [];
      }

      setPages(result);
    } finally {
      document.body.removeChild(host);
    }
  }, [coverLetter]);

  const [isWide, setIsWide] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const exportRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsWide(mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', update);
    else mq.addListener(update);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  const perView = isWide ? 2 : 1;

  useEffect(() => {
    setCurrent((prev) => Math.min(Math.floor(prev / perView) * perView, Math.max(0, pages.length - 1)));
  }, [perView, pages.length]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const recompute = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const perSlot = perView === 2 ? (rect.width - PAGE_SPREAD_GAP_PX) / 2 : rect.width;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const availableHeight = Math.max(240, viewportHeight - rect.top - VIEWER_BOTTOM_RESERVED_PX);
      const scaleByWidth = perSlot / PAGE_WIDTH_PX;
      const scaleByHeight = availableHeight / PAGE_HEIGHT_PX;
      setScale(Math.min(1, scaleByWidth, scaleByHeight));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [perView]);

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setCurrent((prev) => {
        const next = prev + delta * perView;
        if (next < 0) return 0;
        if (next > pages.length - 1) return prev;
        return next;
      });
    },
    [perView, pages.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  }

  const handleDownload = useCallback(async () => {
    if (downloading || pages.length === 0) return;
    setDownloading(true);
    try {
      const name = sanitizeFileName(coverLetter.applicantName) || '이름미입력';
      const position = sanitizeFileName(coverLetter.targetPosition);
      const fileName = position ? `[${position}]${name}_자기소개서` : `${name}_자기소개서`;

      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas-pro')]);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

      for (let i = 0; i < pages.length; i += 1) {
        const node = exportRefs.current[i];
        if (!node) continue;
        const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM);
      }

      pdf.save(`${fileName}.pdf`);
    } finally {
      setDownloading(false);
    }
  }, [downloading, pages, coverLetter.applicantName, coverLetter.targetPosition]);

  const visible = Array.from({ length: perView }, (_, i) => current + i).filter((i) => i < pages.length);
  const atStart = current === 0;
  const atEnd = current + perView >= pages.length;
  const pageLabel =
    pages.length === 0
      ? '0 / 0 페이지'
      : visible.length > 1
        ? `${visible[0] + 1}–${visible[visible.length - 1] + 1} / ${pages.length} 페이지`
        : `${visible[0] + 1} / ${pages.length} 페이지`;

  const arrowClass =
    'h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-graphite transition-colors duration-150 ease-out hover:bg-hover hover:text-ink active:scale-95 disabled:opacity-35 disabled:hover:bg-surface disabled:hover:text-graphite disabled:active:scale-100';

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
          <Button variant="primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            )}
            {downloading ? 'PDF 만드는 중…' : 'PDF 다운로드'}
          </Button>
        </div>
        <p className="mt-3 text-2xs text-mute">
          미리보기에 보이는 그대로 A4 여러 장으로 나뉜 PDF 파일이 바로 내려받아집니다.
        </p>
      </div>

      {/* 헤더/푸터 높이 측정용 숨은 렌더링 (섹션은 별도 DOM으로 줄 단위 측정) */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: -99999, width: PAGE_CONTENT_WIDTH_PX, visibility: 'hidden' }}
      >
        <div ref={headerRef}>
          <HeaderBlock coverLetter={coverLetter} />
        </div>
        <div ref={footerRef} style={{ marginTop: SECTION_GAP_PX }}>
          <FooterBlock applicantName={coverLetter.applicantName} />
        </div>
      </div>

      {/* 화면 뷰어: 반응형으로 축소되는 페이지 단위 내비게이션 */}
      <div className="no-print mt-7">
        <div className="relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={atStart}
              aria-label="이전 페이지"
              className={`hidden lg:inline-flex ${arrowClass}`}
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div
              ref={stageRef}
              className="flex w-full min-w-0 items-center justify-center overflow-hidden lg:flex-1"
              style={{ height: PAGE_HEIGHT_PX * scale }}
            >
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  drag={!isWide && pages.length > perView ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  className="flex touch-pan-y items-start"
                  style={{ gap: PAGE_SPREAD_GAP_PX }}
                >
                  {visible.map((pageIdx) => (
                    <div
                      key={pageIdx}
                      className="shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sheet"
                      style={{ width: PAGE_WIDTH_PX * scale, height: PAGE_HEIGHT_PX * scale }}
                    >
                      <div
                        style={{
                          width: PAGE_WIDTH_PX,
                          height: PAGE_HEIGHT_PX,
                          padding: PAGE_PADDING_PX,
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left'
                        }}
                      >
                        <PageContent
                          page={pages[pageIdx]}
                          coverLetter={coverLetter}
                          isFirstPage={pageIdx === 0}
                          isLastPage={pageIdx === pages.length - 1}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              disabled={atEnd}
              aria-label="다음 페이지"
              className={`hidden lg:inline-flex ${arrowClass}`}
            >
              <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 lg:mt-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="이전 페이지"
            className={`inline-flex lg:hidden ${arrowClass}`}
          >
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="min-w-27.5 text-center text-sm tabular-nums text-graphite">{pageLabel}</p>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="다음 페이지"
            className={`inline-flex lg:hidden ${arrowClass}`}
          >
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {pages.length > 1 && (
          <p className="mt-2 text-center text-2xs text-mute lg:hidden">좌우로 밀어서 페이지를 넘길 수 있습니다.</p>
        )}
      </div>

      {/* PDF 다운로드용: 실제 크기 그대로 화면 밖에 렌더링해 캡처 대상으로 사용 */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: -99999 }}>
        {pages.map((page, pageIdx) => (
          <div
            key={pageIdx}
            ref={(el) => {
              exportRefs.current[pageIdx] = el;
            }}
            style={{
              width: PAGE_WIDTH_PX,
              height: PAGE_HEIGHT_PX,
              padding: PAGE_PADDING_PX,
              background: '#ffffff',
              overflow: 'hidden'
            }}
          >
            <PageContent
              page={page}
              coverLetter={coverLetter}
              isFirstPage={pageIdx === 0}
              isLastPage={pageIdx === pages.length - 1}
            />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * @description 한 페이지에 들어갈 헤더/청크/푸터를 배치하는 컴포넌트
 */
function PageContent({
  page,
  coverLetter,
  isFirstPage,
  isLastPage
}: {
  page: Chunk[];
  coverLetter: CoverLetter;
  isFirstPage: boolean;
  isLastPage: boolean;
}) {
  return (
    <>
      {isFirstPage && <HeaderBlock coverLetter={coverLetter} />}
      {page.map((chunk, i) => (
        <div key={`${chunk.sectionIndex}-${i}`} style={{ marginTop: SECTION_GAP_PX }}>
          <ChunkBlock chunk={chunk} section={coverLetter.sections[chunk.sectionIndex]} />
        </div>
      ))}
      {isLastPage && (
        <div style={{ marginTop: SECTION_GAP_PX }}>
          <FooterBlock applicantName={coverLetter.applicantName} />
        </div>
      )}
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
 * @description 자기소개서 항목(또는 그 일부)을 보여주는 컴포넌트
 */
function ChunkBlock({ chunk, section }: { chunk: Chunk; section: CoverLetterSection }) {
  return (
    <section className="break-inside-avoid">
      {chunk.showHeader && (
        <h3 className="text-[16px] font-semibold text-neutral-900">
          <span className="mr-2 text-2xs font-normal tabular-nums text-neutral-500">
            {String(chunk.sectionIndex + 1).padStart(2, '0')}
          </span>
          {section.title || '제목 없는 항목'}
        </h3>
      )}
      {chunk.text && (
        <p
          className={`whitespace-pre-wrap text-[15px] leading-[1.95] text-neutral-700 ${chunk.showHeader ? 'mt-3' : ''}`}
        >
          {chunk.text}
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
