-- =====================================================================
-- Travis — Rôle applicatif sur une instance PostgreSQL partagée
--
-- À exécuter UNE FOIS, en superutilisateur, après schema-travis.sql :
--
--   psql "$SUPERUSER_URL" -v mot_de_passe="'un-mot-de-passe-long'" \
--        -f supabase/role-travis-app.sql
--
-- Le mot de passe est passé en variable : il n'entre jamais dans un
-- fichier versionné, et n'apparaît pas dans l'historique du shell si vous
-- le lisez depuis un gestionnaire de secrets.
--
-- Pourquoi un rôle dédié : sur une instance partagée, faire tourner
-- l'application avec le superutilisateur, c'est donner à une faille de
-- Travis la main sur les bases de toutes les autres applications. Ce rôle
-- ne voit que le schéma `travis`.
-- =====================================================================

\if :{?mot_de_passe}
\else
  \echo '✗ Variable manquante. Relancez avec : -v mot_de_passe="''votre-mot-de-passe''"'
  \quit
\endif

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'travis_app') then
    create role travis_app login;
  end if;
end
$$;

alter role travis_app password :mot_de_passe;

-- Le schéma par défaut de la connexion : l'application écrit `orders` et
-- non `travis.orders`, et doit atterrir dans le bon schéma. `public` reste
-- à la fin pour les extensions qui y vivent (pgcrypto, gen_random_uuid).
alter role travis_app set search_path = travis, public;

/*
 * BYPASSRLS — le point qui décide si l'installation fonctionne.
 *
 * Toute l'autorisation de Travis vit dans le serveur applicatif : les
 * Server Actions, les routes API et les webhooks décident qui a droit à
 * quoi. La base, elle, n'a aucune notion de « l'utilisateur courant » —
 * il n'y a pas d'authentification PostgreSQL par candidat. Aucune
 * politique RLS ne peut donc exprimer la règle métier.
 *
 * Sans cet attribut, `travis_app` est soumis à RLS sans politique : il lit
 * zéro ligne et n'écrit rien, SANS LEVER D'ERREUR. L'application affiche
 * alors un catalogue vide et un « aucune correspondance » parfaitement
 * silencieux. C'est le mode de panne le plus coûteux à diagnostiquer.
 *
 * C'est exactement ce que fait `service_role` chez Supabase.
 *
 * RLS conserve tout son intérêt : elle ferme ces tables à tous les autres
 * rôles de l'instance — l'application voisine, un compte d'analyse en
 * lecture, le rôle `anon` de PostgREST.
 */
alter role travis_app bypassrls;

grant usage on schema travis to travis_app;
grant select, insert, update, delete on all tables    in schema travis to travis_app;
grant usage, select                  on all sequences in schema travis to travis_app;

-- Les tables créées plus tard par les migrations doivent l'être aussi,
-- sans qu'il faille repasser ce fichier.
alter default privileges in schema travis
  grant select, insert, update, delete on tables to travis_app;
alter default privileges in schema travis
  grant usage, select on sequences to travis_app;

-- Aucun droit ailleurs : `public` appartient aux autres applications.
revoke all on schema public from travis_app;

\echo ''
\echo '✓ Rôle travis_app prêt.'
\echo '  DATABASE_URL = postgresql://travis_app:MOT_DE_PASSE@HOTE:5432/BASE?options=-csearch_path%3Dtravis'
\echo '  Vérifiez avec cette URL : psql "$DATABASE_URL" -c ''select * from travis.healthcheck();'''
