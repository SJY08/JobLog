import jwt from "jsonwebtoken"
import type { VercelRequest } from "@vercel/node"
import { HttpError } from "./http.js"
import { getSupabase } from "./supabase.js"

interface TokenPayload {
    sub: string
}

function secret(): string {
    const s = process.env.JWT_SECRET
    if (!s) throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.")
    return s
}

/**
 * @description 사용자 id로 세션 토큰을 발급하는 함수
 */
export function signToken(userId: string): string {
    return jwt.sign({ sub: userId } satisfies TokenPayload, secret(), { expiresIn: "30d" })
}

/**
 * @description Authorization 헤더에서 사용자 id를 꺼내는 함수
 */
function extractUserId(req: VercelRequest): string {
    const header = req.headers.authorization
    if (!header?.startsWith("Bearer ")) throw new HttpError(401, "로그인이 필요합니다.")
    try {
        const payload = jwt.verify(header.slice("Bearer ".length), secret()) as TokenPayload
        return payload.sub
    } catch {
        throw new HttpError(401, "세션이 없거나 만료됨")
    }
}

/**
 * @description 요청을 검증하고 사용자 id만 돌려주는 함수. DB 조회 없이 토큰만 확인하므로
 * 사용자 프로필(이름/이메일 등)이 필요 없는 대부분의 엔드포인트에서는 requireUser 대신 이걸 씀
 */
export function requireUserId(req: VercelRequest): string {
    return extractUserId(req)
}

export interface UserRow {
    id: string
    google_sub: string
    name: string
    email: string
    school: string
    initial: string
    created_at: string
}

/**
 * @description DB 사용자 행을 API 응답용 User로 바꾸는 함수
 */
export function toPublicUser(row: UserRow) {
    return { name: row.name, email: row.email, school: row.school, initial: row.initial }
}

/**
 * @description 요청을 검증하고 로그인한 사용자 행을 돌려주는 함수
 */
export async function requireUser(req: VercelRequest): Promise<UserRow> {
    const userId = extractUserId(req)
    const supabase = getSupabase()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
    if (error || !data) throw new HttpError(401, "세션이 없거나 만료됨")
    return data as UserRow
}
