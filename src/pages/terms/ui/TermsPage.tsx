import { Link } from "react-router-dom"

const SECTIONS: [string, string[]][] = [
    ["1. 목적", ["이 약관은 JobLog(이하 '서비스') 이용과 관련하여 서비스와 이용자의 권리, 의무를 정합니다."]],
    [
        "2. 서비스 이용",
        [
            "서비스는 Google 계정 로그인을 통해 이용할 수 있습니다.",
            "이용자는 지원 기록, 이력서·포트폴리오·자기소개서 등의 서류를 등록·관리할 수 있습니다.",
        ],
    ],
    [
        "3. 이용자의 의무",
        ["이용자는 본인의 계정과 업로드하는 자료에 대한 책임을 집니다.", "타인의 개인정보를 무단으로 등록해서는 안 됩니다."],
    ],
    ["4. 서비스 변경 및 중단", ["운영상·기술상 필요에 따라 서비스의 전부 또는 일부가 변경되거나 중단될 수 있습니다."]],
    ["5. 문의", ["서비스 이용 관련 문의는 아래 이메일로 연락해 주세요: write.freedom.08@gmail.com"]],
]

/**
 * @description 서비스 이용약관 페이지
 */
export function TermsPage() {
    return (
        <div className="min-h-full w-full bg-bg px-5 py-16 sm:px-8">
            <div className="mx-auto max-w-160">
                <Link to="/" className="text-[13px] text-mute hover:text-ink">
                    ← JobLog
                </Link>

                <h1 className="mt-4 text-2xl font-bold text-ink">서비스 이용약관</h1>
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
