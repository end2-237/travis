-- =====================================================================
-- Travis — Schéma applicatif complet, isolé dans `travis`
--
-- Contexte : l'instance PostgreSQL est partagée entre plusieurs
-- applications. Travis ne peut donc pas s'installer dans `public`, qui
-- appartient à tout le monde : deux applications y créeraient tôt ou tard
-- une table `orders` ou `partners` et se marcheraient dessus. Tout vit ici
-- dans un schéma nommé, ce qui donne aussi une sauvegarde et une
-- suppression en une seule commande.
--
-- IDEMPOTENT : ce fichier peut être rejoué sans rien casser ni dupliquer.
--
--   psql "$DATABASE_URL" -f supabase/schema-travis.sql
--   psql "$DATABASE_URL" -f supabase/seed-travis.sql
--
-- Ce fichier remplace, pour une instance partagée, les cinq migrations de
-- supabase/migrations/ — qui restent la référence historique du schéma
-- `public` d'une instance dédiée.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Schéma et extensions
--
-- `pgcrypto` fournit gen_random_uuid(). On ne la crée que si elle manque,
-- et surtout on ne la déplace pas : sur une instance partagée, une autre
-- application en dépend peut-être depuis `public` ou `extensions`.
-- ---------------------------------------------------------------------
create schema if not exists travis;

comment on schema travis is
  'Travis — moteur d''admissibilité académique. Instance partagée : ne rien créer hors de ce schéma.';

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pgcrypto') then
    create extension pgcrypto;
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 1. Catalogue des programmes
--
-- Source de vérité applicative : src/data/programs.ts. Cette table en est
-- la projection, alimentée par seed-travis.sql. `slug` est la seule clé
-- exposée dans les URL — un titre change, une URL ne doit pas.
-- ---------------------------------------------------------------------
create table if not exists travis.scholarships (
    id                    uuid primary key default gen_random_uuid(),
    slug                  varchar(120) not null,
    title                 varchar(255) not null,
    country               varchar(100) not null,
    institution           varchar(255),
    degree_levels         text[]       not null,
    eligible_fields       text[]       not null,
    min_gpa_20            numeric(4,2) not null,
    max_age               int,
    funding_coverage      varchar(255),
    deadline_month        varchar(50),
    language_requirements text,
    annual_cost_xaf       numeric(12,2) not null default 0,
    fully_funded          boolean      not null default false,
    application_url       text,
    official_website      text,
    notes                 text,
    is_active             boolean      not null default true,
    created_at            timestamptz  not null default now(),
    constraint scholarships_gpa_range check (min_gpa_20 >= 0 and min_gpa_20 <= 20),
    constraint scholarships_cost_positive check (annual_cost_xaf >= 0)
);

comment on column travis.scholarships.annual_cost_xaf is
  'Reste à charge annuel estimé en FCFA (0 pour une bourse intégrale).';
comment on column travis.scholarships.slug is
  'Identifiant lisible et stable, utilisé dans /destinations/[slug].';
comment on column travis.scholarships.official_website is
  'Racine du site officiel — jamais une URL d''appel à candidatures, trop volatile.';

create unique index if not exists scholarships_slug_key    on travis.scholarships (slug);
create index if not exists scholarships_min_gpa_idx        on travis.scholarships (min_gpa_20);
create index if not exists scholarships_country_idx        on travis.scholarships (country);
create index if not exists scholarships_degrees_idx        on travis.scholarships using gin (degree_levels);
create index if not exists scholarships_fields_idx         on travis.scholarships using gin (eligible_fields);
-- Le moteur ne lit que les programmes actifs : l'index partiel évite de
-- parcourir les fiches retirées du catalogue.
create index if not exists scholarships_active_idx         on travis.scholarships (country, min_gpa_20)
    where is_active;

