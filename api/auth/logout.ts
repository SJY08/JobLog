import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireMethod, withErrors } from "../_lib/http"

export default withErrors(async (req: VercelRequest, res: VercelResponse) => {
    if (!requireMethod(req, res, ["POST"])) return
    // 상태 없는(stateless) JWT라 서버에서 별도로 무효화하지 않음 — 클라이언트가 토큰을 지우면 끝.
    res.status(204).end()
})
