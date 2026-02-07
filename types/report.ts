export type ReportReason = 'spam' | 'inappropriate' | 'scam' | 'duplicate' | 'other';

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    seller_id: string;
    seller_name: string; // Simplification pour l'affichage
}

export interface Report {
    id: string;
    created_at: string;
    reason: ReportReason;
    description?: string; // Détail optionnel du signalement
    status: 'pending' | 'resolved' | 'dismissed';
    product_id: string;
    reporter_id: string;

    // Jointure (mockée ou réelle)
    product?: Product;
}
