import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { envOrNull } from "@/lib/site";

export type EventKind =
  | "page_view"
  | "evaluation_started"
  | "evaluation_completed"
  | "program_viewed"
  | "checkout_started"
  | "report_generated";

export interface TrackInput {
  kind: EventKind;
  path?: string | null;
  /** Programme ou service concerné, quand l'événement en vise un. */
  subject?: string | null;
  country?: string | null;
  referrer?: string | null;
  /** Empreinte de visite, déjà calculée par la route d'entrée. */
  visitorHash?: string | null;
}

/**
 * Empreinte de visite, non réversible et rotative.
 *
 * Le sel change chaque jour : deux visites du même appareil se recoupent sur
 * 24 heures — assez pour ne pas compter dix fois la même personne — mais pas
 * au-delà. On ne peut ni remonter à l'adresse IP, ni suivre quelqu'un d'un
 * jour sur l'autre. C'est un compteur de visites, pas un traceur.
 */
export function visitorFingerprint(ip: string, userAgent: string): string {
  const salt = envOrNull("ANALYTICS_SALT") ?? "travis-local-salt";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${salt}|${day}|${ip}|${userAgent}`)
    .digest("hex")
    .slice(0, 32);
}

/** Enregistre un événement. N'échoue jamais bruyamment : la mesure ne doit
 *  pas casser le parcours qu'elle observe. */
export async function track(input: TrackInput): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await getSupabaseAdmin()
      .from("analytics_events")
      .insert({
        kind: input.kind,
        path: input.path ?? null,
        subject: input.subject ?? null,
        country: input.country ?? null,
        referrer: input.referrer ?? null,
        visitor_hash: input.visitorHash ?? null,
      });
  } catch (error) {
    console.warn("[analytics] événement non enregistré", error);
  }
}
