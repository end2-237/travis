import "server-only";
import { MonetbilProvider } from "@/lib/payments/monetbil";
import { PayUnitProvider } from "@/lib/payments/payunit";
import { envOrNull } from "@/lib/site";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  WebhookResult,
} from "@/lib/payments/types";

/** Montant unique de la feuille de route (cf. SRS §3, étape 3). */
export const REPORT_PRICE_XAF = 500;

/**
 * Fournisseur utilisé tant qu'aucun agrégateur n'est configuré :
 * la commande est créée puis marquée payée localement, ce qui permet de
 * dérouler le parcours complet en développement sans débiter personne.
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
}

export function getPaymentProvider(): PaymentProvider {
  const configured = (envOrNull("PAYMENT_PROVIDER") ?? "").toLowerCase();

  if (configured === "monetbil") {
    const key = required("MONETBIL_SERVICE_KEY");
    const secret = required("MONETBIL_SERVICE_SECRET");
    return new MonetbilProvider(key, secret);
  }

  if (configured === "payunit") {
    return new PayUnitProvider(
      required("PAYUNIT_API_USER"),
      required("PAYUNIT_API_PASSWORD"),
      required("PAYUNIT_API_KEY"),
      process.env.PAYUNIT_MODE === "live" ? "live" : "test",
      required("PAYUNIT_WEBHOOK_SECRET"),
    );
  }

  return new DemoProvider();
}

export function isLivePaymentConfigured(): boolean {
  return getPaymentProvider().name !== "demo";
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

export type { PaymentProvider, WebhookResult } from "@/lib/payments/types";
