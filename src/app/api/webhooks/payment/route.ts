import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { fulfillOrder, getOrder, getOrderByRef, markFailed } from "@/server/orders";
import { notifyReportReady } from "@/lib/whatsapp";
import { loadEvaluation } from "@/server/profiles";

export const runtime = "nodejs";

/**
 * Notification de l'agrégateur : valide la signature, met la commande à jour
 * et déclenche immédiatement la génération du PDF (cf. SRS §3, étape 3).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const payload = parseBody(rawBody, request.headers.get("content-type"));

  if (!payload) {
    return NextResponse.json({ error: "Charge utile illisible." }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const result = provider.parseWebhook(payload, request.headers, rawBody);

  if (!result) {
    // Signature absente ou invalide : on ne révèle rien de plus.
    console.warn("[webhook] signature rejetée", { provider: provider.name });
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  const order =
    (await getOrderByRef(result.transactionRef)) ??
    (await getOrder(result.transactionRef));

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (result.status === "FAILED") {
    await markFailed(order.id);
    return NextResponse.json({ received: true, status: "FAILED" });
  }

  if (result.status !== "SUCCESS") {
    return NextResponse.json({ received: true, status: "PENDING" });
  }

  try {
    const fulfilled = await fulfillOrder(order);

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

    return NextResponse.json({ received: true, status: "SUCCESS" });
  } catch (error) {
    console.error("[webhook] génération du rapport", error);
    return NextResponse.json(
      { error: "Génération du rapport impossible." },
      { status: 500 },
    );
  }
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
