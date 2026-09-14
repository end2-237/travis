export type PaymentOperator = "MTN" | "ORANGE";

export interface CreatePaymentInput {
  orderId: string;
  amountXaf: number;
  phoneNumber: string;
  operator: PaymentOperator;
  /** URL de retour navigateur après paiement. */
  returnUrl: string;
  /** URL appelée par l'agrégateur pour notifier le résultat. */
  notifyUrl: string;
}

export interface CreatePaymentResult {
  /** Référence de transaction côté agrégateur. */
  transactionRef: string;
  /** Page de paiement hébergée, si l'agrégateur en fournit une. */
  paymentUrl?: string;
  raw?: unknown;
}

export interface WebhookResult {
  transactionRef: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /**
   * Vérifie l'authenticité de la notification et en extrait le résultat.
   * Retourne `null` si la signature est invalide.
   */
  parseWebhook(
    payload: Record<string, unknown>,
    headers: Headers,
    rawBody: string,
  ): WebhookResult | null;
}
