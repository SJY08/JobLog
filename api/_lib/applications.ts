interface ApplicationRow {
    id: string
    platform: string
    company: string
    region: unknown
    position: string
    applied_at: string
    viewed: boolean
    viewed_at: string | null
    posting_status: string
    apply_status: string
    link: string
    memo: string
    updated_at: string
}

type RegionValue = { sido: string; sigungu: string; dong: string; code: string } | null

/**
 * @description DB 행을 API 응답용 Application으로 바꾸는 함수
 */
export function toApplication(row: ApplicationRow) {
    return {
        id: row.id,
        platform: row.platform,
        company: row.company,
        region: row.region as RegionValue,
        position: row.position,
        appliedAt: row.applied_at,
        viewed: row.viewed,
        viewedAt: row.viewed_at,
        postingStatus: row.posting_status,
        applyStatus: row.apply_status,
        link: row.link,
        memo: row.memo,
        updatedAt: row.updated_at,
    }
}

/**
 * @description 요청 바디(camelCase)를 DB 컬럼(snake_case)으로 바꾸는 함수. 넘어온 키만 매핑함(부분 수정용)
 */
export function fromApplicationInput(body: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    if ("platform" in body) out.platform = body.platform
    if ("company" in body) out.company = body.company
    if ("region" in body) out.region = body.region
    if ("position" in body) out.position = body.position
    if ("appliedAt" in body) out.applied_at = body.appliedAt
    if ("viewed" in body) out.viewed = body.viewed
    if ("viewedAt" in body) out.viewed_at = body.viewedAt
    if ("postingStatus" in body) out.posting_status = body.postingStatus
    if ("applyStatus" in body) out.apply_status = body.applyStatus
    if ("link" in body) out.link = body.link
    if ("memo" in body) out.memo = body.memo
    return out
}
