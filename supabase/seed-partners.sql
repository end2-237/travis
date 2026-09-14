-- =====================================================================
-- Travis — Emplacements partenaires
--
-- Crée les lignes vides que le back-office permet ensuite de compléter.
-- Statut « a_confirmer » : tant que l'adresse et le téléphone ne sont pas
-- renseignés, l'interface annonce le service sans afficher de coordonnées.
-- Idempotent.
-- =====================================================================

insert into public.partners (slug, kind, name, summary, status, sort_order)
values
  ('partenaire-traduction', 'traduction',
   'Partenaire traduction assermentée',
   'Prise en charge du lot complet de traductions, avec retrait et livraison, sans déplacement au greffe.',
   'a_confirmer', 10),
  ('partenaire-legalisation', 'legalisation',
   'Partenaire certification et légalisation',
   'Dépôt et retrait des pièces auprès de l''administration, pour les candidats hors de la ville du guichet.',
   'a_confirmer', 20),
  ('partenaire-immigration', 'visa',
   'Partenaire accompagnement consulaire',
   'Relecture du dossier visa, préparation à l''entretien et suivi jusqu''à la décision.',
   'a_confirmer', 30),
  ('partenaire-langue', 'langue',
   'Partenaire préparation linguistique',
   'Préparation intensive à l''IELTS, au TOEFL ou au TCF, avec inscription à la session comprise.',
   'a_confirmer', 40)
on conflict (slug) do nothing;
