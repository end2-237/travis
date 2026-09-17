import "server-only";

/**
 * Limitation de débit, en mémoire du processus.
 *
 * Fenêtre glissante approchée par compteur : suffisant pour ce qu'on
 * protège — une route de mesure qui écrit une ligne en base à chaque appel,
 * et un tunnel de paiement qui appelle un agrégateur facturé.
 *
 * Limite assumée : le compteur est local au conteneur. Derrière plusieurs
 * répliques, chacune applique le sien, et le plafond réel est multiplié par
 * le nombre de répliques. Pour un plafond strict et partagé il faudrait
 * Redis — ce qui n'est pas justifié tant qu'un seul conteneur sert le site.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = globalThis as typeof globalThis & {
  __travisRateLimit?: Map<string, Bucket>;
};

const buckets = (store.__travisRateLimit ??= new Map<string, Bucket>());

/** Purge opportuniste : sans elle, la table grossit avec chaque adresse vue. */
function sweep(now: number): void {
  if (buckets.size < 5_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Secondes avant la réouverture, pour l'en-tête Retry-After. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfter: 0 };
}

/**
 * Identifie l'appelant par son adresse, telle que la voit le proxy.
 * Aucune donnée n'est conservée au-delà de la fenêtre.
 */
export function callerKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const ip =
    forwarded?.trim() || request.headers.get("x-real-ip") || "inconnu";
  return `${scope}:${ip}`;
}
