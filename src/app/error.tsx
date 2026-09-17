"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Panne applicative.
 *
 * Sans ce fichier, une erreur de rendu affiche l'écran par défaut de Next :
 * en production, un fond blanc et « Application error: a client-side
 * exception has occurred ». Sur la page de résultats — celle qui suit une
 * évaluation que le candidat vient de remplir — c'est le pire endroit pour
 * perdre quelqu'un sans rien lui dire.
 *
 * Le message reste vague sur la cause, précis sur la marche à suivre : le
 * détail technique n'aide pas le candidat et peut renseigner un attaquant.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Le digest permet de retrouver la trace complète dans les journaux du
    // serveur, sans l'exposer ici.
    console.error("[travis]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="shell flex min-h-dvh flex-col items-center justify-center py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-sunk text-ink">
        <TriangleAlert className="h-5 w-5" strokeWidth={1.8} />
      </span>

      <h1 className="section-title mt-6 max-w-[20ch]">
        Quelque chose s&apos;est mal passé
      </h1>

      <p className="mx-auto mt-3 max-w-[48ch] text-[12.5px] leading-[1.65] text-ink-muted">
        L&apos;incident est enregistré de notre côté. Réessayez : la plupart du
        temps, une seconde tentative suffit.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center gap-2 rounded-btn bg-ink px-6 text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={2} />
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-btn border border-line bg-white px-6 text-[13px] font-medium text-ink transition-colors hover:bg-surface-soft"
        >
          Retour à l&apos;accueil
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-6 text-[11px] text-ink-muted">
          Référence de l&apos;incident : {error.digest}
        </p>
      ) : null}
    </main>
  );
}
