import { useEffect, useState } from 'react';

export interface PdfViewportLike {
  width: number;
  height: number;
}

export interface PdfPageLike {
  getViewport: (opts: { scale: number }) => PdfViewportLike;
  render: (opts: Record<string, unknown>) => { promise: Promise<void> };
}

export interface PdfDocumentLike {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
}

interface PdfState {
  doc: PdfDocumentLike | null;
  total: number;
  loading: boolean;
  error: boolean;
}

/**
 * @description PDF 문서를 불러오는 훅
 */
export function usePdfDocument(url: string): PdfState {
  const [state, setState] = useState<PdfState>({
    doc: null,
    total: 0,
    loading: true,
    error: false
  });

  useEffect(() => {
    let cancelled = false;
    setState({ doc: null, total: 0, loading: true, error: false });

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const data = await (await fetch(url)).arrayBuffer();
        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        setState({
          doc: doc as unknown as PdfDocumentLike,
          total: doc.numPages,
          loading: false,
          error: false
        });
      } catch {
        if (!cancelled) setState({ doc: null, total: 0, loading: false, error: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
