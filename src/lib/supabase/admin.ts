import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envOrNull } from "@/lib/site";

/**
 * Client Supabase à privilèges service_role.
 * RLS est contourné : réservé aux Server Actions, routes API et webhooks —
 * jamais importé depuis un composant client.
 */
/**
 * Le schéma cible étant lu dans l'environnement, il n'est pas connu à la
 * compilation : le type par défaut de `SupabaseClient` le fige à « public »
 * et refuserait toute autre valeur. Le dépôt n'ayant pas de types générés
 * depuis la base, le client est de toute façon non typé — l'alias le dit
 * plutôt que de laisser croire à une garantie qui n'existe pas.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any, string, any>;

let cached: AdminClient | null = null;

export function getSupabaseAdmin(): AdminClient {
  if (cached) return cached;

  const url = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = envOrNull("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Schéma cible. Une instance PostgreSQL partagée entre plusieurs
    // applications ne peut pas les loger toutes dans `public` : Travis vit
    // dans son propre schéma. Défaut `public` pour une instance dédiée,
    // où rien ne change.
    //
    // Si l'accès passe par PostgREST, le schéma doit lui être exposé :
    // PGRST_DB_SCHEMAS=public,travis — sans quoi toute requête répond
    // « schema must be one of the following ».
    db: { schema: envOrNull("SUPABASE_DB_SCHEMA") ?? "public" },
  });
  return cached;
}

/** Vrai si les variables d'environnement Supabase sont présentes. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    envOrNull("NEXT_PUBLIC_SUPABASE_URL") &&
      envOrNull("SUPABASE_SERVICE_ROLE_KEY"),
  );
}
