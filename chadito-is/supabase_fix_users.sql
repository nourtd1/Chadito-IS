-- SCRIPT DE SYNCHRONISATION (AUTH -> PUBLIC.USERS)

-- 1. Transférer les utilisateurs existants de 'auth.users' (le système de login) vers 'public.users' (ta table de données).
-- Cela permet de récupérer tous ceux qui se sont déjà inscrits.
INSERT INTO public.users (id, email, created_at, full_name)
SELECT 
    id, 
    email, 
    created_at,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Utilisateur sans nom') as full_name
FROM auth.users
ON CONFLICT (id) DO NOTHING; -- Ne rien faire si l'utilisateur existe déjà dans public.users

-- 2. Mettre en place un TRIGGER pour automatiser ça pour les futurs inscrits
-- Création de la fonction de copie
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Création du déclencheur (Trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
