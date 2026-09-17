import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { track, visitorFingerprint } from "@/lib/admin/analytics";
import { callerKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  kind: z.enum([
    "page_view",
    "evaluation_started",
    "evaluation_completed",
    "program_viewed",
    "checkout_started",
    "report_generated",
  ]),
  path: z.string().max(400).optional(),
  subject: z.string().max(160).optional(),
  country: z.string().max(100).optional(),
});

/**
 * Collecte d'audience.
 *
 * L'adresse IP et l'agent utilisateur ne servent qu'à calculer une empreinte
 * journalière non réversible ; ni l'une ni l'autre n'est stockée.
 */
export async function POST(request: NextRequest) {
  // Une ligne en base par appel : sans plafond, la table d'audience est un
  // vecteur de saturation gratuit. Un usage normal reste très en dessous.
  if (!rateLimit(callerKey(request, "track"), 120, 60).allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "inconnu";
  const userAgent = request.headers.get("user-agent") ?? "inconnu";

  // Le référent n'est conservé que par domaine : la page d'origine exacte
  // n'apporte rien à la mesure et peut être sensible.
  const rawReferrer = request.headers.get("referer");
  let referrer: string | null = null;
  if (rawReferrer) {
    try {
      referrer = new URL(rawReferrer).hostname;
    } catch {
      referrer = null;
    }
  }

  // L'écriture n'est pas attendue : la réponse part tout de suite. Une base
  // lente ne doit pas ralentir la navigation qu'elle est censée observer, et
  // l'appelant ne fait rien de cette réponse.
  void track({
    ...parsed.data,
    referrer,
    visitorHash: visitorFingerprint(ip, userAgent),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
