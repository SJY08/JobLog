const TOKEN_KEY = "joblog-token"

/**
 * @description 저장된 세션 토큰을 읽는 함수
 */
export function getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY)
}

/**
 * @description 세션 토큰을 저장하는 함수
 */
export function setToken(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token)
}

/**
 * @description 세션 토큰을 지우는 함수
 */
export function clearToken(): void {
    window.localStorage.removeItem(TOKEN_KEY)
}

/**
 * @description API 응답이 실패했을 때 던지는 에러
 */
export class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

interface RequestOptions {
    method?: string
    body?: unknown
    query?: Record<string, string | number | undefined>
    formData?: FormData
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = new URL(`/api${path}`, window.location.origin)
    if (opts.query) {
        for (const [key, value] of Object.entries(opts.query)) {
            if (value !== undefined && value !== "") url.searchParams.set(key, String(value))
        }
    }

    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`

    let body: BodyInit | undefined
    if (opts.formData) {
        body = opts.formData
    } else if (opts.body !== undefined) {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(opts.body)
    }

    const res = await fetch(url.toString(), { method: opts.method ?? "GET", headers, body })
    if (res.status === 204) return undefined as T

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, (data && data.message) || "요청에 실패했습니다.")
    return data as T
}

export const api = {
    get: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { method: "GET", query }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
    del: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { method: "DELETE", query }),
    upload: <T>(path: string, formData: FormData) => request<T>(path, { method: "POST", formData }),
}
