import { randomUUID } from "node:crypto"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireUser } from "../_lib/auth.js"
import { FILES_BUCKET } from "../_lib/files.js"
import { HttpError, requireMethod, withErrors } from "../_lib/http.js"
import { getSupabase } from "../_lib/supabase.js"

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["POST"])) return
    const user = await requireUser(req)

    const body = (req.body ?? {}) as { fileName?: string }
    const fileName = typeof body.fileName === "string" ? body.fileName.trim() : ""
    const extMatch = /\.[a-zA-Z0-9]{1,10}$/.exec(fileName)
    const ext = extMatch ? extMatch[0].toLowerCase() : ""
    const storagePath = `${user.id}/${randomUUID()}${ext}`

    const supabase = getSupabase()
    const { data, error } = await supabase.storage.from(FILES_BUCKET).createSignedUploadUrl(storagePath)
    if (error || !data) throw new HttpError(500, "업로드 URL 생성에 실패했습니다.")

    res.status(200).json({ storagePath, token: data.token })
})
