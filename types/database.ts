export type AccountType = 'standard' | 'merchant';
export type ListingStatus = 'active' | 'sold' | 'paused';

export interface User {
    id: string; // uuid
    email: string;
    full_name: string;
    account_type: AccountType;
    is_verified: boolean;
    avatar_url: string;
    nni_number: string;
    created_at: string;
    city?: string; // Explicitly requested for filtering
    address?: string; // Full address from mobile app
    nni_document_path?: string; // Path to ID document in 'documents' bucket
}

export interface Listing {
    id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
    city: string;
    status: ListingStatus;
    user_id: string;
}

export interface Report {
    id: string;
    target_id: string;
    target_type: 'product' | 'user';
    reporter_id: string;
    reason: string;
    description?: string;
    status: string; // 'pending' | 'resolved' | 'dismissed'
    created_at: string;
}

export interface ReportJoined extends Report {
    listing?: {
        title: string;
        images: string[];
    };
    reporter?: {
        email: string;
    };
}

export interface MerchantApplication {
    id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    document_url: string;
    created_at: string;
}

export interface MerchantApplicationJoined extends MerchantApplication {
    users: User; // Assuming single user relation
}
