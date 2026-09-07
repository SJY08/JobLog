import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireUser, toPublicUser } from "../_lib/auth.js"
import { requireMethod, withErrors } from "../_lib/http.js"

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["GET"])) return
    const user = await requireUser(req)
    res.status(200).json(toPublicUser(user))
})
