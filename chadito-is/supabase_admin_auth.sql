-- 1. Création de la table des rôles Admin
create table public.admin_users (
  id uuid references auth.users not null primary key,
  email text not null,
  role text not null check (role in ('super_admin', 'moderator_docs', 'moderator_ads', 'analyst')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active la sécurité
alter table public.admin_users enable row level security;

-- 2. Politique de sécurité : Les admins peuvent voir la liste des admins
create policy "Admins can view admin_users" on public.admin_users for select using (auth.uid() = id);

-- 3. Fonction utilitaire pour vérifier si un user est admin (pour les politiques RLS futures)
create or replace function public.is_admin() 
returns boolean 
language sql 
security definer 
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- 4. INSERTION DU PREMIER SUPER ADMIN (Important pour ne pas être bloqué dehors)
-- Note: Remplace 'TON_EMAIL_ADMIN_EXISTANT' par ton vrai email de compte Supabase si tu en as un,
-- sinon tu devras t'inscrire manuellement via le panneau Supabase Auth.
-- Pour l'instant, on prépare juste la structure.
