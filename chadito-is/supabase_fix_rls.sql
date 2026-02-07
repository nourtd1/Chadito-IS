-- Assure que RLS est activé
alter table public.users enable row level security;

-- Nettoyage des anciennes politiques (pour éviter l'erreur "already exists")
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Admins can view all profiles" on public.users;
drop policy if exists "Admins can update all profiles" on public.users;
drop policy if exists "Admins can view all documents" on storage.objects;

-- Politique 1 : L'utilisateur peut voir son propre profil
create policy "Users can view own profile"
  on public.users for select
  using ( auth.uid() = id );

-- Politique 2 : L'utilisateur peut modifier son propre profil
create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- SUPER ADMINS
create policy "Admins can view all profiles"
  on public.users for select
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid()
    )
  );

create policy "Admins can update all profiles"
  on public.users for update
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid()
    )
  );

-- STORAGE (Documents)
create policy "Admins can view all documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    AND
    exists (
      select 1 from public.admin_users
      where id = auth.uid()
    )
  );
