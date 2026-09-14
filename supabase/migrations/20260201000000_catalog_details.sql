-- =====================================================================
-- Travis — Détail des offres
--
-- La page de résultats ne masque plus les programmes : elle les présente
-- intégralement, et chaque fiche a désormais sa page dédiée. Le catalogue
-- gagne donc un identifiant d'URL et le site officiel du programme.
-- =====================================================================

alter table public.scholarships
    add column if not exists slug             varchar(120),
    add column if not exists official_website text;

-- Renseigner les slugs manquants à partir du titre, pour que la contrainte
-- d'unicité puisse s'appliquer sur une base déjà peuplée.
update public.scholarships
   set slug = regexp_replace(
                 lower(translate(title,
                   'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ',
                   'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY')),
                 '[^a-z0-9]+', '-', 'g')
 where slug is null;

update public.scholarships
   set slug = trim(both '-' from slug)
 where slug like '-%' or slug like '%-';

-- Départager d'éventuels doublons avant de poser l'index unique.
with ranked as (
    select id, slug,
           row_number() over (partition by slug order by created_at, id) as rn
      from public.scholarships
)
update public.scholarships s
   set slug = s.slug || '-' || ranked.rn
  from ranked
 where ranked.id = s.id and ranked.rn > 1;

alter table public.scholarships
    alter column slug set not null;

create unique index if not exists scholarships_slug_key
    on public.scholarships (slug);

-- L'ancienne clé (title, country) cède la place au slug, seul identifiant
-- stable exposé dans les URL.
drop index if exists scholarships_title_country_key;

comment on column public.scholarships.slug is
    'Identifiant lisible et stable, utilisé dans /destinations/[slug].';
comment on column public.scholarships.official_website is
    'Racine du site officiel du programme — jamais une URL d''appel à candidatures, trop volatile.';
