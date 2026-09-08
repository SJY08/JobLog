import { Link } from "react-router-dom"

const SECTIONS: [string, string[]][] = [
    [
        "1. 수집하는 개인정보 항목",
        [
            "Google 로그인 시: 이름, 이메일 주소",
            "서비스 이용 중 직접 입력하는 정보: 지원 기업, 직무, 지원일 등 지원 기록",
            "업로드하는 파일: 이력서, 포트폴리오, 자기소개서",
        ],
    ],
    [
        "2. 개인정보 수집 및 이용 목적",
        ["Google 계정을 통한 로그인 및 본인 확인", "지원 기록·서류 저장 및 조회 등 서비스 제공"],
    ],
    [
        "3. 개인정보 보관 및 위탁",
        [
            "회원 정보와 업로드 파일은 Supabase(데이터베이스·스토리지)에 저장됩니다.",
            "로그인 인증은 Google에 위탁하며, JobLog는 Google 계정 비밀번호를 저장하거나 처리하지 않습니다.",
        ],
    ],
    ["4. 보유 기간", ["회원 탈퇴 또는 삭제 요청 전까지 보관하며, 요청 시 지체 없이 삭제합니다."]],
    ["5. 문의", ["개인정보 관련 문의는 아래 이메일로 연락해 주세요: write.freedom.08@gmail.com"]],
]

/**
 * @description 개인정보처리방침 페이지
 */
export function PrivacyPage() {
    return (
        <div className="min-h-full w-full bg-bg px-5 py-16 sm:px-8">
            <div className="mx-auto max-w-160">
                <Link to="/" className="text-[13px] text-mute hover:text-ink">
                    ← JobLog
                </Link>

                <h1 className="mt-4 text-2xl font-bold text-ink">개인정보처리방침</h1>
                <p className="mt-2 text-[13px] text-mute">시행일: 2026년 9월 8일</p>

                <div className="mt-8 space-y-8 border-t border-line pt-8">
                    {SECTIONS.map(([title, items]) => (
                        <section key={title}>
                            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-graphite">
                                {items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
}
