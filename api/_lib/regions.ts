import { RAW_REGIONS } from "../../src/entities/region/model/data"

/**
 * @description 시도명을 줄이는 함수 (src/entities/region/api/regionApi.ts와 동일 로직)
 */
function shortSido(sido: string): string {
    return sido
        .replace("특별자치시", "")
        .replace("특별자치도", "")
        .replace("특별시", "")
        .replace("광역시", "")
        .replace("충청남도", "충남")
        .replace("충청북도", "충북")
        .replace("경상남도", "경남")
        .replace("경상북도", "경북")
        .replace("전라남도", "전남")
        .replace("경기도", "경기")
}

/**
 * @description 행정구역을 검색하는 함수 (서버용, 최대 40건)
 */
export function searchRegions(query: string) {
    const tokens = query.trim().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return RAW_REGIONS.slice(0, 12)
    return RAW_REGIONS.filter((r) => {
        const haystack = `${r.sido} ${r.sigungu} ${r.dong} ${shortSido(r.sido)}`
        return tokens.every((t) => haystack.includes(t))
    }).slice(0, 40)
}
