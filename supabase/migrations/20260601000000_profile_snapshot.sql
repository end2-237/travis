-- =====================================================================
-- Travis — Instantané de matching sur le profil
--
-- La page de résultats recalculait le matching à chaque affichage, tandis
-- que le PDF payé restait figé sur l'instantané pris au paiement. Dès que
-- le catalogue évoluait, l'écran et le document cessaient de concorder —
-- or le candidat a payé pour la liste qu'il a vue.
--
-- L'instantané est désormais pris une fois, à l'évaluation, et sert aux
-- deux.
-- =====================================================================

alter table public.student_profiles
    add column if not exists match_snapshot jsonb;

comment on column public.student_profiles.match_snapshot is
    'Résultat du matching figé à l''évaluation : garantit que l''écran et le PDF disent la même chose.';
