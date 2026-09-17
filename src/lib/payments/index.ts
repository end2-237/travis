import "server-only";
import { MonetbilProvider } from "@/lib/payments/monetbil";
import { PawaPayProvider } from "@/lib/payments/pawapay";
import { PayUnitProvider } from "@/lib/payments/payunit";
import { envOrNull } from "@/lib/site";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentStatus,
  WebhookResult,
} from "@/lib/payments/types";

/** Montant unique de la feuille de route. */
export const REPORT_PRICE_XAF = 500;

/**
 * Fournisseur de développement : la commande est créée puis marquée payée
 * localement, ce qui permet de dérouler le parcours complet sans débiter
 * personne.
 *
 * Il ne peut pas s'activer en production — voir `getPaymentProvider`. Un
 * mode démonstration qui survit au déploiement, c'est un paywall ouvert :
 * n'importe qui obtient le rapport sans payer, et rien dans l'interface ne
 * le signale.
 */
class DemoProvider implements PaymentProvider {
  readonly name = "demo";

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    return { transactionRef: `demo-${input.orderId}` };
  }

  parseWebhook(payload: Record<string, unknown>): WebhookResult | null {
    return {
      transactionRef: String(payload.transaction_ref ?? ""),
      status: "SUCCESS",
      raw: payload,
    };
  }

  async verifyStatus(): Promise<PaymentStatus> {
    return "SUCCESS";
  }
}

/**
 * Message affiché si l'application tourne en production sans agrégateur.
 * Il est volontairement explicite : cette panne-là doit être diagnostiquée
 * en dix secondes, pas en une soirée.
 */
const MISSING_PROVIDER =
  "Aucun agrégateur de paiement n'est configuré alors que l'application " +
  "tourne en production. Renseignez PAYMENT_PROVIDER (pawapay, monetbil ou " +
  "payunit) et les clés correspondantes. Le mode démonstration est refusé " +
  "ici : il livrerait le rapport sans encaisser.";

export function getPaymentProvider(): PaymentProvider {
  const configured = (envOrNull("PAYMENT_PROVIDER") ?? "").toLowerCase();

  if (configured === "pawapay") {
    return new PawaPayProvider(
      required("PAWAPAY_API_TOKEN"),
      envOrNull("PAWAPAY_MODE") === "production" ? "production" : "sandbox",
      // Clé publique de vérification des notifications signées. Facultative :
      // le statut est de toute façon relu à la source avant livraison.
      envOrNull("PAWAPAY_CALLBACK_PUBLIC_KEY"),
    );
  }

  if (configured === "monetbil") {
    return new MonetbilProvider(
      required("MONETBIL_SERVICE_KEY"),
      required("MONETBIL_SERVICE_SECRET"),
    );
  }

  if (configured === "payunit") {
    return new PayUnitProvider(
      required("PAYUNIT_API_USER"),
      required("PAYUNIT_API_PASSWORD"),
      required("PAYUNIT_API_KEY"),
      envOrNull("PAYUNIT_MODE") === "live" ? "live" : "test",
      required("PAYUNIT_WEBHOOK_SECRET"),
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(MISSING_PROVIDER);
  }

  return new DemoProvider();
}

/** Vrai si un vrai agrégateur encaisse — faux en mode démonstration. */
export function isLivePaymentConfigured(): boolean {
  try {
    return getPaymentProvider().name !== "demo";
  } catch {
    return false;
  }
}

function required(name: string): string {
  const value = envOrNull(name);
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante pour l'agrégateur de paiement : ${name}`,
    );
  }
  return value;
}

export type {
  PaymentProvider,
  PaymentStatus,
  WebhookResult,
} from "@/lib/payments/types";
