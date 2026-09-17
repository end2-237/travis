import "server-only";
import { createVerify, createHash, timingSafeEqual } from "node:crypto";
import { normalizePhone } from "@/lib/phone";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentOperator,
  PaymentProvider,
  PaymentStatus,
  WebhookResult,
} from "@/lib/payments/types";

/**
 * pawaPay — API marchand v2.
 *
 * Deux principes tiennent cette intégration :
 *
 * 1. **La notification ne décide jamais du paiement.** Elle sert de
 *    déclencheur ; le statut est ensuite relu à la source, par un appel
 *    sortant authentifié vers `GET /v2/deposits/{id}`. Une notification
 *    forgée ne peut donc rien débloquer, même si la vérification de
 *    signature est désactivée côté tableau de bord. C'est la seule
 *    architecture qui reste sûre quand la configuration, elle, ne l'est pas.
 *
 * 2. **L'identifiant de dépôt est celui de la commande.** pawaPay exige un
 *    UUID et refuse les doublons (`DUPLICATE_IGNORED`) : réutiliser l'id de
 *    la commande rend le paiement naturellement idempotent — un double clic
 *    ne débite pas deux fois.
 *
 * Référence : https://docs.pawapay.io/v2/api-reference/deposits/initiate-deposit
 */

const SANDBOX = "https://api.sandbox.pawapay.io";
const PRODUCTION = "https://api.pawapay.io";

/**
 * Codes fournisseurs pawaPay pour le Cameroun.
 * Le XAF ne connaît pas de décimale : les montants partent en entier.
 */
const PROVIDERS: Record<PaymentOperator, string> = {
  MTN: "MTN_MOMO_CMR",
  ORANGE: "ORANGE_CMR",
};

/** Ce que le candidat doit lire, et non le code technique de l'opérateur. */
const FAILURE_MESSAGES: Record<string, string> = {
  PAYMENT_NOT_APPROVED:
    "Le paiement n'a pas été autorisé. Vous n'avez peut-être pas saisi votre code à temps — relancez et validez la demande sur votre téléphone.",
  INSUFFICIENT_BALANCE:
    "Solde insuffisant sur ce compte Mobile Money. Rechargez, puis relancez le paiement.",
  PAYMENT_IN_PROGRESS:
    "Une autre transaction est déjà en cours sur ce numéro. Patientez quelques minutes avant de relancer.",
  PAYER_NOT_FOUND:
    "Ce numéro n'appartient pas à l'opérateur choisi. Vérifiez que vous avez bien sélectionné MTN ou Orange.",
  WALLET_LIMIT_REACHED:
    "Le plafond de votre compte Mobile Money est atteint pour la période.",
  UNSPECIFIED_FAILURE:
    "L'opérateur a refusé la transaction sans en préciser la raison. Réessayez dans quelques minutes.",
};

interface DepositView {
  depositId: string;
  status: string;
  failureCode?: string | null;
}

export class PawaPayProvider implements PaymentProvider {
  readonly name = "pawapay";

  constructor(
    private readonly apiToken: string,
    private readonly mode: "sandbox" | "production",
    /** Clé publique PEM pour vérifier les notifications signées (optionnel). */
    private readonly callbackPublicKey: string | null,
  ) {}

  private get baseUrl(): string {
    return this.mode === "production" ? PRODUCTION : SANDBOX;
  }

