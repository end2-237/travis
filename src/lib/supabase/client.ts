"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Client navigateur — clé anon, soumis aux politiques RLS. */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis.",
    );
  }

  return createBrowserClient(url, anonKey);
}
