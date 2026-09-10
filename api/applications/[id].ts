import type { VercelRequest, VercelResponse } from "@vercel/node"
import { fromApplicationInput, toApplication } from "../_lib/applications.js"
import { requireUserId } from "../_lib/auth.js"
import { HttpError, requireMethod, withErrors } from "../_lib/http.js"
import { getSupabase } from "../_lib/supabase.js"

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET", "PATCH"])) return
    const userId = requireUserId(req)
    const id = typeof req.query.id === "string" ? req.query.id : ""

    const supabase = getSupabase()

    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", userId)
            .eq("id", id)
            .maybeSingle()
        if (error || !data) throw new HttpError(404, "없음")
        res.status(200).json(toApplication(data))
        return
    }

    const patch = fromApplicationInput((req.body ?? {}) as Record<string, unknown>)
    const { data, error } = await supabase
        .from("applications")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("id", id)
        .select("*")
        .maybeSingle()

    if (error || !data) throw new HttpError(404, "없음")
    res.status(200).json(toApplication(data))
})
