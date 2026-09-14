"use server";

import { redirect } from "next/navigation";
import {
  closeSession,
  isAdminConfigured,
  openSession,
  verifyPassword,
} from "@/lib/admin/auth";

export type SignInState = { error: string | null };

/** Petit délai constant : rend le brute-force en ligne peu rentable. */
function throttle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 600));
}

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!isAdminConfigured()) {
    return {
      error:
        "Back-office non configuré : renseignez ADMIN_PASSWORD et ADMIN_SESSION_SECRET.",
    };
  }

  await throttle();

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }

  await openSession();

  const next = String(formData.get("suite") ?? "/admin");
  // N'accepte qu'un chemin interne : une URL absolue permettrait une
  // redirection ouverte vers un site tiers.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut(): Promise<void> {
  await closeSession();
  redirect("/admin/connexion");
}
