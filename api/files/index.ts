import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import formidable from "formidable"
import { requireUser } from "../_lib/auth"
import { FILES_BUCKET, toStoredFile } from "../_lib/files"
import { HttpError, requireMethod, withErrors } from "../_lib/http"
import { getSupabase } from "../_lib/supabase"

export const config = { api: { bodyParser: false } }

async function list(req: VercelRequest, res: VercelResponse, userId: string) {
    const kind = typeof req.query.kind === "string" ? req.query.kind : ""
    const supabase = getSupabase()
    let query = supabase.from("stored_files").select("*").eq("user_id", userId).order("uploaded_at", { ascending: false })
    if (kind) query = query.eq("kind", kind)

    const { data, error } = await query
    if (error) throw new HttpError(500, "파일 목록 조회에 실패했습니다.")
    res.status(200).json(await Promise.all((data ?? []).map(toStoredFile)))
}

async function upload(req: VercelRequest, res: VercelResponse, userId: string) {
    const form = formidable({ multiples: true })
    const [fields, files] = await form.parse(req)

    const kind = Array.isArray(fields.kind) ? fields.kind[0] : fields.kind
    const picked = files.file ? (Array.isArray(files.file) ? files.file : [files.file]) : []
    if (!kind || picked.length === 0) throw new HttpError(422, "파일 미첨부")

    const supabase = getSupabase()
    const created = []

    for (const file of picked) {
        const buffer = await readFile(file.filepath)
        const fileName = file.originalFilename ?? "file"
        const storagePath = `${userId}/${randomUUID()}-${fileName}`

        const { error: uploadError } = await supabase.storage
            .from(FILES_BUCKET)
            .upload(storagePath, buffer, { contentType: file.mimetype ?? "application/octet-stream" })
        if (uploadError) throw new HttpError(422, "파일 미첨부")

        const { data, error } = await supabase
            .from("stored_files")
            .insert({
                user_id: userId,
                kind,
                label: fileName.replace(/\.[^.]+$/, ""),
                file_name: fileName,
                mime_type: file.mimetype ?? "application/octet-stream",
                size: file.size,
                storage_path: storagePath,
            })
            .select("*")
            .single()
        if (error || !data) throw new HttpError(422, "파일 미첨부")
        created.push(await toStoredFile(data))
    }

    res.status(201).json(created)
}

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET", "POST"])) return
    const user = await requireUser(req)

    if (req.method === "GET") return list(req, res, user.id)
    return upload(req, res, user.id)
})
