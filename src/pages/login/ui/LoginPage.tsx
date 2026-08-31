import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LoaderIcon } from "lucide-react"
import { useAuth } from "@/entities/session"

const POINTS = [
    ["지원 경로별로 한 줄씩", "잡코리아 · 원티드 · 랠릿 · 그 외 지원까지 한 목록에서 관리합니다."],
    ["열람 여부까지 기록", "기업이 이력서를 봤는지, 언제 봤는지 남겨두면 다음 지원의 근거가 됩니다."],
    ["서류는 한곳에", "이력서 · 포트폴리오 · 자기소개서를 올려두고 미리보기와 PDF로 바로 꺼냅니다."],
]

/**
 * @description 로그인하는 페이지
 */
export function LoginPage() {
    const { user, signInWithGoogle, signingIn } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) navigate("/applications", { replace: true })
    }, [user, navigate])

    return (
        <div className="flex min-h-full w-full items-center justify-center bg-bg px-5 py-12 sm:px-8 sm:py-16">
            <div className="grid w-full max-w-250 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
                <div>
                    <div className="flex items-center gap-2">
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white"
                            aria-hidden="true"
                        >
                            J
                        </span>
                        <span className="text-[19px] font-bold tracking-tight text-ink">JobLog</span>
                    </div>

                    <h1 className="mt-7 text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
                        지원한 곳을
                        <br />
                        잊지 않기 위한 기록
                    </h1>
                    <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-graphite">
                        원서 마감일, 열람 여부, 면접 일정이 메신저와 메일함에 흩어져 있으면 결국 놓칩니다. 지원 하나를
                        한 줄로 남겨두는 것부터 시작합니다.
                    </p>

                    <dl className="mt-9 border-t border-line">
                        {POINTS.map(([title, body]) => (
                            <div key={title} className="border-b border-line py-4">
                                <dt className="text-[13px] font-semibold text-ink">{title}</dt>
                                <dd className="mt-1 text-[13px] leading-relaxed text-mute">{body}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="lg:pt-24">
                    <div className="rounded-xl border border-line bg-surface p-6 sm:p-7">
                        <h2 className="text-[17px] font-semibold text-ink">시작하기</h2>
                        <p className="mt-2 text-[13px] leading-relaxed text-mute">
                            학교에서 발급받은 구글 계정으로 로그인하세요. 기록은 로그인한 계정에 저장됩니다.
                        </p>

                        <button
                            type="button"
                            onClick={signInWithGoogle}
                            disabled={signingIn}
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-md border border-line bg-surface text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover disabled:text-mute"
                        >
                            {signingIn ? (
                                <>
                                    <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    구글 계정 확인 중…
                                </>
                            ) : (
                                <>
                                    <GoogleMark />
                                    Google 계정으로 로그인
                                </>
                            )}
                        </button>

                        <p className="mt-4 text-2xs leading-relaxed text-mute">
                            @dsmhs.kr 계정을 권장합니다. 개인 계정으로 로그인하면 학교 담당 선생님과 기록을 공유할 수
                            없습니다.
                        </p>
                    </div>

                    <p className="mt-5 pl-1 text-2xs text-mute">문의 · 취업지원부 3층 상담실 / dmg-career@dsmhs.kr</p>
                </div>
            </div>
        </div>
    )
}

/**
 * @description 구글 로고를 보여주는 컴포넌트
 */
function GoogleMark() {
    return (
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path
                fill="#EA4335"
                d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
            />
            <path
                fill="#4285F4"
                d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.48h4.84c-.1.86-.66 2.15-1.94 3.02l2.84 2.2c1.7-1.57 2.9-3.88 2.9-6.86z"
            />
            <path
                fill="#FBBC05"
                d="M3.88 10.78A5.54 5.54 0 013.58 9c0-.62.11-1.22.29-1.78L.96 4.96A8.98 8.98 0 000 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
            />
            <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.95-2.18l-2.84-2.2c-.76.53-1.78.9-3.11.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.44 15.98 5.48 18 9 18z"
            />
        </svg>
    )
}
