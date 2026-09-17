import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider, REPORT_PRICE_XAF } from "@/lib/payments";
import { callerKey, rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/admin/analytics";
import { envOrNull } from "@/lib/site";
import { checkoutSchema } from "@/lib/validation";
import { loadEvaluation } from "@/server/profiles";
import { attachTransactionRef, createOrder, fulfillOrder } from "@/server/orders";

export const runtime = "nodejs";

/** Ouvre le tunnel de micro-paiement à 500 FCFA. */
export async function POST(request: NextRequest) {
  // Chaque appel crée une commande et sollicite l'agrégateur, qui facture :
  // un plafond s'impose même sans intention malveillante — double clic,
  // onglet rechargé en boucle.
  const limit = rateLimit(callerKey(request, "checkout"), 10, 300);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Trop de tentatives de paiement. Patientez quelques minutes avant de réessayer.",
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Requête invalide." },
      { status: 400 },
    );
  }

  const evaluation = await loadEvaluation(parsed.data.profile_id);
  if (!evaluation) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  let provider;
  try {
    provider = getPaymentProvider();
  } catch (error) {
    console.error("[checkout] agrégateur non configuré", error);
    return NextResponse.json(
      {
        error:
          "Le paiement est momentanément indisponible. Réessayez dans quelques minutes.",
      },
      { status: 503 },
    );
  }

  const origin = resolveOrigin(request);

  try {
    const order = await createOrder({
      profileId: evaluation.profile.id,
      amount: REPORT_PRICE_XAF,
      provider: provider.name,
      snapshot: evaluation.snapshot,
    });

    const payment = await provider.createPayment({
      orderId: order.id,
      amountXaf: REPORT_PRICE_XAF,
      phoneNumber: parsed.data.phone_number,
      operator: parsed.data.operator,
      returnUrl: `${origin}/telechargement/${order.id}`,
      notifyUrl: `${origin}/api/webhooks/payment`,
    });

    await attachTransactionRef(order.id, payment.transactionRef, payment.raw);
    await track({ kind: "checkout_started", subject: order.id });

    // Le fournisseur de démonstration honore la commande immédiatement, pour
    // dérouler le parcours complet en développement. `getPaymentProvider`
    // refuse déjà de le construire en production ; la condition est répétée
    // ici parce qu'une livraison gratuite ne doit jamais dépendre d'un seul
    // garde-fou situé ailleurs.
    if (provider.name === "demo" && process.env.NODE_ENV !== "production") {
      await fulfillOrder({ ...order, transaction_ref: payment.transactionRef });
    }

    return NextResponse.json({
      order_id: order.id,
      payment_url: payment.paymentUrl ?? null,
    });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Le paiement n'a pas pu démarrer.",
      },
      { status: 502 },
    );
  }
}

function resolveOrigin(request: NextRequest): string {
  const configured = envOrNull("NEXT_PUBLIC_SITE_URL");
  if (configured) return configured.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
