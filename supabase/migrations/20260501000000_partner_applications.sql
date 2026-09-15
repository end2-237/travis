-- =====================================================================
-- Travis — Candidatures partenaires
--
-- Alimente /devenir-partenaire. Les candidatures ne créent pas de
-- partenaire : elles sont examinées, puis le partenaire est référencé
-- depuis le back-office. Une inscription libre publierait des coordonnées
-- non vérifiées à des candidats qui s'y déplaceraient.
-- =====================================================================

create table if not exists public.partner_applications (
    id            uuid primary key default gen_random_uuid(),
    organisation  varchar(255) not null,
    contact_name  varchar(255) not null,
    email         varchar(255) not null,
    phone         varchar(60)  not null,
    kind          varchar(40)  not null,
    city          varchar(160) not null,
    website       text,
    /** Agrément, inscription à la Cour d'appel, licence : ce qui prouve
        que l'organisation est habilitée à exercer. */
    credentials   text,
    message       text,
    status        varchar(20)  not null default 'nouvelle',
    created_at    timestamptz  not null default now(),
    constraint partner_applications_status_check
        check (status in ('nouvelle', 'en_cours', 'acceptee', 'refusee'))
);

create index if not exists partner_applications_status_idx
    on public.partner_applications (status, created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Aucune politique : ni lecture ni écriture avec une clé anon. Le
-- formulaire public écrit via une Server Action, qui utilise la clé de
-- service — sans quoi n'importe qui pourrait lire les coordonnées de tous
-- les candidats partenaires.
-- ---------------------------------------------------------------------
alter table public.partner_applications enable row level security;
revoke all on public.partner_applications from anon, authenticated;
