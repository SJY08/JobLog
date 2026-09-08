import { HttpError } from "./http.js"

const KAKAO_ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json"

/**
 * @description 카카오가 내려주는 시도명을 기존 데이터와 같은 정식 명칭으로 맞추는 표
 */
const SIDO_ALIASES: Record<string, string> = {
    서울: "서울특별시",
    부산: "부산광역시",
    대구: "대구광역시",
    인천: "인천광역시",
    광주: "광주광역시",
    대전: "대전광역시",
    울산: "울산광역시",
    경기: "경기도",
    충북: "충청북도",
    충남: "충청남도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
}

function normalizeSido(sido: string): string {
    return SIDO_ALIASES[sido] ?? sido
}

interface KakaoAddressDocument {
    address: {
        region_1depth_name: string
        region_2depth_name: string
        region_3depth_name: string
        b_code: string
    } | null
}

interface KakaoAddressResponse {
    documents: KakaoAddressDocument[]
}

export interface RegionResult {
    code: string
    sido: string
    sigungu: string
    dong: string
}

function apiKey(): string {
    const key = process.env.KAKAO_REST_API_KEY
    if (!key) throw new Error("KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.")
    return key
}

/**
 * @description 카카오 로컬 API로 행정구역을 검색하는 함수
 */
export async function searchRegions(query: string): Promise<RegionResult[]> {
    const q = query.trim()
    if (!q) return []

    const url = new URL(KAKAO_ADDRESS_SEARCH_URL)
    url.searchParams.set("query", q)
    url.searchParams.set("size", "30")

    const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${apiKey()}` },
    })
    if (!res.ok) throw new HttpError(502, "지역 검색에 실패했습니다.")

    const { documents } = (await res.json()) as KakaoAddressResponse

    const seen = new Set<string>()
    const regions: RegionResult[] = []
    for (const doc of documents) {
        const addr = doc.address
        if (!addr || !addr.region_3depth_name) continue

        const code = addr.b_code || `${addr.region_1depth_name}-${addr.region_2depth_name}-${addr.region_3depth_name}`
        if (seen.has(code)) continue
        seen.add(code)

        regions.push({
            code,
            sido: normalizeSido(addr.region_1depth_name),
            sigungu: addr.region_2depth_name,
            dong: addr.region_3depth_name,
        })
    }
    return regions.slice(0, 40)
}