-- ---------------------------------------------------------------------
-- 2. Profils candidats
--
-- Données personnelles : nom, téléphone, ville, moyenne. Jamais exposées
-- à une clé publique (cf. section RLS).
-- ---------------------------------------------------------------------
create table if not exists travis.student_profiles (
    id               uuid primary key default gen_random_uuid(),
    full_name        varchar(255),
    phone_number     varchar(50)  not null,
    city             varchar(120),
    current_degree   varchar(100) not null,
    field_of_study   varchar(100) not null,
    gpa_score        numeric(4,2) not null,
    max_budget_xaf   numeric(12,2),
    target_countries text[]       not null default '{}',
    language_level   varchar(100),
    /** Slug du programme visé quand l'évaluation porte sur une seule
        opportunité ; NULL pour une évaluation globale. */
    focus_program    varchar(120),
    created_at       timestamptz  not null default now(),
    constraint student_profiles_gpa_range check (gpa_score >= 0 and gpa_score <= 20)
);

create index if not exists student_profiles_created_idx on travis.student_profiles (created_at desc);
create index if not exists student_profiles_phone_idx   on travis.student_profiles (phone_number);
create index if not exists student_profiles_focus_idx   on travis.student_profiles (focus_program)
    where focus_program is not null;

-- ---------------------------------------------------------------------
-- 3. Commandes et rapports
--
-- `match_snapshot` fige le résultat du matching au moment du paiement :
-- le PDF reste reproductible même si le catalogue évolue ensuite. C'est
-- aussi ce qui permet de régénérer un rapport perdu à l'identique.
-- ---------------------------------------------------------------------
create table if not exists travis.orders (
    id                  uuid primary key default gen_random_uuid(),
    profile_id          uuid references travis.student_profiles(id) on delete cascade,
    amount              numeric(10,2) not null default 500.00,
    payment_status      varchar(50)   not null default 'PENDING',
    transaction_ref     varchar(255)  unique,
    provider            varchar(50),
    provider_payload    jsonb,
    pdf_storage_url     text,
    match_snapshot      jsonb,
    admissibility_score int,
    paid_at             timestamptz,
    created_at          timestamptz   not null default now(),
    constraint orders_status_check
        check (payment_status in ('PENDING', 'SUCCESS', 'FAILED')),
    constraint orders_amount_positive check (amount >= 0),
    -- Une commande réglée porte toujours sa date de règlement : sans cette
    -- contrainte, le chiffre d'affaires par période se calcule sur un champ
    -- qui peut être nul, et les totaux ne se recoupent jamais.
    constraint orders_paid_at_present
        check (payment_status <> 'SUCCESS' or paid_at is not null)
);

create index if not exists orders_profile_idx on travis.orders (profile_id);
create index if not exists orders_status_idx  on travis.orders (payment_status);
create index if not exists orders_ref_idx     on travis.orders (transaction_ref);
-- Le tableau de bord agrège le chiffre d'affaires par jour sur les seules
-- commandes réglées.
create index if not exists orders_paid_idx    on travis.orders (paid_at desc)
    where payment_status = 'SUCCESS';

-- ---------------------------------------------------------------------
-- 4. Partenaires commerciaux
--
-- Les démarches officielles vivent dans le code (src/data/services.ts) :
-- elles ne dépendent d'aucun contrat. Cette table ne porte que les
-- partenaires, qui changent au rythme des accords et doivent être
-- éditables sans redéploiement.
-- ---------------------------------------------------------------------
create table if not exists travis.partners (
    id             uuid primary key default gen_random_uuid(),
    slug           varchar(120) not null unique,
    kind           varchar(40)  not null,
    name           varchar(255) not null,
    summary        text,
    status         varchar(20)  not null default 'a_confirmer',
    coverage       text[]       not null default '{}',
    steps          jsonb        not null default '[]'::jsonb,
    bring          text[]       not null default '{}',
    lead_time      varchar(120),
    official_fee   varchar(120),
    service_fee    varchar(120),
    address        text,
    hours          varchar(160),
    phone          varchar(60),
    website        text,
    warning        text,
    /** Commission reversée à Travis, en pourcentage du service. */
    commission_pct numeric(5,2) not null default 0,
    sort_order     int          not null default 0,
    created_at     timestamptz  not null default now(),
    updated_at     timestamptz  not null default now(),
    constraint partners_status_check
        check (status in ('actif', 'a_confirmer', 'suspendu')),
    constraint partners_kind_check
        check (kind in ('etat-civil','legalisation','traduction','apostille',
                        'langue','passeport','medical','photo','financier','visa')),
    constraint partners_commission_range
        check (commission_pct >= 0 and commission_pct <= 100),
    -- Un partenaire « actif » sans adresse ni téléphone est inexploitable :
    -- un candidat qui paie 500 FCFA ne doit jamais tomber sur une fiche
    -- sans guichet. La règle est appliquée côté serveur ; elle l'est aussi
    -- ici, pour qu'un import en masse ne puisse pas la contourner.
    constraint partners_active_reachable
        check (status <> 'actif' or address is not null or phone is not null)
);

