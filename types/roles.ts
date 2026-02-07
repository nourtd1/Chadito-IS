export type UserRole = 'super_admin' | 'moderator_docs' | 'moderator_ads' | 'analyst';

export interface UserProfile {
    email: string;
    role: UserRole;
    name: string;
}

export const ROLES: Record<string, UserRole> = {
    SUPER_ADMIN: 'super_admin',
    MODERATOR_DOCS: 'moderator_docs',
    MODERATOR_ADS: 'moderator_ads',
    ANALYST: 'analyst',
};

export const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    moderator_docs: 'Modérateur Docs',
    moderator_ads: 'Modérateur Annonces',
    analyst: 'Analyste',
};
