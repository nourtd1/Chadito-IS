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
    listing_id: string;
    reported_by: string;
    reason: string;
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
