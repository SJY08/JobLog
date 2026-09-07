/**
 * @description supabase/schema.sql과 대응하는 최소 타입 정의 (수동 작성 — 컬럼을 바꾸면 같이 수정할 것)
 */
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    google_sub: string
                    name: string
                    email: string
                    school: string
                    initial: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    google_sub: string
                    name: string
                    email: string
                    school?: string
                    initial: string
                    created_at?: string
                }
                Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
                Relationships: []
            }
            applications: {
                Row: {
                    id: string
                    user_id: string
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
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    platform?: string
                    company: string
                    region?: unknown
                    position: string
                    applied_at: string
                    viewed?: boolean
                    viewed_at?: string | null
                    posting_status: string
                    apply_status: string
                    link?: string
                    memo?: string
                    updated_at?: string
                    created_at?: string
                }
                Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>
                Relationships: []
            }
            stored_files: {
                Row: {
                    id: string
                    user_id: string
                    kind: string
                    label: string
                    file_name: string
                    mime_type: string
                    size: number
                    storage_path: string
                    uploaded_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    kind: string
                    label: string
                    file_name: string
                    mime_type: string
                    size: number
                    storage_path: string
                    uploaded_at?: string
                }
                Update: Partial<Database["public"]["Tables"]["stored_files"]["Insert"]>
                Relationships: []
            }
            cover_letters: {
                Row: {
                    user_id: string
                    applicant_name: string
                    target_company: string
                    target_position: string
                    sections: unknown
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    applicant_name?: string
                    target_company?: string
                    target_position?: string
                    sections?: unknown
                    updated_at?: string
                }
                Update: Partial<Database["public"]["Tables"]["cover_letters"]["Insert"]>
                Relationships: []
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
    }
}
