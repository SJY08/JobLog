import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

let client: ReturnType<typeof createClient<Database>> | null = null

/**
 * @description service role 키로 Supabase 클라이언트를 만드는 함수 (서버 전용)
 */
export function getSupabase() {
    if (client) return client
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.")
    client = createClient<Database>(url, key, { auth: { persistSession: false } })
    return client
}
