-- =====================================================================
-- Travis — Évaluation ciblée sur une opportunité unique
--
-- Un candidat peut désormais évaluer son admissibilité pour un programme
-- précis depuis sa fiche, et non plus seulement sur l'ensemble du catalogue.
-- =====================================================================

alter table public.student_profiles
    add column if not exists focus_program varchar(120);

comment on column public.student_profiles.focus_program is
    'Slug du programme visé quand l''évaluation porte sur une seule opportunité ; NULL pour une évaluation globale.';

create index if not exists student_profiles_focus_idx
    on public.student_profiles (focus_program)
    where focus_program is not null;
