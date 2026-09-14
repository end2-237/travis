import { createHash } from "node:crypto";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  WebhookResult,
} from "@/lib/payments/types";

const WIDGET_ENDPOINT = "https://api.monetbil.com/widget/v2.1";

/**
 * Agrégateur Monetbil (MTN MoMo & Orange Money Cameroun).
 *
 * La notification serveur est signée : `sign` vaut le MD5 de la concaténation
 * du secret de service puis des valeurs des paramètres triés par clé —
 * schéma documenté par Monetbil. Vérifiez la signature avant toute écriture.
 */
export class MonetbilProvider implements PaymentProvider {
  readonly name = "monetbil";

  constructor(
    private readonly serviceKey: string,
    private readonly serviceSecret: string,
  ) {}

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    const response = await fetch(`${WIDGET_ENDPOINT}/${this.serviceKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        amount: input.amountXaf,
        phone: input.phoneNumber,
        locale: "fr",
        currency: "XAF",
        item_ref: input.orderId,
        payment_ref: input.orderId,
        user: input.orderId,
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Monetbil a refusé l'initialisation (HTTP ${response.status}).`,
      );
    }

    const body = (await response.json()) as {
      success?: boolean;
      payment_url?: string;
      message?: string;
    };

    if (!body.success || !body.payment_url) {
      throw new Error(body.message ?? "Monetbil n'a pas renvoyé d'URL de paiement.");
    }

    return {
      transactionRef: input.orderId,
      paymentUrl: body.payment_url,
      raw: body,
    };
  }

  parseWebhook(payload: Record<string, unknown>): WebhookResult | null {
    const received = String(payload.sign ?? "");
    if (!received || received !== this.expectedSignature(payload)) {
      return null;
    }

    const status = String(payload.status ?? "").toLowerCase();

    return {
      transactionRef: String(
        payload.payment_ref ?? payload.item_ref ?? payload.transaction_UUID ?? "",
      ),
      status:
        status === "success"
          ? "SUCCESS"
          : status === "failed" || status === "cancelled"
            ? "FAILED"
            : "PENDING",
      raw: payload,
    };
  }

  private expectedSignature(payload: Record<string, unknown>): string {
    const concatenated = Object.keys(payload)
      .filter((key) => key !== "sign")
      .sort()
      .map((key) => String(payload[key] ?? ""))
      .join("");

    return createHash("md5")
      .update(this.serviceSecret + concatenated)
      .digest("hex");
  }
}
