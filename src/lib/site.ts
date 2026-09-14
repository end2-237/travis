/**
 * Lecture des variables d'environnement tolérante aux valeurs vides.
 *
 * Une variable non déclarée côté CI ou orchestrateur arrive sous forme de
 * chaîne vide, pas de `undefined` : `??` ne suffit donc pas à basculer sur la
 * valeur par défaut. On traite ici toute valeur blanche comme absente.
 */
export function envOrNull(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const DEFAULT_SITE_URL = "https://travis.app";

/** URL publique du site, sans barre oblique finale. */
export function siteUrl(): string {
  const configured = envOrNull("NEXT_PUBLIC_SITE_URL");
  if (!configured) return DEFAULT_SITE_URL;

  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    // Valeur mal formée : on préfère un build qui aboutit à un build qui casse.
    console.warn(
      `[site] NEXT_PUBLIC_SITE_URL invalide (« ${configured} »), repli sur ${DEFAULT_SITE_URL}.`,
    );
    return DEFAULT_SITE_URL;
  }
}
