"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Loader2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const INCLUDED = [
  "Votre calendrier personnel, calé sur les clôtures de vos programmes",
  "La checklist documentaire avec les référents de légalisation",
  "Le récapitulatif chiffré de chaque programme retenu",
  "Un document imprimable, consultable hors ligne",
] as const;

const OPERATORS = [
  { id: "MTN", label: "MTN Mobile Money" },
  { id: "ORANGE", label: "Orange Money" },
] as const;

/** Tunnel de micro-paiement à 500 FCFA (cf. SRS §3, étape 3). */
export function UnlockPanel({
  profileId,
  phoneNumber,
  total,
}: {
  profileId: string;
  phoneNumber: string;
  total: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [operator, setOperator] = useState<"MTN" | "ORANGE">("MTN");
  const [phone, setPhone] = useState(phoneNumber);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          phone_number: phone,
          operator,
        }),
      });

      const payload = (await response.json()) as {
        order_id?: string;
        payment_url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Paiement indisponible");
      }

      if (payload.payment_url) {
        window.location.href = payload.payment_url;
        return;
      }

      router.push(`/telechargement/${payload.order_id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Le paiement n'a pas pu démarrer.",
      );
      setPending(false);
    }
  }

  return (
    <aside className="rounded-panel bg-white p-6 shadow-card">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunk px-2.5 py-1 text-[10.5px] font-medium text-ink-muted">
        <Download className="h-3 w-3" strokeWidth={2} />
        Document à emporter
      </span>

      <h2 className="mt-4 text-[19px] font-semibold leading-[1.2] tracking-[-0.03em]">
        Feuille de route stratégique
      </h2>
      <p className="mt-2 text-[11.5px] leading-[1.6] text-ink-muted">
        Vos {total} programme{total > 1 ? "s" : ""} et leurs démarches, mis en
        ordre dans un PDF que vous gardez. Les informations restent gratuites
        et visibles ci-dessus.
      </p>

      <ul className="mt-5 space-y-2.5">
        {INCLUDED.map((item) => (
          <li key={item} className="flex gap-2.5 text-[11.5px] leading-[1.5]">
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive"
              strokeWidth={2.4}
            />
            <span className="text-ink-soft">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
        <div>
          <p className="text-[28px] font-semibold leading-none tracking-[-0.04em]">
            500 FCFA
          </p>
          <p className="mt-1.5 text-[11px] text-ink-muted">
            Paiement unique · 8 pages PDF
          </p>
        </div>
        <span className="rounded-full bg-surface-sunk px-2.5 py-1 text-[10px] text-ink-muted">
          Sans abonnement
        </span>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 h-12 w-full rounded-btn bg-ink text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Obtenir mon PDF (500 FCFA)
        </button>
      ) : (
        <div className="mt-5 rounded-card border border-line bg-surface-soft p-4">
          <p className="text-[12px] font-medium">Payer par Mobile Money</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {OPERATORS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOperator(item.id)}
                aria-pressed={operator === item.id}
                className={cn(
                  "h-11 rounded-field border text-[11.5px] font-medium transition-colors",
                  operator === item.id
                    ? "border-ink bg-white text-ink"
                    : "border-line bg-white text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[11px] text-ink-muted">
              Numéro à débiter
            </span>
            <div className="relative">
              <Smartphone
                className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint"
                strokeWidth={1.7}
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="h-11 w-full rounded-field border border-line bg-white pl-9 pr-3 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
              />
            </div>
          </label>

          {error ? (
            <p className="mt-3 rounded-field border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={startCheckout}
            disabled={pending}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-ink text-[13px] font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initialisation…
              </>
            ) : (
              "Confirmer et payer 500 FCFA"
            )}
          </button>

          <p className="mt-3 text-[10.5px] leading-[1.5] text-ink-faint">
            Vous recevrez une demande de confirmation sur votre téléphone. Le
            rapport se génère dès la validation du paiement.
          </p>
        </div>
      )}
    </aside>
  );
}
