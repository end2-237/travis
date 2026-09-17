"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

type State = "PENDING" | "SUCCESS" | "FAILED";

/**
 * Suit la confirmation d'un paiement Mobile Money.
 *
 * La page affichait « Rechargez cette page dans quelques instants » et
 * n'en faisait rien : le candidat qui venait de saisir son code restait
 * devant un écran mort, et un paiement échoué montrait le même message
 * qu'un paiement en cours — sans issue ni relance.
 *
 * Trois règles :
 *
 * 1. **L'application va voir.** Chaque sondage interroge l'agrégateur par un
 *    appel serveur authentifié ; elle n'attend pas une notification qui
 *    peut se perdre.
 * 2. **L'intervalle s'allonge.** Une validation Mobile Money aboutit en
 *    général en moins d'une minute ; au-delà, sonder toutes les trois
 *    secondes ne sert qu'à consommer la batterie et le forfait du candidat.
 * 3. **L'attente a une fin.** Passé le délai, on le dit et on propose une
 *    action, plutôt que de tourner indéfiniment.
 */
export function PaymentWatcher({
  orderId,
  initialState,
}: {
  orderId: string;
  initialState: State;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [checking, setChecking] = useState(false);
  const stopped = useRef(initialState !== "PENDING");

  useEffect(() => {
    if (stopped.current) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    async function poll() {
      if (cancelled) return;

      const seconds = Math.round((Date.now() - startedAt) / 1000);
      setElapsed(seconds);

      // Au-delà de cinq minutes, l'opérateur ne répondra plus : on rend la
      // main plutôt que de sonder dans le vide.
      if (seconds > 300) {
        stopped.current = true;
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          cache: "no-store",
        });
        if (response.ok) {
          const payload = (await response.json()) as {
            status?: State;
            message?: string | null;
          };

          if (payload.status === "SUCCESS") {
            stopped.current = true;
            if (!cancelled) {
              setState("SUCCESS");
              // Le lien de téléchargement est rendu côté serveur : on
              // rafraîchit pour l'obtenir, sans recharger toute la page.
              router.refresh();
            }
            return;
          }

          if (payload.status === "FAILED") {
            stopped.current = true;
            if (!cancelled) {
              setState("FAILED");
              setMessage(payload.message ?? null);
            }
            return;
          }
        }
      } catch {
        // Réseau instable : on retentera au prochain tour.
      }

      // 3 s pendant la première minute, puis 8 s.
      timer = setTimeout(poll, seconds < 60 ? 3000 : 8000);
    }

    timer = setTimeout(poll, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, router]);

  async function checkNow() {
    setChecking(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        status?: State;
        message?: string | null;
      };
      if (payload.status === "SUCCESS") {
        setState("SUCCESS");
        router.refresh();
      } else if (payload.status === "FAILED") {
        setState("FAILED");
        setMessage(payload.message ?? null);
      }
    } catch {
      // Silencieux : le bouton reste disponible.
    } finally {
      setChecking(false);
    }
  }

  if (state === "SUCCESS") return null;

  if (state === "FAILED") {
    return (
      <div
        role="alert"
        className="mt-6 rounded-card border border-red-200 bg-red-50 p-5"
      >
        <p className="flex items-center gap-2 text-[13px] font-semibold text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
          Le paiement n&apos;a pas abouti
        </p>
        <p className="mt-2 text-[12px] leading-[1.6] text-red-800/85">
          {message ??
            "L'opérateur a refusé la transaction. Aucun montant n'a été débité."}
        </p>
        <Link
          href="/evaluation"
          className="mt-4 inline-flex h-11 items-center rounded-btn bg-ink px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Reprendre depuis mon évaluation
        </Link>
      </div>
    );
  }

  const tropLong = elapsed > 300;

  return (
    <div className="mt-6 rounded-card border border-line bg-surface-soft p-5">
      <p className="flex items-center gap-2 text-[12.5px] font-medium">
        {tropLong ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.9} />
        ) : (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-muted" />
        )}
        {tropLong
          ? "Toujours aucune confirmation"
          : "Validez la demande sur votre téléphone"}
      </p>

      <p className="mt-2 text-[11.5px] leading-[1.6] text-ink-muted">
        {tropLong
          ? "L'opérateur n'a rien confirmé depuis cinq minutes. Si vous avez été débité, le rapport sera généré automatiquement dès la confirmation — vérifiez à nouveau dans quelques minutes."
          : "Un message vous demande votre code Mobile Money. Cette page se met à jour toute seule dès que l'opérateur confirme — inutile de la recharger."}
      </p>

      <button
        type="button"
        onClick={checkNow}
        disabled={checking}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-btn border border-line bg-white px-4 text-[12px] font-medium text-ink transition-colors hover:bg-surface-soft disabled:opacity-60"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`}
          strokeWidth={1.9}
        />
        {checking ? "Vérification…" : "Vérifier maintenant"}
      </button>
    </div>
  );
}
