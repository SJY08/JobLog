import type { VercelRequest, VercelResponse } from "@vercel/node"
import { fromApplicationInput, toApplication } from "../_lib/applications.js"
import { requireUserId } from "../_lib/auth.js"
import { HttpError, requireMethod, withErrors } from "../_lib/http.js"
import { getSupabase } from "../_lib/supabase.js"

function param(req: VercelRequest, key: string): string {
    const v = req.query[key]
    return typeof v === "string" ? v : ""
}

async function list(req: VercelRequest, res: VercelResponse, userId: string) {
    const page = Math.max(1, Number(param(req, "page")) || 1)
    const pageSize = Math.min(500, Math.max(1, Number(param(req, "pageSize")) || 10))
    const keyword = param(req, "keyword").trim()
    const platform = param(req, "platform")
    const postingStatus = param(req, "postingStatus")
    const applyStatus = param(req, "applyStatus")
    const viewed = param(req, "viewed")
    const sido = param(req, "sido")
    const from = param(req, "from")
    const to = param(req, "to")

    const supabase = getSupabase()
    let query = supabase.from("applications").select("*", { count: "exact" }).eq("user_id", userId)

    if (keyword) query = query.or(`company.ilike.%${keyword}%,position.ilike.%${keyword}%`)
    if (platform) query = query.eq("platform", platform)
    if (postingStatus) query = query.eq("posting_status", postingStatus)
    if (applyStatus) query = query.eq("apply_status", applyStatus)
    if (viewed === "viewed") query = query.eq("viewed", true)
    if (viewed === "unviewed") query = query.eq("viewed", false)
    if (sido) query = query.eq("region->>sido", sido)
    if (from) query = query.gte("applied_at", from)
    if (to) query = query.lte("applied_at", to)

    const start = (page - 1) * pageSize
    const { data, error, count } = await query
        .order("applied_at", { ascending: false })
        .range(start, start + pageSize - 1)

    if (error) throw new HttpError(500, "지원 기록 조회에 실패했습니다.")

    const total = count ?? 0
    res.status(200).json({
        items: (data ?? []).map(toApplication),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
    })
}

interface ApplicationInsert {
    company: string
    position: string
    applied_at: string
    posting_status: string
    apply_status: string
    platform?: string
    region?: unknown
    viewed?: boolean
    viewed_at?: string | null
    link?: string
    memo?: string
}

async function create(req: VercelRequest, res: VercelResponse, userId: string) {
    const body = (req.body ?? {}) as Record<string, unknown>
    if (!body.company || !body.position || !body.appliedAt || !body.postingStatus || !body.applyStatus) {
        throw new HttpError(422, "필수 항목 누락")
    }
    const supabase = getSupabase()
    const { data, error } = await supabase
        .from("applications")
        .insert({ user_id: userId, ...(fromApplicationInput(body) as unknown as ApplicationInsert) })
        .select("*")
        .single()

    if (error || !data) throw new HttpError(422, "필수 항목 누락")
    res.status(201).json(toApplication(data))
}

async function remove(req: VercelRequest, res: VercelResponse, userId: string) {
    const ids = param(req, "ids")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    if (ids.length === 0) {
        res.status(204).end()
        return
    }
    const supabase = getSupabase()
    const { error } = await supabase.from("applications").delete().eq("user_id", userId).in("id", ids)
    if (error) throw new HttpError(500, "삭제에 실패했습니다.")
    res.status(204).end()
}

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET", "POST", "DELETE"])) return
    const userId = requireUserId(req)

    if (req.method === "GET") return list(req, res, userId)
    if (req.method === "POST") return create(req, res, userId)
    return remove(req, res, userId)
})
