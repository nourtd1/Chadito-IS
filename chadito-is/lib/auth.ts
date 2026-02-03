import Cookies from 'js-cookie';
import { UserRole, ROLES } from '@/types/roles';

const MOCK_USERS: Record<string, UserRole> = {
    'admin@chadito.com': 'super_admin',
    'docs@chadito.com': 'moderator_docs',
    'ads@chadito.com': 'moderator_ads',
    'analyst@chadito.com': 'analyst',
};

export const AUTH_COOKIE_NAME = 'chadito-auth-token';
export const ROLE_COOKIE_NAME = 'chadito-user-role';

export async function login(email: string): Promise<{ success: boolean; role?: UserRole }> {
    // Simulation d'un appel API / Supabase
    await new Promise(resolve => setTimeout(resolve, 500));

    const role = MOCK_USERS[email];

    if (role) {
        Cookies.set(AUTH_COOKIE_NAME, 'mock-token-' + Date.now(), { expires: 1 });
        Cookies.set(ROLE_COOKIE_NAME, role, { expires: 1 });
        return { success: true, role };
    }

    return { success: false };
}

export function logout() {
    Cookies.remove(AUTH_COOKIE_NAME);
    Cookies.remove(ROLE_COOKIE_NAME);
    window.location.href = '/login';
}

export function getCurrentRole(): UserRole | null {
    return Cookies.get(ROLE_COOKIE_NAME) as UserRole || null;
}

export function isAuthenticated(): boolean {
    return !!Cookies.get(AUTH_COOKIE_NAME);
}
