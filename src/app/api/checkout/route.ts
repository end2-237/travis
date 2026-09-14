import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider, REPORT_PRICE_XAF } from "@/lib/payments";
import { checkoutSchema } from "@/lib/validation";
import { loadEvaluation } from "@/server/profiles";
import { attachTransactionRef, createOrder, fulfillOrder } from "@/server/orders";

export const runtime = "nodejs";

/** Ouvre le tunnel de micro-paiement à 500 FCFA (cf. SRS §3, étape 3). */
export async function POST(request: NextRequest) {
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

  const provider = getPaymentProvider();
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

    // Sans agrégateur configuré, le parcours se déroule de bout en bout
    // localement : la commande est honorée immédiatement.
    if (provider.name === "demo") {
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
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const host = request.headers.get("x-forwarded-host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
