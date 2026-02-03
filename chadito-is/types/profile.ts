export type Profile = {
    id: string
    created_at: string
    email: string
    first_name: string | null
    last_name: string | null
    phone?: string | null
    city?: string | null
    verification_status: 'pending' | 'verified' | 'rejected' | 'none'
    verification_rejection_reason?: string | null
    id_card_url?: string | null
    role: 'seller' | 'user'
    status: 'active' | 'suspended' | 'banned'
    // Champs calculés ou joints pour l'admin
    ads_count?: number
    reports_count?: number
}
