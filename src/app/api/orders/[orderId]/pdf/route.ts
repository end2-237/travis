import { NextResponse } from "next/server";
import { renderReport } from "@/lib/pdf/report";
import { loadEvaluation } from "@/server/profiles";
import { getOrder } from "@/server/orders";

export const runtime = "nodejs";

/**
 * Sert le rapport d'une commande payée.
 * En production, le PDF est servi depuis Supabase Storage par URL signée ;
 * cette route couvre le mode démonstration et la régénération à la volée.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (order.payment_status !== "SUCCESS") {
    return NextResponse.json(
      { error: "Paiement non confirmé." },
      { status: 402 },
    );
  }

  if (!order.profile_id) {
    return NextResponse.json({ error: "Profil manquant." }, { status: 409 });
  }

  const evaluation = await loadEvaluation(order.profile_id);
  if (!evaluation) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const pdf = await renderReport(
    evaluation.profile,
    order.match_snapshot ?? evaluation.snapshot,
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="travis-feuille-de-route-${orderId.slice(0, 8)}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
