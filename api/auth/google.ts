import type { VercelRequest, VercelResponse } from "@vercel/node"
import { signToken, toPublicUser, type UserRow } from "../_lib/auth.js"
import { HttpError, requireMethod, withErrors } from "../_lib/http.js"
import { getSupabase } from "../_lib/supabase.js"

interface GoogleUserInfo {
    sub: string
    email: string
    name: string
}

/**
 * @description 구글 access token으로 프로필을 조회하는 함수
 */
async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserInfo> {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new HttpError(401, "유효하지 않은 구글 토큰")
    return (await res.json()) as GoogleUserInfo
}

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["POST"])) return

    const idToken = typeof req.body?.idToken === "string" ? req.body.idToken : ""
    if (!idToken) throw new HttpError(401, "유효하지 않은 구글 토큰")

    const profile = await fetchGoogleProfile(idToken)
    const supabase = getSupabase()

    const { data: existing } = await supabase.from("users").select("*").eq("google_sub", profile.sub).maybeSingle()

    let row = existing as UserRow | null
    if (!row) {
        const { data: created, error } = await supabase
            .from("users")
            .insert({
                google_sub: profile.sub,
                name: profile.name,
                email: profile.email,
                initial: profile.name.slice(0, 1),
            })
            .select("*")
            .single()
        if (error || !created) throw new HttpError(500, "회원가입 처리에 실패했습니다.")
        row = created as UserRow
    }

    const accessToken = signToken(row.id)
    res.status(200).json({ user: toPublicUser(row), accessToken })
})