create index if not exists partners_kind_idx   on travis.partners (kind);
create index if not exists partners_status_idx on travis.partners (status);
create index if not exists partners_order_idx  on travis.partners (kind, sort_order);

-- ---------------------------------------------------------------------
-- 5. Candidatures partenaires
--
-- Une candidature ne crée jamais de partenaire : elle est examinée, puis
-- le partenaire est référencé depuis le back-office. Un référencement
-- libre publierait des coordonnées non vérifiées.
-- ---------------------------------------------------------------------
create table if not exists travis.partner_applications (
    id            uuid primary key default gen_random_uuid(),
    organisation  varchar(255) not null,
    contact_name  varchar(255) not null,
    email         varchar(255) not null,
    phone         varchar(60)  not null,
    kind          varchar(40)  not null,
    city          varchar(160) not null,
    website       text,
    /** Agrément, inscription à la Cour d'appel, licence : ce qui prouve que
        l'organisation est habilitée à exercer. */
    credentials   text,
    message       text,
    status        varchar(20)  not null default 'nouvelle',
    created_at    timestamptz  not null default now(),
    constraint partner_applications_status_check
        check (status in ('nouvelle', 'en_cours', 'acceptee', 'refusee'))
);

create index if not exists partner_applications_status_idx
    on travis.partner_applications (status, created_at desc);

-- ---------------------------------------------------------------------
-- 6. Audience
--
-- Un événement par page vue ou action notable. Sans cookie ni identifiant
-- stable : on compte des visites, on ne suit pas des personnes.
-- `visitor_hash` est une empreinte journalière non réversible.
-- ---------------------------------------------------------------------
create table if not exists travis.analytics_events (
    id           bigserial primary key,
    kind         varchar(40)  not null,
    path         text,
    /** Programme ou service concerné, quand l'événement en vise un. */
    subject      varchar(160),
    country      varchar(100),
    referrer     text,
    visitor_hash varchar(64),
    created_at   timestamptz  not null default now(),
    constraint analytics_kind_check
        check (kind in ('page_view','program_viewed','evaluation_started',
                        'evaluation_completed','checkout_started','report_generated'))
);

create index if not exists analytics_kind_time_idx on travis.analytics_events (kind, created_at desc);
create index if not exists analytics_country_idx   on travis.analytics_events (country)  where country is not null;
create index if not exists analytics_subject_idx   on travis.analytics_events (subject)  where subject is not null;
create index if not exists analytics_visitor_idx   on travis.analytics_events (visitor_hash, created_at desc);
-- Purge par ancienneté : la table grossit indéfiniment sans elle.
create index if not exists analytics_created_idx   on travis.analytics_events (created_at);

-- ---------------------------------------------------------------------
-- 7. Horodatage de mise à jour
--
-- La fonction vit dans `travis` : en poser une de plus dans `public` sur
-- une instance partagée, c'est écraser celle d'une autre application.
-- ---------------------------------------------------------------------
create or replace function travis.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partners_touch_updated_at on travis.partners;
create trigger partners_touch_updated_at
    before update on travis.partners
    for each row execute function travis.touch_updated_at();

-- ---------------------------------------------------------------------
-- 8. Purge de l'audience
--
-- Rien n'oblige à garder un événement de page vue au-delà d'un an, et une
-- table d'analytique qui ne se purge jamais finit par peser plus lourd que
-- toutes les autres réunies. À appeler depuis un cron :
--     select travis.purge_analytics(365);
-- ---------------------------------------------------------------------
create or replace function travis.purge_analytics(retention_days int default 365)
returns bigint
language plpgsql
as $$
declare
  removed bigint;
