-- Fonction pour récupérer les stats par catégorie (pour le Pie Chart)
create or replace function get_category_stats()
returns table (name text, value bigint) 
language sql
security definer
as $$
  select category as name, count(*) as value
  from listings
  where status = 'active'
  group by category
  order by value desc;
$$;

-- Fonction pour récupérer les inscriptions des 30 derniers jours (pour le Line Chart)
create or replace function get_registration_stats()
returns table (date text, value bigint) 
language sql
security definer
as $$
  select to_char(created_at, 'DD/MM'), count(*)
  from users
  where created_at > (now() - interval '30 days')
  group by to_char(created_at, 'DD/MM')
  order by to_char(created_at, 'DD/MM');
$$;

-- Fonction pour récupérer le top des villes (pour le Bar Chart)
create or replace function get_city_stats()
returns table (name text, value bigint) 
language sql
security definer
as $$
  select city as name, count(*) as value
  from listings
  where status = 'active' and city is not null
  group by city
  order by value desc
  limit 5;
$$;
