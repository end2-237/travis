import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envOrNull } from "@/lib/site";

/**
 * Client Supabase à privilèges service_role.
 * RLS est contourné : réservé aux Server Actions, routes API et webhooks —
 * jamais importé depuis un composant client.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
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
