import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireUser } from "../_lib/auth.js"
import { toStoredFile } from "../_lib/files.js"
import { HttpError, requireMethod, withErrors } from "../_lib/http.js"
import { getSupabase } from "../_lib/supabase.js"

async function list(req: VercelRequest, res: VercelResponse, userId: string) {
    const kind = typeof req.query.kind === "string" ? req.query.kind : ""
    const supabase = getSupabase()
    let query = supabase.from("stored_files").select("*").eq("user_id", userId).order("uploaded_at", { ascending: false })
    if (kind) query = query.eq("kind", kind)

    const { data, error } = await query
    if (error) throw new HttpError(500, "파일 목록 조회에 실패했습니다.")
    res.status(200).json(await Promise.all((data ?? []).map(toStoredFile)))
}

interface CreatePayload {
    kind?: string
    fileName?: string
    mimeType?: string
    size?: number
    storagePath?: string
}

async function create(req: VercelRequest, res: VercelResponse, userId: string) {
    const body = (req.body ?? {}) as CreatePayload
    const { kind, fileName, mimeType, size, storagePath } = body
    if (!kind || !fileName || !mimeType || typeof size !== "number" || !storagePath) {
        throw new HttpError(422, "파일 정보가 올바르지 않습니다.")
    }
    if (!storagePath.startsWith(`${userId}/`)) throw new HttpError(403, "권한이 없습니다.")

    const supabase = getSupabase()
    const { data, error } = await supabase
        .from("stored_files")
        .insert({
            user_id: userId,
            kind,
            label: fileName.replace(/\.[^.]+$/, ""),
            file_name: fileName,
            mime_type: mimeType,
            size,
            storage_path: storagePath,
        })
        .select("*")
        .single()
    if (error || !data) throw new HttpError(422, "파일 저장에 실패했습니다.")
    res.status(201).json(await toStoredFile(data))
}

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET", "POST"])) return
    const user = await requireUser(req)

    if (req.method === "GET") return list(req, res, user.id)
    return create(req, res, user.id)
})
