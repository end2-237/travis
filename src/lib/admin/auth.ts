import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { envOrNull } from "@/lib/site";

/**
 * Accès au back-office.
 *
 * Session à jeton signé HMAC, sans stockage serveur : le cookie porte sa date
 * d'expiration et sa signature, le serveur n'a qu'à vérifier. Le secret ne
 * quitte jamais le serveur et le cookie est httpOnly, donc inaccessible au
 * JavaScript de la page.
 *
 * Limite assumée : un seul compte, partagé. Pour plusieurs administrateurs
 * avec des droits distincts et une traçabilité par personne, il faudra passer
 * à Supabase Auth et une table de rôles — ce mécanisme-ci n'y prétend pas.
 */

const COOKIE = "travis_admin";
const TTL_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = envOrNull("ADMIN_SESSION_SECRET");
  if (!value || value.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET manquant ou trop court : 32 caractères aléatoires au minimum.",
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Vrai si le back-office est configuré et peut donc être ouvert. */
export function isAdminConfigured(): boolean {
  return Boolean(
    envOrNull("ADMIN_PASSWORD") && (envOrNull("ADMIN_SESSION_SECRET")?.length ?? 0) >= 32,
  );
}

/** Comparaison à durée constante : ne révèle pas où le mot de passe diverge. */
export function verifyPassword(submitted: string): boolean {
  const expected = envOrNull("ADMIN_PASSWORD");
  if (!expected) return false;

  const a = Buffer.from(submitted, "utf8");
  const b = Buffer.from(expected, "utf8");
  // Longueurs différentes : on compare quand même quelque chose de la même
  // taille pour ne pas transformer la longueur en canal auxiliaire.
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function issueToken(): string {
  const expires = Date.now() + TTL_SECONDS * 1000;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${expires}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

/** Vérifie la signature ET la date d'expiration portées par le jeton. */
export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;
  const payload = `${expires}.${nonce}`;

  const expected = Buffer.from(sign(payload), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length) return false;
  if (!timingSafeEqual(expected, received)) return false;

  const expiresAt = Number(expires);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function openSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function closeSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isSignedIn(): Promise<boolean> {
  const store = await cookies();
  try {
    return verifyToken(store.get(COOKIE)?.value);
  } catch {
    // Secret absent : personne n'entre.
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE;
