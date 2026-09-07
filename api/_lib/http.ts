import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * @description 의도적으로 특정 HTTP 상태 코드로 응답을 끝내기 위한 에러
 */
export class HttpError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

/**
 * @description 메서드가 허용된 목록에 있는지 확인하는 함수
 */
export function requireMethod(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
    if (!methods.includes(req.method ?? "")) {
        res.setHeader("Allow", methods.join(", "))
        res.status(405).json({ message: "허용되지 않은 메서드입니다." })
        return false
    }
    return true
}

/**
 * @description 서버리스 함수 핸들러를 감싸 에러를 일관된 응답으로 바꾸는 함수
 */
export function withErrors(
    handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
    return async (req, res) => {
        try {
            await handler(req, res)
        } catch (err) {
            if (err instanceof HttpError) {
                res.status(err.status).json({ message: err.message })
                return
            }
            console.error(err)
            res.status(500).json({ message: "서버 오류가 발생했습니다." })
        }
    }
}
