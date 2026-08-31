import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { dotDate, toISODate, today } from "../lib/format"

interface DatePickerProps {
    value: string
    onChange: (value: string) => void
    min?: string
    max?: string
    placeholder?: string
    id?: string
    disabled?: boolean
    allowClear?: boolean
    invalid?: boolean
    className?: string
}

const PANEL_WIDTH = 296
const PANEL_HEIGHT = 348
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

/**
 * @description 날짜 선택 컴포넌트
 */
export function DatePicker({
    value,
    onChange,
    min,
    max,
    placeholder = "날짜 선택",
    id,
    disabled = false,
    allowClear = false,
    invalid = false,
    className = "",
}: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const [cursorMonth, setCursorMonth] = useState(() => (value || today()).slice(0, 7))
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    const place = useCallback(() => {
        const el = triggerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const openUp = spaceBelow < PANEL_HEIGHT + 16 && rect.top > spaceBelow
        const top = openUp
            ? Math.max(8, rect.top - PANEL_HEIGHT - 8)
            : Math.min(rect.bottom + 8, window.innerHeight - PANEL_HEIGHT - 8)
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8))
        setPos({ top: Math.max(8, top), left })
    }, [])

    useEffect(() => {
        if (!open) return
        place()
        const onScrollOrResize = () => place()
        const onDown = (e: MouseEvent) => {
            if (panelRef.current?.contains(e.target as Node) || triggerRef.current?.contains(e.target as Node)) return
            setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("scroll", onScrollOrResize, true)
        window.addEventListener("resize", onScrollOrResize)
        window.addEventListener("mousedown", onDown)
        window.addEventListener("keydown", onKey)
        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true)
            window.removeEventListener("resize", onScrollOrResize)
            window.removeEventListener("mousedown", onDown)
            window.removeEventListener("keydown", onKey)
        }
    }, [open, place])

    useEffect(() => {
        if (value) setCursorMonth(value.slice(0, 7))
    }, [value])

    const cells = useMemo(() => {
        const [y, m] = cursorMonth.split("-").map(Number)
        const first = new Date(y, m - 1, 1)
        const startOffset = first.getDay()
        const daysInMonth = new Date(y, m, 0).getDate()
        const list: { iso: string; day: number; inMonth: boolean }[] = []
        for (let i = 0; i < 42; i += 1) {
            const d = new Date(y, m - 1, i - startOffset + 1)
            list.push({
                iso: toISODate(d),
                day: d.getDate(),
                inMonth: d.getMonth() === m - 1,
            })
        }
        const trimmed = list.slice(0, startOffset + daysInMonth > 35 ? 42 : 35)
        return trimmed
    }, [cursorMonth])

    function shiftMonth(delta: number) {
        const [y, m] = cursorMonth.split("-").map(Number)
        const d = new Date(y, m - 1 + delta, 1)
        setCursorMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
    }

    const disabledDate = (iso: string) => (min && iso < min) || (max && iso > max) || false
    const [cy, cm] = cursorMonth.split("-")

    return (
        <>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={`flex h-11 w-full items-center gap-2 rounded-md border bg-surface px-3 text-left text-sm transition-colors duration-150 ease-out hover:bg-hover focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:text-mute ${
                    invalid ? "border-danger" : "border-line"
                } ${className}`}
            >
                <CalendarIcon className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
                <span className={value ? "text-ink" : "text-mute"}>{value ? dotDate(value) : placeholder}</span>
            </button>

            {open && pos && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="날짜 선택"
                    style={{ top: pos.top, left: pos.left, width: PANEL_WIDTH }}
                    className="fixed z-60 rounded-xl border border-line bg-surface p-3 shadow-pop"
                >
                    <div className="flex items-center justify-between px-1 pb-2">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            aria-label="이전 달"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
                        >
                            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <p className="text-sm font-semibold text-ink">
                            {cy}년 {Number(cm)}월
                        </p>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            aria-label="다음 달"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
                        >
                            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 pb-1">
                        {WEEKDAYS.map((w) => (
                            <span key={w} className="py-1 text-center text-2xs text-mute">
                                {w}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                        {cells.map((cell) => {
                            const selected = cell.iso === value
                            const isToday = cell.iso === today()
                            const off = disabledDate(cell.iso)
                            return (
                                <button
                                    key={cell.iso}
                                    type="button"
                                    disabled={off}
                                    aria-pressed={selected}
                                    onClick={() => {
                                        onChange(cell.iso)
                                        setOpen(false)
                                    }}
                                    className={`h-9 rounded-md text-[13px] transition-colors duration-150 ease-out ${
                                        selected
                                            ? "bg-primary font-semibold text-white"
                                            : off
                                              ? "cursor-not-allowed text-mute/40"
                                              : cell.inMonth
                                                ? "text-ink hover:bg-hover"
                                                : "text-mute/60 hover:bg-hover"
                                    } ${isToday && !selected ? "font-semibold text-primary" : ""}`}
                                >
                                    {cell.day}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (disabledDate(today())) return
                                onChange(today())
                                setOpen(false)
                            }}
                            className="rounded-md px-2 py-1.5 text-[13px] text-primary transition-colors duration-150 ease-out hover:bg-hover"
                        >
                            오늘
                        </button>
                        {allowClear && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("")
                                    setOpen(false)
                                }}
                                className="rounded-md px-2 py-1.5 text-[13px] text-mute transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
                            >
                                지우기
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
