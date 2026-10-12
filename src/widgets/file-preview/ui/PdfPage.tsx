import { useLayoutEffect, useRef, useState } from 'react';
import { LoaderIcon } from 'lucide-react';
import type { PdfDocumentLike } from '../lib/usePdfDocument';
import { getCachedPage, renderPageToBitmap } from '../lib/pdfPageCache';

interface PdfPageProps {
  doc: PdfDocumentLike;
  pageNumber: number;
  onError: () => void;
  align?: 'start' | 'center' | 'end';
}

const ALIGN_CLASS = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end'
} as const;

/**
 * @description PDF 페이지 렌더링 컴포넌트
 */
export function PdfPage({ doc, pageNumber, onError, align = 'center' }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(() => !getCachedPage(doc, pageNumber));

  useLayoutEffect(() => {
    let cancelled = false;

    const draw = (bitmap: ImageBitmap) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, bitmap.width, bitmap.height);
      ctx.drawImage(bitmap, 0, 0);
    };

    const cached = getCachedPage(doc, pageNumber);
    if (cached) {
      draw(cached);
      setRendering(false);
      return;
    }

    setRendering(true);
    renderPageToBitmap(doc, pageNumber)
      .then((bitmap) => {
        if (cancelled) return;
        draw(bitmap);
        setRendering(false);
      })
      .catch(() => {
        if (!cancelled) onError();
      });

    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, onError]);

  return (
    <div className={`flex min-w-0 flex-1 ${ALIGN_CLASS[align]}`}>
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="block max-h-[calc(100dvh-9rem)] w-auto max-w-full rounded-md border border-line bg-white shadow-sheet"
          aria-label={`${pageNumber}페이지`}
        />
        {rendering && (
          <span className="absolute inset-0 flex items-center justify-center rounded-md bg-white">
            <LoaderIcon className="h-5 w-5 animate-spin text-mute" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}
