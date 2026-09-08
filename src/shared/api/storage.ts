import { createClient } from "@supabase/supabase-js"

const FILES_BUCKET = "files"

let client: ReturnType<typeof createClient> | null = null

function getStorageClient() {
    if (client) return client
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
    if (!url || !key) throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY 환경변수가 설정되지 않았습니다.")
    client = createClient(url, key, { auth: { persistSession: false } })
    return client
}

/**
 * @description 서명된 업로드 URL로 파일을 Supabase Storage에 직접 올리는 함수 (Vercel 요청 크기 제한 우회)
 */
export async function uploadToSignedUrl(storagePath: string, token: string, file: File): Promise<void> {
    const { error } = await getStorageClient().storage.from(FILES_BUCKET).uploadToSignedUrl(storagePath, token, file)
    if (error) throw new Error("파일 업로드에 실패했습니다.")
}