  private headers(): HeadersInit {
    return {
      authorization: `Bearer ${this.apiToken}`,
      "content-type": "application/json",
      accept: "application/json",
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const phone = normalizePhone(input.phoneNumber);
    if (!phone) {
      throw new Error("Numéro Mobile Money invalide.");
    }

    const body = {
      // L'identifiant de la commande est déjà un UUID : il fait office de
      // clé d'idempotence côté pawaPay.
      depositId: input.orderId,
      payer: {
        type: "MMO",
        accountDetails: {
          phoneNumber: phone.msisdn,
          provider: PROVIDERS[input.operator],
        },
      },
      amount: String(Math.round(input.amountXaf)),
      currency: "XAF",
      clientReferenceId: input.orderId,
      // Ce libellé apparaît sur le téléphone du candidat au moment de
      // saisir son code : il doit dire ce qui est débité.
      customerMessage: "Travis - feuille de route",
    };

    const response = await fetch(`${this.baseUrl}/v2/deposits`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
      // Un agrégateur lent ne doit pas immobiliser une route serveur.
      signal: AbortSignal.timeout(20_000),
    });

    const payload = (await response.json().catch(() => null)) as {
      depositId?: string;
      status?: string;
      failureReason?: { failureCode?: string; failureMessage?: string };
    } | null;

    if (!response.ok || !payload) {
      throw new Error(
        `pawaPay a refusé la demande (HTTP ${response.status}). Réessayez dans un instant.`,
      );
    }

    if (payload.status === "REJECTED") {
      const code = payload.failureReason?.failureCode ?? "";
      throw new Error(
        FAILURE_MESSAGES[code] ??
          payload.failureReason?.failureMessage ??
          "L'opérateur a refusé la demande de paiement.",
      );
    }

    // ACCEPTED comme DUPLICATE_IGNORED signifient tous deux : la demande
    // existe côté pawaPay. Le second arrive sur un double envoi, et n'est
    // pas une erreur — c'est l'idempotence qui joue son rôle.
    return {
      transactionRef: payload.depositId ?? input.orderId,
      raw: payload,
    };
  }

  /**
   * Vérification de signature RFC-9421.
   *
   * Utile, mais jamais suffisante : le résultat du paiement est toujours
   * relu par `verifyStatus`. Sans clé publique configurée, on ne prétend
   * pas vérifier — on retourne la référence et c'est l'appel sortant qui
   * tranche.
   */
  parseWebhook(
    payload: Record<string, unknown>,
    headers: Headers,
    rawBody: string,
  ): WebhookResult | null {
    const deposit = readDeposit(payload);
    if (!deposit) return null;

    if (this.callbackPublicKey) {
      if (!verifySignature(headers, rawBody, this.callbackPublicKey)) {
        return null;
      }
    }

    return {
      transactionRef: deposit.depositId,
      status: toStatus(deposit.status),
      raw: payload,
    };
  }

  /**
   * Relit le statut à la source. C'est cet appel, et lui seul, qui autorise
   * la livraison du rapport.
   */
  async verifyStatus(transactionRef: string): Promise<PaymentStatus> {
    const response = await fetch(
      `${this.baseUrl}/v2/deposits/${encodeURIComponent(transactionRef)}`,
      {
        method: "GET",
        headers: this.headers(),
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      },
    );

    if (!response.ok) return "PENDING";

    const payload = (await response.json().catch(() => null)) as {
      status?: string;
      data?: Record<string, unknown>;
    } | null;

    // `NOT_FOUND` sur un dépôt que nous venons de créer signifie que
    // pawaPay ne l'a pas encore enregistré : c'est un « pas encore », pas
    // un échec. Le traiter comme un échec annulerait des paiements en cours.
    if (!payload || payload.status === "NOT_FOUND") return "PENDING";

    const deposit = readDeposit(payload);
    return deposit ? toStatus(deposit.status) : "PENDING";
  }

