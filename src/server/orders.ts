import "server-only";
import { randomUUID } from "node:crypto";
import { renderReport } from "@/lib/pdf/report";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { loadEvaluation } from "@/server/profiles";
import {
  findOrderByRef,
  readOrder,
  rememberOrder,
  updateOrder,
} from "@/server/session-store";
import type { MatchSnapshot, Order } from "@/types/database";

const REPORTS_BUCKET = "reports";

export async function createOrder(input: {
  profileId: string;
  amount: number;
  provider: string;
  snapshot: MatchSnapshot;
}): Promise<Order> {
  const base: Order = {
    id: randomUUID(),
    profile_id: input.profileId,
    amount: input.amount,
    payment_status: "PENDING",
    transaction_ref: null,
    provider: input.provider,
    provider_payload: null,
    pdf_storage_url: null,
    match_snapshot: input.snapshot,
    admissibility_score: input.snapshot.score,
    paid_at: null,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) return rememberOrder(base);

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .insert({
      profile_id: input.profileId,
      amount: input.amount,
      payment_status: "PENDING",
      provider: input.provider,
      match_snapshot: input.snapshot,
      admissibility_score: input.snapshot.score,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Création de la commande impossible : ${error?.message ?? "réponse vide"}`,
    );
  }

  return data as Order;
}

export async function attachTransactionRef(
  orderId: string,
  transactionRef: string,
  payload: unknown,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    updateOrder(orderId, {
      transaction_ref: transactionRef,
      provider_payload: payload as Record<string, unknown>,
    });
    return;
  }

  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({
      transaction_ref: transactionRef,
      provider_payload: payload as Record<string, unknown>,
    })
    .eq("id", orderId);

  if (error) {
    throw new Error(`Mise à jour de la commande impossible : ${error.message}`);
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return readOrder(orderId);

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Order;
}

export async function getOrderByRef(ref: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return findOrderByRef(ref);

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("transaction_ref", ref)
    .maybeSingle();

  if (error || !data) return null;
  return data as Order;
}

export async function markFailed(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    updateOrder(orderId, { payment_status: "FAILED" });
    return;
  }
  await getSupabaseAdmin()
    .from("orders")
    .update({ payment_status: "FAILED" })
    .eq("id", orderId);
}

/**
 * Paiement validé : marque la commande payée puis génère et stocke le PDF.
 * Idempotent — un webhook rejoué ne régénère pas le rapport.
 */
export async function fulfillOrder(order: Order): Promise<Order> {
  if (order.payment_status === "SUCCESS" && order.pdf_storage_url) {
    return order;
  }
  if (!order.profile_id) {
    throw new Error("Commande orpheline : aucun profil rattaché.");
  }

  const evaluation = await loadEvaluation(order.profile_id);
  if (!evaluation) {
    throw new Error("Profil introuvable pour la génération du rapport.");
  }

  // L'instantané pris au paiement prime : le rapport reste reproductible
  // même si le catalogue a évolué depuis.
  const snapshot = order.match_snapshot ?? evaluation.snapshot;
  const pdf = await renderReport(evaluation.profile, snapshot);
  const paidAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return (
      updateOrder(order.id, {
        payment_status: "SUCCESS",
        paid_at: paidAt,
        pdf_storage_url: `/api/orders/${order.id}/pdf`,
      }) ?? order
    );
  }

  const supabase = getSupabaseAdmin();
  const path = `${order.profile_id}/${order.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(REPORTS_BUCKET)
    .upload(path, pdf, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw new Error(`Stockage du rapport impossible : ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "SUCCESS",
      paid_at: paidAt,
      pdf_storage_url: path,
    })
    .eq("id", order.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Mise à jour de la commande impossible : ${error?.message ?? "réponse vide"}`,
    );
  }

  return data as Order;
}

/** URL de téléchargement signée, valable une heure. */
export async function getReportDownloadUrl(
  order: Order,
): Promise<string | null> {
  if (!order.pdf_storage_url) return null;
  if (!isSupabaseConfigured()) return order.pdf_storage_url;

  const { data, error } = await getSupabaseAdmin()
    .storage.from(REPORTS_BUCKET)
    .createSignedUrl(order.pdf_storage_url, 60 * 60);

  if (error || !data) return null;
  return data.signedUrl;
}
