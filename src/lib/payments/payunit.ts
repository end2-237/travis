import { timingSafeEqual } from "node:crypto";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  WebhookResult,
} from "@/lib/payments/types";

const GATEWAY_ENDPOINT = "https://api.payunit.net/api/gateway/initialize";

/**
 * Agrégateur PayUnit (multi-opérateurs Afrique centrale).
 * L'authentification combine Basic auth (api_user:api_password),
 * l'en-tête `x-api-key` et le mode (`test` ou `live`).
 */
export class PayUnitProvider implements PaymentProvider {
  readonly name = "payunit";

  constructor(
    private readonly apiUser: string,
    private readonly apiPassword: string,
    private readonly apiKey: string,
    private readonly mode: "test" | "live",
    private readonly webhookSecret: string,
  ) {}

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    const basic = Buffer.from(
      `${this.apiUser}:${this.apiPassword}`,
      "utf8",
    ).toString("base64");

    const response = await fetch(GATEWAY_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${basic}`,
        "x-api-key": this.apiKey,
        mode: this.mode,
      },
      body: JSON.stringify({
        total_amount: input.amountXaf,
        currency: "XAF",
        transaction_id: input.orderId,
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
        purchaseRef: input.orderId,
        name: "Feuille de route Travis",
        description: "Rapport d'orientation personnalisé",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `PayUnit a refusé l'initialisation (HTTP ${response.status}).`,
      );
    }

    const body = (await response.json()) as {
      statusCode?: number;
      data?: { transaction_id?: string; transaction_url?: string; t_url?: string };
      message?: string;
    };

    const url = body.data?.transaction_url ?? body.data?.t_url;
    if (!url) {
      throw new Error(body.message ?? "PayUnit n'a pas renvoyé d'URL de paiement.");
    }

    return {
      transactionRef: body.data?.transaction_id ?? input.orderId,
      paymentUrl: url,
      raw: body,
    };
  }

  parseWebhook(
    payload: Record<string, unknown>,
    headers: Headers,
  ): WebhookResult | null {
    // PayUnit authentifie la notification par un secret partagé en en-tête.
    const received = headers.get("x-payunit-signature") ?? "";
    if (!safeEqual(received, this.webhookSecret)) return null;

    const status = String(
      payload.transaction_status ?? payload.status ?? "",
    ).toUpperCase();

    return {
      transactionRef: String(
        payload.transaction_id ?? payload.purchaseRef ?? "",
      ),
      status:
        status === "SUCCESS" || status === "SUCCESSFUL"
          ? "SUCCESS"
          : status === "FAILED" || status === "CANCELLED"
            ? "FAILED"
            : "PENDING",
      raw: payload,
    };
  }
}

function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
