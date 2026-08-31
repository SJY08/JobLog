import React, { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useAuth } from "@/entities/session"
import { useTheme, type ThemeMode } from "@/shared/providers"

const TABS = [
    { to: "/applications", label: "취업활동", match: ["/applications"] },
    { to: "/portfolio", label: "포트폴리오 정리", match: ["/portfolio", "/cover-letter"] },
]

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof SunIcon }[] = [
    { value: "light", label: "라이트", Icon: SunIcon },
    { value: "dark", label: "다크", Icon: MoonIcon },
    { value: "system", label: "시스템", Icon: MonitorIcon },
]

/**
 * @description 앱 공통 레이아웃 컴포넌트
 */
export function AppShell({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth()
    const { mode, setMode } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => setMenuOpen(false), [location.pathname])

    useEffect(() => {
        if (!menuOpen) return
        const onDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false)
        }
        window.addEventListener("mousedown", onDown)
        window.addEventListener("keydown", onKey)
        return () => {
            window.removeEventListener("mousedown", onDown)
            window.removeEventListener("keydown", onKey)
        }
    }, [menuOpen])

    return (
        <div className="flex min-h-full w-full flex-col bg-bg">
            <header className="no-print sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 pt-3.5 sm:px-6">
                    <Link to="/applications" className="flex items-center gap-2">
                        <span
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[13px] font-bold text-white"
                            aria-hidden="true"
                        >
                            J
                        </span>
                        <span className="text-[17px] font-bold tracking-tight text-ink">JobLog</span>
                    </Link>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                            className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors duration-150 ease-out hover:bg-hover"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primarySoft text-[13px] font-semibold text-primary">
                                {user?.initial ?? "?"}
                            </span>
                            <span className="hidden text-left leading-tight sm:block">
                                <span className="block text-[13px] font-medium text-ink">{user?.name}</span>
                                <span className="block text-2xs text-mute">{user?.email}</span>
                            </span>
                        </button>

                        {menuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-lg border border-line bg-surface p-2 shadow-pop"
                            >
                                <div className="px-2 py-2">
                                    <p className="text-[13px] font-medium text-ink sm:hidden">{user?.name}</p>
                                    <p className="text-2xs leading-relaxed text-mute">{user?.school}</p>
                                </div>

                                <div className="border-t border-line px-2 pb-1 pt-3">
                                    <p className="mb-2 text-2xs font-medium text-mute">테마</p>
                                    <div className="flex gap-1 rounded-md bg-lineSoft p-1">
                                        {THEME_OPTIONS.map(({ value, label, Icon }) => {
                                            const active = mode === value
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setMode(value)}
                                                    aria-pressed={active}
                                                    className={`flex flex-1 flex-col items-center gap-1 rounded px-1 py-2 text-2xs transition-colors duration-150 ease-out ${
                                                        active
                                                            ? "bg-surface font-semibold text-primary"
                                                            : "text-mute hover:text-graphite"
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="mt-2 border-t border-line pt-2">
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            signOut()
                                            navigate("/login")
                                        }}
                                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-[13px] text-graphite transition-colors duration-150 ease-out hover:bg-hover hover:text-ink"
                                    >
                                        <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <nav aria-label="페이지 선택" className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                    <ul className="-mb-px flex items-end gap-1">
                        {TABS.map((tab) => {
                            const active = tab.match.some((m) => location.pathname.startsWith(m))
                            return (
                                <li key={tab.to}>
                                    <NavLink
                                        to={tab.to}
                                        className={`inline-block border-b-2 px-3 pb-2.5 pt-3 text-sm transition-colors duration-150 ease-out ${
                                            active
                                                ? "border-primary font-semibold text-ink"
                                                : "border-transparent text-mute hover:text-graphite"
                                        }`}
                                    >
                                        {tab.label}
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">{children}</main>

            <footer className="no-print border-t border-line px-4 py-4 sm:px-6">
                <p className="mx-auto max-w-7x; text-2xs text-mute">
                    JobLog · 대덕소프트웨어마이스터고 취업활동 기록 · 저장된 내용은 이 브라우저에만 보관됩니다.
                </p>
            </footer>
        </div>
    )
}
