import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getSupabase } from "../_lib/supabase"

/**
 * @description Vercel Cron이 매주 호출해 Supabase 무료 프로젝트가 잠들지 않게 하는 함수
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        await getSupabase().from("users").select("id").limit(1)
        res.status(200).json({ ok: true })
    } catch {
        res.status(200).json({ ok: false })
    }
}
