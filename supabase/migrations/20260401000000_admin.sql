-- =====================================================================
-- Travis — Back-office
--
-- Trois besoins : gérer les partenaires depuis l'interface, mesurer
-- l'audience et les destinations demandées, suivre le chiffre d'affaires.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Partenaires et services
--
-- Le catalogue de services vit dans le code (src/data/services.ts) pour la
-- partie « démarche officielle », qui ne dépend d'aucun contrat. Cette table
-- porte les partenaires commerciaux, qui eux changent au rythme des accords
-- et doivent être éditables sans redéploiement.
-- ---------------------------------------------------------------------
create table if not exists public.partners (
    id            uuid primary key default gen_random_uuid(),
    slug          varchar(120) not null unique,
    kind          varchar(40)  not null,      -- legalisation, traduction, visa…
    name          varchar(255) not null,
    summary       text,
    status        varchar(20)  not null default 'a_confirmer',
    coverage      text[]       not null default '{}',
    steps         jsonb        not null default '[]'::jsonb,
    bring         text[]       not null default '{}',
    lead_time     varchar(120),
    official_fee  varchar(120),
    service_fee   varchar(120),
    address       text,
    hours         varchar(160),
    phone         varchar(60),
    website       text,
    warning       text,
    -- Commission reversée à Travis, en pourcentage du service.
    commission_pct numeric(5,2) not null default 0,
    sort_order    int          not null default 0,
    created_at    timestamptz  not null default now(),
    updated_at    timestamptz  not null default now(),
    constraint partners_status_check
        check (status in ('actif', 'a_confirmer', 'suspendu'))
);

create index if not exists partners_kind_idx   on public.partners (kind);
create index if not exists partners_status_idx on public.partners (status);

-- ---------------------------------------------------------------------
-- 2. Audience
--
-- Un événement par page vue ou action notable. Volontairement sans cookie
-- ni identifiant stable : on compte des visites, on ne suit pas des
-- personnes. `visitor_hash` est une empreinte journalière non réversible,
-- suffisante pour dédupliquer une session sans constituer un profil.
-- ---------------------------------------------------------------------
create table if not exists public.analytics_events (
    id           bigserial primary key,
    kind         varchar(40)  not null,      -- page_view, evaluation, order…
    path         text,
    /** Programme ou pays concerné, quand l'événement en vise un. */
    subject      varchar(160),
    country      varchar(100),
    referrer     text,
    visitor_hash varchar(64),
    created_at   timestamptz  not null default now()
);

create index if not exists analytics_kind_time_idx
    on public.analytics_events (kind, created_at desc);
create index if not exists analytics_country_idx
    on public.analytics_events (country)
    where country is not null;
create index if not exists analytics_subject_idx
    on public.analytics_events (subject)
    where subject is not null;
create index if not exists analytics_visitor_idx
    on public.analytics_events (visitor_hash, created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Partenaires : lecture publique des seuls partenaires actifs, puisque
-- l'interface les affiche. Écriture réservée au service_role.
-- Audience : aucun accès anon — ni lecture ni écriture. Les événements sont
-- écrits par une route serveur, qui utilise la clé de service.
-- ---------------------------------------------------------------------
alter table public.partners         enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "partners_public_read" on public.partners;
create policy "partners_public_read"
    on public.partners
    for select
    to anon, authenticated
    using (status = 'actif');

revoke all on public.analytics_events from anon, authenticated;

-- Horodatage de mise à jour
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partners_touch_updated_at on public.partners;
create trigger partners_touch_updated_at
    before update on public.partners
    for each row execute function public.touch_updated_at();
