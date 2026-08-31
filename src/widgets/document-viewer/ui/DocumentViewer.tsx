import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FileWarningIcon, LoaderIcon } from "lucide-react"
import type { StoredFile } from "@/entities/file"
import { Button } from "@/shared/ui"
import { PdfPage } from "./PdfPage"
import { usePdfDocument } from "../lib/usePdfDocument"
import { renderPageToBitmap } from "../lib/pdfPageCache"

interface DocumentViewerProps {
    file: StoredFile
}

const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 500

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
}

/**
 * @description PDF 미리보기 뷰어 컴포넌트
 */
export function DocumentViewer({ file }: DocumentViewerProps) {
    const { doc, total, loading, error } = usePdfDocument(file.url)
    const [isWide, setIsWide] = useState(false)
    const [start, setStart] = useState(0)
    const [direction, setDirection] = useState(1)
    const [failed, setFailed] = useState(false)
    const [minStageHeight, setMinStageHeight] = useState(0)
    const stageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setStart(0)
        setFailed(false)
        setMinStageHeight(0)
    }, [file.id])

    useEffect(() => {
        const el = stageRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect.height ?? 0
            if (h > 0) setMinStageHeight((prev) => Math.max(prev, h))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)")
        const update = () => setIsWide(mq.matches)
        update()
        if (typeof mq.addEventListener === "function") mq.addEventListener("change", update)
        else mq.addListener(update)
        return () => {
            if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", update)
            else mq.removeListener(update)
        }
    }, [])

    const perView = isWide ? 2 : 1

    const go = useCallback(
        (delta: number) => {
            setDirection(delta)
            setStart((prev) => {
                const next = prev + delta * perView
                if (next < 0) return 0
                if (next > total - 1) return prev
                return next
            })
        },
        [perView, total]
    )

    useEffect(() => {
        setStart((prev) => Math.floor(prev / perView) * perView)
    }, [perView])

    useEffect(() => {
        if (!doc || total === 0) return
        const neighbors: number[] = []
        for (let i = -perView; i < 0; i += 1) neighbors.push(start + i)
        for (let i = perView; i < perView * 2; i += 1) neighbors.push(start + i)
        neighbors
            .filter((idx) => idx >= 0 && idx < total)
            .forEach((idx) => {
                renderPageToBitmap(doc, idx + 1).catch(() => {})
            })
    }, [doc, start, perView, total])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
            if (e.key === "ArrowRight") go(1)
            if (e.key === "ArrowLeft") go(-1)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [go])

    if (loading) {
        return (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-line bg-surface">
                <span className="inline-flex items-center gap-2 text-[13px] text-mute">
                    <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                    문서를 불러오는 중…
                </span>
            </div>
        )
    }

    if (error || failed || !doc) {
        return (
            <div className="flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-20 text-center">
                <FileWarningIcon className="h-7 w-7 text-mute" aria-hidden="true" />
                <p className="mt-4 text-[15px] font-semibold text-ink">이 파일을 읽는 데 실패했습니다.</p>
                <p className="mx-auto mt-2 max-w-[44ch] text-[13px] leading-relaxed text-mute">
                    파일이 손상되었거나 암호가 걸려 있을 수 있습니다. 원본을 내려받아 확인해 주세요.
                </p>
                <a href={file.url} download={file.fileName} className="mt-5">
                    <Button variant="primary" size="sm">
                        <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                        원본 다운로드
                    </Button>
                </a>
            </div>
        )
    }

    const pages = Array.from({ length: perView }, (_, i) => start + i + 1).filter((n) => n <= total)
    const atStart = start === 0
    const atEnd = start + perView >= total
    const pageLabel =
        pages.length > 1 ? `${pages[0]}–${pages[pages.length - 1]} / ${total} 페이지` : `${pages[0]} / ${total} 페이지`

    const arrowClass =
        "h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-graphite transition-colors duration-150 ease-out hover:bg-hover hover:text-ink active:scale-95 disabled:opacity-35 disabled:hover:bg-surface disabled:hover:text-graphite disabled:active:scale-100"

    function handleDragEnd(_: unknown, info: PanInfo) {
        if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
            go(1)
        } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
            go(-1)
        }
    }

    return (
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
                    className="max-w-[92vw] overflow-hidden"
                    style={minStageHeight > 0 ? { minHeight: minStageHeight } : undefined}
                >
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={start}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            drag={!isWide && total > 1 ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.7}
                            dragMomentum={false}
                            onDragEnd={handleDragEnd}
                            className="flex touch-pan-y items-start justify-center gap-1 lg:gap-1.5"
                        >
                            {pages.map((pageNumber, i) => (
                                <PdfPage
                                    key={`${file.id}-${pageNumber}`}
                                    doc={doc}
                                    pageNumber={pageNumber}
                                    onError={() => setFailed(true)}
                                    align={pages.length === 2 ? (i === 0 ? 'end' : 'start') : 'center'}
                                />
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
            {total > 1 && (
                <p className="mt-2 text-center text-2xs text-mute lg:hidden">
                    좌우로 밀어서 페이지를 넘길 수 있습니다.
                </p>
            )}
        </div>
    )
}
