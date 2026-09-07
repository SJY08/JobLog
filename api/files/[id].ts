import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireUser } from "../_lib/auth.js"
import { FILES_BUCKET, toStoredFile } from "../_lib/files.js"
import { HttpError, requireMethod, withErrors } from "../_lib/http.js"
import { getSupabase } from "../_lib/supabase.js"

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["PATCH", "DELETE"])) return
    const user = await requireUser(req)
    const id = typeof req.query.id === "string" ? req.query.id : ""
    const supabase = getSupabase()

    if (req.method === "PATCH") {
        const body = (req.body ?? {}) as { label?: string; kind?: string }
        const patch: { label?: string; kind?: string } = {}
        if ("label" in body) patch.label = body.label
        if ("kind" in body) patch.kind = body.kind

        const { data, error } = await supabase
            .from("stored_files")
            .update(patch)
            .eq("user_id", user.id)
            .eq("id", id)
            .select("*")
            .maybeSingle()
        if (error || !data) throw new HttpError(404, "없음")
        res.status(200).json(await toStoredFile(data))
        return
    }

    const { data: existing } = await supabase
        .from("stored_files")
        .select("storage_path")
        .eq("user_id", user.id)
        .eq("id", id)
        .maybeSingle()
    if (!existing) throw new HttpError(404, "없음")

    await supabase.storage.from(FILES_BUCKET).remove([existing.storage_path])
    const { error } = await supabase.from("stored_files").delete().eq("user_id", user.id).eq("id", id)
    if (error) throw new HttpError(500, "삭제에 실패했습니다.")
    res.status(204).end()
})