begin
  delete from travis.analytics_events
   where created_at < now() - make_interval(days => retention_days);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- ---------------------------------------------------------------------
-- 9. Row Level Security
--
-- Le modèle d'accès est simple et ne change pas avec le schéma : tout ce
-- qui est public est en lecture seule, tout le reste passe par le serveur.
--
--   scholarships / partners  → lecture publique des seules lignes actives
--   student_profiles, orders, partner_applications, analytics_events
--                            → aucun accès public, ni lecture ni écriture
--
-- Les rôles `anon` et `authenticated` n'existent que sur une instance
-- Supabase. Sur un PostgreSQL nu, ce bloc ne s'applique pas — RLS reste
-- activé, ce qui ferme les tables par défaut, et c'est le bon état.
-- ---------------------------------------------------------------------
alter table travis.scholarships         enable row level security;
alter table travis.student_profiles     enable row level security;
alter table travis.orders               enable row level security;
alter table travis.partners             enable row level security;
alter table travis.partner_applications enable row level security;
alter table travis.analytics_events     enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema travis to anon, authenticated;

    grant select on travis.scholarships to anon, authenticated;
    grant select on travis.partners     to anon, authenticated;

    -- Les tables sensibles ne sont même pas atteignables : RLS refuserait
    -- déjà tout, mais retirer le privilège évite de compter sur une seule
    -- ligne de défense.
    revoke all on travis.student_profiles     from anon, authenticated;
    revoke all on travis.orders               from anon, authenticated;
    revoke all on travis.partner_applications from anon, authenticated;
    revoke all on travis.analytics_events     from anon, authenticated;

    drop policy if exists scholarships_public_read on travis.scholarships;
    create policy scholarships_public_read
        on travis.scholarships for select to anon, authenticated
        using (is_active = true);

    drop policy if exists partners_public_read on travis.partners;
    create policy partners_public_read
        on travis.partners for select to anon, authenticated
        using (status = 'actif');
  end if;

  -- service_role contourne RLS ; il lui faut néanmoins le droit d'entrer
  -- dans le schéma, sinon toutes les écritures serveur échouent.
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant usage on schema travis to service_role;
    grant all privileges on all tables    in schema travis to service_role;
    grant all privileges on all sequences in schema travis to service_role;
    alter default privileges in schema travis
      grant all privileges on tables    to service_role;
    alter default privileges in schema travis
      grant all privileges on sequences to service_role;
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 10. Contrôle de santé
--
-- Le pire mode de panne de ce schéma n'est pas une erreur : c'est le
-- silence. Un rôle applicatif soumis à RLS sans politique lit zéro ligne
-- **sans lever d'exception** — l'application affiche alors « aucune
-- correspondance » et rien n'indique que la base est mal configurée.
--
-- À exécuter avec la connexion réelle de l'application, pas en superutilisateur :
--     psql "$DATABASE_URL" -c 'select * from travis.healthcheck();'
--
-- `verdict` doit valoir 'ok' sur les six lignes.
-- ---------------------------------------------------------------------
create or replace function travis.healthcheck()
returns table (controle text, valeur text, verdict text)
language plpgsql
security invoker
as $$
declare
  n_prog   bigint;
  peut_ecrire boolean := false;
  id_test  uuid;