  /** Message lisible expliquant un échec, à afficher au candidat. */
  async failureMessage(transactionRef: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/deposits/${encodeURIComponent(transactionRef)}`,
        { headers: this.headers(), signal: AbortSignal.timeout(10_000), cache: "no-store" },
      );
      if (!response.ok) return null;
      const deposit = readDeposit(await response.json());
      if (!deposit?.failureCode) return null;
      return FAILURE_MESSAGES[deposit.failureCode] ?? null;
    } catch {
      return null;
    }
  }
}

/**
 * pawaPay renvoie tantôt le dépôt directement (notification), tantôt
 * enveloppé dans `data` (consultation). On accepte les deux formes plutôt
 * que de dépendre d'un détail susceptible de bouger.
 */
function readDeposit(payload: unknown): DepositView | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const source =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const depositId = source.depositId;
  const status = source.status;
  if (typeof depositId !== "string" || typeof status !== "string") return null;

  const failure = source.failureReason as { failureCode?: unknown } | undefined;

  return {
    depositId,
    status,
    failureCode:
      failure && typeof failure.failureCode === "string"
        ? failure.failureCode
        : null,
  };
}

/** Statuts pawaPay → les trois états que connaît l'application. */
function toStatus(status: string): PaymentStatus {
  switch (status) {
    case "COMPLETED":
      return "SUCCESS";
    case "FAILED":
    case "REJECTED":
      return "FAILED";
    // ACCEPTED, PROCESSING, IN_RECONCILIATION : le débit suit son cours.
    default:
      return "PENDING";
  }
}

/**
 * Vérification d'une notification signée (RFC-9421).
 *
 * Deux contrôles, dans l'ordre : l'empreinte du corps, puis la signature de
 * la base reconstruite. Si l'un des deux échoue, la notification est
 * rejetée sans autre examen.
 */
function verifySignature(
  headers: Headers,
  rawBody: string,
  publicKeyPem: string,
): boolean {
  try {
    const signatureInput = headers.get("signature-input");
    const signature = headers.get("signature");
    const contentDigest = headers.get("content-digest");
    if (!signatureInput || !signature) return false;

    // 1. Empreinte du corps — « sha-256=:BASE64: »
    if (contentDigest) {
      const match = /sha-(256|512)=:([^:]+):/i.exec(contentDigest);
      if (!match) return false;
      const computed = createHash(`sha${match[1]}`).update(rawBody).digest();
      const received = Buffer.from(match[2], "base64");
      if (
        computed.length !== received.length ||
        !timingSafeEqual(computed, received)
      ) {
        return false;
      }
    }

    // 2. Base de signature : les composants listés dans Signature-Input,
    //    dans leur ordre exact, puis la ligne @signature-params.
    const label = /^([^=]+)=/.exec(signatureInput)?.[1];
    if (!label) return false;

    const paramsStart = signatureInput.indexOf("=", label.length);
    const params = signatureInput.slice(paramsStart + 1).trim();
    const componentsRaw = /^\(([^)]*)\)/.exec(params)?.[1] ?? "";
    const components = componentsRaw
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => c.replace(/^"|"$/g, ""));

    const lines: string[] = [];
    for (const component of components) {
      if (component.startsWith("@")) {
        // Les composants dérivés dépendent de la requête reçue : l'URL
        // publique est celle que pawaPay a appelée, pas celle du conteneur.
        const value = derivedComponent(component, headers);
        if (value === null) return false;
        lines.push(`"${component}": ${value}`);
      } else {
        const value = headers.get(component);
        if (value === null) return false;
        lines.push(`"${component}": ${value}`);
      }
    }
    lines.push(`"@signature-params": ${params}`);

    const base = lines.join("\n");
    const signatureValue = /:([^:]+):/.exec(
      signature.slice(signature.indexOf("=") + 1),
    )?.[1];
    if (!signatureValue) return false;

    const verifier = createVerify("SHA256");
    verifier.update(base);
    verifier.end();

    return verifier.verify(
      { key: publicKeyPem, dsaEncoding: "ieee-p1363" },
      Buffer.from(signatureValue, "base64"),
    );
  } catch {
    return false;
  }
}

function derivedComponent(name: string, headers: Headers): string | null {
  switch (name) {
    case "@method":
      return "POST";
    case "@authority":
      return headers.get("x-forwarded-host") ?? headers.get("host");
    case "@path": {
      // Next ne réexpose pas le chemin d'origine dans les en-têtes : la
      // route de notification est unique et connue.
      return "/api/webhooks/payment";
    }
    default:
      return null;
  }
}
