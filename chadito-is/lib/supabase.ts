import { createClient } from '@supabase/supabase-js'

// Valeurs par défaut pour éviter le crash au build/start si les variables manquent
// Cela permet à l'interface de charger et d'utiliser les données mockées
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️ ATTENTION : Supabase URL manquante. L\'application utilise un client mocké.')
}

// Client Admin avec contournement RLS (Role Service)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
