-- =====================================================================
-- Travis — Schéma initial
-- Moteur SaaS d'admissibilité académique et d'orientation internationale
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Bourses / Établissements
-- ---------------------------------------------------------------------
create table if not exists public.scholarships (
    id                    uuid primary key default gen_random_uuid(),
    title                 varchar(255) not null,
    country               varchar(100) not null,
    degree_levels         text[]       not null,           -- ex: ['Licence', 'Master']
    eligible_fields       text[]       not null,           -- ex: ['Informatique', 'Génie Civil']
    min_gpa_20            numeric(4,2) not null,           -- ex: 12.50
    max_age               int,
    funding_coverage      varchar(255),                    -- ex: '100% Scolarité + Allocation'
    deadline_month        varchar(50),
    language_requirements text,
    -- Colonnes complémentaires exploitées par le moteur de matching et le PDF
    institution           varchar(255),
    annual_cost_xaf       numeric(12,2) not null default 0,
    fully_funded          boolean      not null default false,
    application_url       text,
    notes                 text,
    is_active             boolean      not null default true,
    created_at            timestamptz  not null default now()
);

comment on column public.scholarships.annual_cost_xaf is
    'Reste à charge annuel estimé en FCFA (0 pour une bourse intégrale).';

create index if not exists scholarships_min_gpa_idx    on public.scholarships (min_gpa_20);
create index if not exists scholarships_country_idx    on public.scholarships (country);
create index if not exists scholarships_degrees_idx    on public.scholarships using gin (degree_levels);
create index if not exists scholarships_fields_idx     on public.scholarships using gin (eligible_fields);

-- ---------------------------------------------------------------------
-- 2. Profils candidats & simulations
-- ---------------------------------------------------------------------
create table if not exists public.student_profiles (
    id               uuid primary key default gen_random_uuid(),
    full_name        varchar(255),
    phone_number     varchar(50)  not null,
    current_degree   varchar(100) not null,
    field_of_study   varchar(100) not null,
    gpa_score        numeric(4,2) not null,
    max_budget_xaf   numeric(12,2),
    -- Collecté à l'écran 1 et 3 du formulaire d'évaluation
    city             varchar(120),
    target_countries text[]       not null default '{}',
    language_level   varchar(100),
    created_at       timestamptz  not null default now(),
    constraint student_profiles_gpa_range check (gpa_score >= 0 and gpa_score <= 20)
);

create index if not exists student_profiles_created_idx on public.student_profiles (created_at desc);
create index if not exists student_profiles_phone_idx   on public.student_profiles (phone_number);

-- ---------------------------------------------------------------------
-- 3. Transactions & PDF générés
-- ---------------------------------------------------------------------
create table if not exists public.orders (
    id                  uuid primary key default gen_random_uuid(),
    profile_id          uuid references public.student_profiles(id) on delete cascade,
    amount              numeric(10,2) not null default 500.00,
    payment_status      varchar(50)   not null default 'PENDING',  -- PENDING, SUCCESS, FAILED
    transaction_ref     varchar(255)  unique,
    provider            varchar(50),                                -- monetbil | payunit | kadevpay
    provider_payload    jsonb,
    pdf_storage_url     text,
    -- Instantané du matching : garantit un PDF reproductible même si le
    -- catalogue évolue entre le paiement et la (re)génération du rapport.
    match_snapshot      jsonb,
    admissibility_score int,
    paid_at             timestamptz,
    created_at          timestamptz   not null default now(),
    constraint orders_status_check
        check (payment_status in ('PENDING', 'SUCCESS', 'FAILED'))
);

create index if not exists orders_profile_idx on public.orders (profile_id);
create index if not exists orders_status_idx  on public.orders (payment_status);
create index if not exists orders_ref_idx     on public.orders (transaction_ref);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- Le catalogue de bourses est public en lecture ; profils et commandes ne
-- sont jamais exposés aux clés anon/authenticated. Toutes les écritures
-- passent par les Server Actions et les webhooks, qui utilisent la clé
-- service_role (laquelle contourne RLS).

alter table public.scholarships    enable row level security;
alter table public.student_profiles enable row level security;
alter table public.orders           enable row level security;

drop policy if exists "scholarships_public_read" on public.scholarships;
create policy "scholarships_public_read"
    on public.scholarships
    for select
    to anon, authenticated
    using (is_active = true);

-- Aucune politique sur student_profiles ni orders : tout accès via une clé
-- anon/authenticated est refusé par défaut une fois RLS activé.

revoke all on public.student_profiles from anon, authenticated;
revoke all on public.orders           from anon, authenticated;

-- ---------------------------------------------------------------------
-- Stockage des rapports PDF
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;
