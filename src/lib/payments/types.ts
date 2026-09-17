export type PaymentOperator = "MTN" | "ORANGE";

/** Les trois seuls états qui intéressent l'application. */
export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

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
  status: PaymentStatus;
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  /**
   * Vérifie l'authenticité de la notification et en extrait la référence.
   * Retourne `null` si la signature est invalide.
   */
  parseWebhook(
    payload: Record<string, unknown>,
    headers: Headers,
    rawBody: string,
  ): WebhookResult | null;

  /**
   * Relit le statut auprès de l'agrégateur, par un appel sortant
   * authentifié.
   *
   * C'est ce que consulte l'application avant de livrer quoi que ce soit.
   * Une notification entrante n'est qu'un signal : elle dit « va voir »,
   * elle ne dit pas « c'est payé ». Un agrégateur dont la vérification de
   * signature serait mal configurée ne peut alors rien débloquer.
   *
   * Absent : l'agrégateur ne propose pas de consultation, et la
   * notification vérifiée fait foi.
   */
  verifyStatus?(transactionRef: string): Promise<PaymentStatus>;

  /** Message lisible expliquant un échec, à montrer au candidat. */
  failureMessage?(transactionRef: string): Promise<string | null>;
}
