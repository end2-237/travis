import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { callerKey, rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/admin/analytics";
import { fulfillOrder, getOrder, markFailed } from "@/server/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * État d'une commande, relu à la source.
 *
 * La page d'attente interroge cette route pendant que le candidat valide le
 * débit sur son téléphone. Elle existe parce qu'une notification peut se
 * perdre : un agrégateur mal configuré, un conteneur redémarré au mauvais
 * moment, et le paiement reste bloqué sur « en attente » alors qu'il est
 * encaissé. Ici, c'est l'application qui va voir.
 *
 * Elle est aussi ce qui rend la livraison sûre : le statut provient d'un
 * appel sortant authentifié vers l'agrégateur, jamais d'une charge utile
 * entrante.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  // Le sondage est légitime toutes les quelques secondes ; au-delà, c'est
  // un appel vers l'agrégateur qu'on nous fait payer.
  const limit = rateLimit(callerKey(request, "order-status"), 60, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (order.payment_status === "SUCCESS") {
    return NextResponse.json({ status: "SUCCESS" });
  }

  if (order.payment_status === "FAILED") {
    return NextResponse.json({ status: "FAILED", message: null });
  }

  if (!order.transaction_ref) {
    return NextResponse.json({ status: "PENDING" });
  }

  let provider;
  try {
    provider = getPaymentProvider();
  } catch {
    // Agrégateur non configuré : on ne prétend pas savoir. Le statut reste
    // en attente plutôt que de basculer sur une erreur trompeuse.
    return NextResponse.json({ status: "PENDING" });
  }

  if (!provider.verifyStatus) {
    return NextResponse.json({ status: "PENDING" });
  }

  let status;
  try {
    status = await provider.verifyStatus(order.transaction_ref);
  } catch (error) {
    console.warn("[status] agrégateur injoignable", error);
    return NextResponse.json({ status: "PENDING" });
  }

  if (status === "SUCCESS") {
    try {
      await fulfillOrder(order);
      await track({ kind: "report_generated", subject: order.id });
    } catch (error) {
      console.error("[status] génération du rapport", error);
      return NextResponse.json(
        { status: "PENDING", message: "Rapport en cours de génération." },
        { status: 200 },
      );
    }
    return NextResponse.json({ status: "SUCCESS" });
  }

  if (status === "FAILED") {
    await markFailed(order.id);
    const message = provider.failureMessage
      ? await provider.failureMessage(order.transaction_ref).catch(() => null)
      : null;
    return NextResponse.json({ status: "FAILED", message });
  }

  return NextResponse.json({ status: "PENDING" });
}
