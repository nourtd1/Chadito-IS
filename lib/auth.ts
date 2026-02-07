import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/roles';

export const AUTH_COOKIE_NAME = 'chadito-auth-token';
export const ROLE_COOKIE_NAME = 'chadito-user-role';

export async function login(email: string, password?: string): Promise<{ success: boolean; role?: UserRole; error?: string }> {
    if (!password) {
        return { success: false, error: "Mot de passe requis" };
    }

    try {
        // 1. Authentification Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.user) {
            console.error("Auth Error:", authError);
            return { success: false, error: "Email ou mot de passe incorrect" };
        }

        // 2. Vérification des droits via la table admin_users (RLS permet la lecture de son propre profil)
        // On utilise 'supabase' (client public) car la policy RLS "Admins can view admin_users"
        // autorise l'utilisateur connecté à voir sa propre ligne.
        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        if (adminError || !adminData) {
            console.error("Admin Check Error:", adminError);
            // L'utilisateur est connecté mais n'est pas dans la table admin
            await supabase.auth.signOut();
            return { success: false, error: "Accès non autorisé (Compte Admin requis)" };
        }

        const userRole = adminData.role as UserRole;

        // 3. Persistance (Cookies pour middleware + Session Supabase auto)
        // On stocke le token d'accès pour que le middleware puisse éventuellement le vérifier
        // (bien que le middleware actuel vérifie juste la présence)
        Cookies.set(AUTH_COOKIE_NAME, authData.session?.access_token || 'authenticated', { expires: 1 });
        Cookies.set(ROLE_COOKIE_NAME, userRole, { expires: 1 });

        return { success: true, role: userRole };

    } catch (e) {
        console.error("Login Exception:", e);
        return { success: false, error: "Erreur technique lors de la connexion" };
    }
}

export async function logout() {
    await supabase.auth.signOut();
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