begin
  controle := 'rôle de connexion'; valeur := current_user; verdict := 'ok';
  return next;

  controle := 'search_path'; valeur := current_setting('search_path');
  verdict := case when current_setting('search_path') like '%travis%' then 'ok'
                  else 'À CORRIGER — ajoutez travis au search_path' end;
  return next;

  controle := 'contournement RLS'; valeur := coalesce((
      select case when rolbypassrls then 'oui' else 'non' end
        from pg_roles where rolname = current_user), 'inconnu');
  verdict := case
    when (select rolsuper or rolbypassrls from pg_roles where rolname = current_user) then 'ok'
    when exists (select 1 from pg_policies where schemaname = 'travis') then 'ok — via politiques'
    else 'À CORRIGER — ce rôle lira zéro ligne en silence' end;
  return next;

  select count(*) into n_prog from travis.scholarships where is_active;
  controle := 'catalogue lisible'; valeur := n_prog || ' programme(s)';
  verdict := case when n_prog > 0 then 'ok'
                  else 'À CORRIGER — seed non chargé, ou RLS bloque la lecture' end;
  return next;

  begin
    insert into travis.student_profiles
      (phone_number, current_degree, field_of_study, gpa_score)
    values ('+000000000', 'healthcheck', 'healthcheck', 0)
    returning id into id_test;
    delete from travis.student_profiles where id = id_test;
    peut_ecrire := true;
  exception when others then
    peut_ecrire := false;
  end;
  controle := 'écriture d''un profil'; valeur := case when peut_ecrire then 'possible' else 'refusée' end;
  verdict := case when peut_ecrire then 'ok' else 'À CORRIGER — privilèges ou RLS' end;
  return next;

  controle := 'isolation'; valeur := (
    select count(*)::text || ' table(s) Travis hors du schéma'
      from information_schema.tables
     where table_schema = 'public'
       and table_name in ('scholarships','student_profiles','orders',
                          'partners','partner_applications','analytics_events'));
  verdict := case when valeur like '0 %' then 'ok'
                  else 'ATTENTION — des tables Travis traînent dans public' end;
  return next;
end;
$$;

commit;

-- =====================================================================
-- 11. Ce qui reste à faire hors de ce fichier
-- =====================================================================
--
-- a) RÔLE APPLICATIF — le point qui fait échouer silencieusement une
--    installation. Voir supabase/role-travis-app.sql, à exécuter une fois
--    en superutilisateur :
--
--      psql "$SUPERUSER_URL" -v mot_de_passe="'…'" -f supabase/role-travis-app.sql
--
--    Ce rôle a besoin de BYPASSRLS. Ce n'est pas un relâchement : c'est le
--    strict équivalent de `service_role` chez Supabase. Toute l'autorisation
--    de Travis est portée par le serveur applicatif — la base n'a aucune
--    notion de « l'utilisateur courant », donc aucune politique RLS ne peut
--    exprimer la règle. Sans BYPASSRLS, ce rôle lit zéro ligne **sans
--    erreur** et l'application affiche un catalogue vide.
--
--    RLS garde tout son sens sur une instance partagée : elle ferme les
--    tables à tous les AUTRES rôles — appli voisine, analyste en lecture,
--    `anon` de PostgREST.
--
--    DATABASE_URL correspondant :
--      postgresql://travis_app:MOT_DE_PASSE@HOTE:5432/BASE?options=-csearch_path%3Dtravis
--
--    Puis vérifiez, avec cette URL exactement :
--      psql "$DATABASE_URL" -c 'select * from travis.healthcheck();'
--
-- b) SI L'APPLICATION PASSE PAR supabase-js (PostgREST), et non par une
--    connexion PostgreSQL directe : le schéma doit être exposé. Sur le
--    conteneur PostgREST / Supabase self-hosted :
--
--      PGRST_DB_SCHEMAS=public,travis
--
--    puis : psql -c "notify pgrst, 'reload config';"
--    Côté application : SUPABASE_DB_SCHEMA=travis
--
--    `service_role` contourne déjà RLS et a reçu ses privilèges plus haut :
--    rien d'autre à faire.
--
-- c) STOCKAGE DES RAPPORTS. Les compartiments Supabase Storage sont communs
--    à toute l'instance : le nom doit porter celui de l'application, sinon
--    deux projets se disputent « reports ».
--
--      insert into storage.buckets (id, name, public)
--      values ('travis-reports', 'travis-reports', false)
--      on conflict (id) do nothing;
--
--    Côté application : SUPABASE_STORAGE_BUCKET=travis-reports
--    Sans Supabase Storage, laissez la variable vide : l'application
--    régénère le PDF à la demande depuis `match_snapshot`, ce qui est
--    reproductible au bit près.
--
-- d) PURGE DE L'AUDIENCE, une fois par mois :
--      select travis.purge_analytics(365);
--
-- e) SAUVEGARDE d'un seul schéma, sans toucher aux voisins :
--      pg_dump "$DATABASE_URL" --schema=travis --no-owner > travis.sql
