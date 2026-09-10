import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireUserId } from "./_lib/auth.js"
import { requireMethod, withErrors } from "./_lib/http.js"
import { getSupabase } from "./_lib/supabase.js"

const DEFAULT_SECTION_TITLES = ["성장과정", "성격의 장단점", "학교생활", "지원동기 및 입사 후 포부"]

function defaultCoverLetter() {
    return {
        applicantName: "",
        targetCompany: "",
        targetPosition: "",
        sections: DEFAULT_SECTION_TITLES.map((title, i) => ({
            id: `s-${i + 1}`,
            title,
            body: "",
            locked: true,
        })),
        updatedAt: "",
    }
}

interface CoverLetterRow {
    applicant_name: string
    target_company: string
    target_position: string
    sections: unknown
    updated_at: string
}

function toCoverLetter(row: CoverLetterRow) {
    return {
        applicantName: row.applicant_name,
        targetCompany: row.target_company,
        targetPosition: row.target_position,
        sections: row.sections,
        updatedAt: row.updated_at,
    }
}

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET", "PUT"])) return
    const userId = requireUserId(req)
    const supabase = getSupabase()

    if (req.method === "GET") {
        const { data } = await supabase.from("cover_letters").select("*").eq("user_id", userId).maybeSingle()
        res.status(200).json(data ? toCoverLetter(data) : defaultCoverLetter())
        return
    }

    const body = (req.body ?? {}) as {
        applicantName?: string
        targetCompany?: string
        targetPosition?: string
        sections?: unknown
    }
    const { data, error } = await supabase
        .from("cover_letters")
        .upsert({
            user_id: userId,
            applicant_name: body.applicantName ?? "",
            target_company: body.targetCompany ?? "",
            target_position: body.targetPosition ?? "",
            sections: body.sections ?? [],
            updated_at: new Date().toISOString(),
        })
        .select("*")
        .single()

    if (error || !data) throw new Error("자기소개서 저장에 실패했습니다.")
    res.status(200).json(toCoverLetter(data))
})
