import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { track } from "@/lib/admin/analytics";
import { fulfillOrder, getOrder, getOrderByRef, markFailed } from "@/server/orders";
import { notifyReportReady } from "@/lib/whatsapp";
import { loadEvaluation } from "@/server/profiles";

export const runtime = "nodejs";

/**
 * Notification de l'agrégateur.
 *
 * Elle sert de déclencheur, **jamais de preuve**. Le statut qui autorise la
 * livraison est relu à la source par un appel sortant authentifié
 * (`verifyStatus`), parce qu'une charge utile entrante est, par nature,
 * sous le contrôle de celui qui l'envoie. Si la vérification de signature
 * venait à être mal configurée côté agrégateur, une notification forgée ne
 * pourrait toujours rien débloquer : elle ferait au pire consulter une
 * commande qui n'a pas été payée.
 *
 * On répond 200 dès que la notification est comprise. Un agrégateur qui
 * reçoit une erreur réessaie, parfois longtemps : lui renvoyer 500 parce
 * que la génération du PDF a échoué transforme un incident local en boucle
 * de notifications.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const payload = parseBody(rawBody, request.headers.get("content-type"));

  if (!payload) {
    return NextResponse.json({ error: "Charge utile illisible." }, { status: 400 });
  }

  let provider;
  try {
    provider = getPaymentProvider();
  } catch (error) {
    console.error("[webhook] agrégateur non configuré", error);
    return NextResponse.json({ error: "Indisponible." }, { status: 503 });
  }

  const result = provider.parseWebhook(payload, request.headers, rawBody);

  if (!result) {
    console.warn("[webhook] notification rejetée", { provider: provider.name });
    return NextResponse.json({ error: "Notification invalide." }, { status: 401 });
  }

  const order =
    (await getOrderByRef(result.transactionRef)) ??
    (await getOrder(result.transactionRef));

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  // Le statut de la notification est indicatif ; celui de l'agrégateur fait
  // foi. Sans consultation possible, la notification vérifiée reste la
  // seule source — d'où l'exigence d'une signature pour ces agrégateurs-là.
  const reference = order.transaction_ref ?? result.transactionRef;
  let status = result.status;

  if (provider.verifyStatus) {
    try {
      status = await provider.verifyStatus(reference);
    } catch (error) {
      console.warn("[webhook] consultation impossible, nouvel essai attendu", error);
      return NextResponse.json({ received: true, status: "PENDING" });
    }
  }

  if (status === "FAILED") {
    await markFailed(order.id);
    return NextResponse.json({ received: true, status: "FAILED" });
  }

  if (status !== "SUCCESS") {
    return NextResponse.json({ received: true, status: "PENDING" });
  }

  try {
    const fulfilled = await fulfillOrder(order);
    await track({ kind: "report_generated", subject: fulfilled.id });

    // Livraison WhatsApp — optionnelle, ne doit jamais faire échouer le webhook.
    if (fulfilled.profile_id) {
      const evaluation = await loadEvaluation(fulfilled.profile_id);
      if (evaluation) {
        await notifyReportReady(
          evaluation.profile.phone_number,
          evaluation.profile.full_name,
          fulfilled.id,
        );
      }
    }
  } catch (error) {
    // Le paiement est encaissé : on l'acquitte quand même. La page d'attente
    // relance la génération à son prochain sondage, et le rapport se
    // régénère de toute façon à la demande depuis l'instantané de matching.
    console.error("[webhook] génération du rapport", error);
  }

  return NextResponse.json({ received: true, status: "SUCCESS" });
}

function parseBody(
  raw: string,
  contentType: string | null,
): Record<string, unknown> | null {
  if (raw.trim() === "") return null;

  if (contentType?.includes("application/json")) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  // Monetbil notifie en x-www-form-urlencoded.
  const params = new URLSearchParams(raw);
  const entries = [...params.entries()];
  if (entries.length > 0) return Object.fromEntries(entries);

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
