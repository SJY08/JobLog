import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireUser } from "../_lib/auth"
import { requireMethod, withErrors } from "../_lib/http"
import { searchRegions } from "../_lib/regions"

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET"])) return
    await requireUser(req)

    const q = typeof req.query.q === "string" ? req.query.q : ""
    res.status(200).json(searchRegions(q))
})
