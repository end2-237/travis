-- =====================================================================
-- Travis — Rôle applicatif sur une instance PostgreSQL partagée
--
-- SQL pur : ce fichier s'exécute aussi bien dans psql que dans un éditeur
-- SQL web (Supabase Studio, Coolify, pgAdmin, DBeaver). Aucune commande
-- commençant par une barre oblique inverse — celles-ci appartiennent au
-- client psql, pas au serveur, et tout autre client répond
-- « syntax error at or near "\" ».
--
-- ┌─────────────────────────────────────────────────────────────────┐
-- │ AVANT D'EXÉCUTER : remplacez CHANGEZ_MOI à la ligne marquée      │
-- │ ci-dessous par un mot de passe long, puis lancez le fichier.     │
-- └─────────────────────────────────────────────────────────────────┘
--
-- Ce fichier est FACULTATIF. Si l'application se connecte déjà avec le
-- rôle `postgres` (superutilisateur), tout fonctionne sans lui : un
-- superutilisateur contourne RLS d'office. Il sert à ne pas faire tourner
-- l'application en superutilisateur sur une instance partagée — une faille
-- dans Travis donnerait sinon la main sur les bases de toutes les autres
-- applications.
--
-- À exécuter une fois, en superutilisateur, APRÈS schema-travis.sql.
-- =====================================================================

do $$
declare
  -- ↓↓↓ REMPLACEZ CETTE VALEUR ↓↓↓
  mot_de_passe constant text := 'CHANGEZ_MOI';
  -- ↑↑↑ REMPLACEZ CETTE VALEUR ↑↑↑

  -- La sentinelle est assemblée à l'exécution : un « chercher-remplacer »
  -- sur CHANGEZ_MOI ne la touche donc pas, et le garde-fou ci-dessous
  -- continue de faire son travail au lieu de se déclencher à tort.
  sentinelle constant text := 'CHANGEZ' || '_' || 'MOI';
begin
  if mot_de_passe = sentinelle then
    raise exception
      'Remplacez la valeur de mot_de_passe en haut de ce fichier avant de l''exécuter.';
  end if;

  if length(mot_de_passe) < 16 then
    raise exception
      'Mot de passe trop court (% caractères). Ce rôle est exposé au réseau : 16 caractères au minimum.',
      length(mot_de_passe);
  end if;

  if not exists (select 1 from pg_roles where rolname = 'travis_app') then
    execute 'create role travis_app login';
  end if;

  execute format('alter role travis_app password %L', mot_de_passe);

  -- Schéma par défaut de la connexion : l'application écrit `orders` et non
  -- `travis.orders`, et doit atterrir dans le bon schéma. `public` reste en
  -- secours pour les extensions qui y vivent (pgcrypto, gen_random_uuid).
  execute 'alter role travis_app set search_path = travis, public';

  /*
   * BYPASSRLS — le réglage qui décide si l'installation fonctionne.
   *
   * Toute l'autorisation de Travis vit dans le serveur applicatif : Server
   * Actions, routes API et webhooks décident qui a droit à quoi. La base,
   * elle, n'a aucune notion d'« utilisateur courant » — il n'existe pas
   * d'authentification PostgreSQL par candidat. Aucune politique RLS ne peut
   * donc exprimer la règle métier.
   *
   * Sans cet attribut, `travis_app` est soumis à RLS sans politique : il lit
   * zéro ligne et n'écrit rien, SANS LEVER D'ERREUR. L'application affiche
   * un catalogue vide et un « aucune correspondance » parfaitement
   * silencieux — le mode de panne le plus coûteux à diagnostiquer.
   *
   * C'est exactement ce que fait `service_role` chez Supabase.
   *
   * RLS conserve tout son intérêt : elle ferme ces tables à tous les autres
   * rôles de l'instance — l'application voisine, un compte d'analyse en
   * lecture, le rôle `anon` de PostgREST.
   */
  execute 'alter role travis_app bypassrls';

  raise notice 'Rôle travis_app prêt.';
  raise notice 'DATABASE_URL=postgresql://travis_app:MOT_DE_PASSE@HOTE:5432/BASE?options=-c%%20search_path%%3Dtravis%%2Cpublic';
  raise notice 'Vérifiez ensuite : select * from travis.healthcheck();';
end
$$;

grant usage on schema travis to travis_app;
grant select, insert, update, delete on all tables    in schema travis to travis_app;
grant usage, select                  on all sequences in schema travis to travis_app;

-- Les tables créées plus tard par une migration doivent l'être aussi, sans
-- qu'il faille repasser ce fichier.
alter default privileges in schema travis
  grant select, insert, update, delete on tables to travis_app;
alter default privileges in schema travis
  grant usage, select on sequences to travis_app;

-- Aucun droit ailleurs : `public` appartient aux autres applications.
revoke all on schema public from travis_app;
