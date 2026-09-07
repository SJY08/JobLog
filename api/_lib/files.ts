import { getSupabase } from "./supabase.js"

export const FILES_BUCKET = "files"
const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1시간

interface StoredFileRow {
    id: string
    kind: string
    label: string
    file_name: string
    mime_type: string
    size: number
    storage_path: string
    uploaded_at: string
}

/**
 * @description DB 행 + 서명된 URL을 API 응답용 StoredFile로 바꾸는 함수
 */
export async function toStoredFile(row: StoredFileRow) {
    const supabase = getSupabase()
    const { data } = await supabase.storage.from(FILES_BUCKET).createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS)
    return {
        id: row.id,
        kind: row.kind,
        label: row.label,
        fileName: row.file_name,
        mimeType: row.mime_type,
        size: row.size,
        uploadedAt: row.uploaded_at,
        url: data?.signedUrl ?? "",
    }
}
