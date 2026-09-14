import Link from "next/link";
import { ArrowUpRight, Check, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramVerdict } from "@/types/database";

/**
 * Verdict d'une évaluation ciblée sur un programme unique.
 *
 * Affiché même — et surtout — quand le candidat n'est pas éligible : chaque
 * critère bloquant est assorti de ce qu'il faut faire pour le lever.
 */
export function ProgramVerdictCard({ verdict }: { verdict: ProgramVerdict }) {
  const blocking = verdict.checks.filter((c) => !c.passed);

  return (
    <section className="overflow-hidden rounded-panel bg-white shadow-card">
      <div
        className={cn(
          "px-6 py-6 md:px-8",
          verdict.eligible ? "bg-ink text-white" : "bg-surface-sunk",
        )}
      >
        <p
          className={cn(
            "text-[10.5px] font-medium uppercase tracking-[0.08em]",
            verdict.eligible ? "text-white/60" : "text-ink-muted",
          )}
        >
          Verdict pour ce programme
        </p>
        <h2
          className={cn(
            "mt-2.5 text-[20px] font-semibold leading-[1.25] tracking-[-0.03em] md:text-[24px]",
            verdict.eligible ? "text-white" : "text-ink",
          )}
        >
          {verdict.title}
        </h2>
        <p
          className={cn(
            "mt-1.5 text-[11.5px]",
            verdict.eligible ? "text-white/60" : "text-ink-muted",
          )}
        >
          {verdict.institution} · {verdict.country}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold",
              verdict.eligible
                ? "bg-white text-ink"
                : "bg-white text-ink",
            )}
          >
            {verdict.eligible ? (
              <>
                <Check className="h-3.5 w-3.5 text-positive" strokeWidth={2.6} />
                Éligible — compatibilité {verdict.fit_score}&nbsp;%
              </>
            ) : (
              <>
                <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2.2} />
                {blocking.length} critère{blocking.length > 1 ? "s" : ""} à lever
              </>
            )}
          </span>
          <span
            className={cn(
              "text-[12px]",
              verdict.eligible ? "text-white/70" : "text-ink-muted",
            )}
          >
            {verdict.headline}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {verdict.checks.map((check) => (
          <li key={check.label} className="flex gap-3.5 px-6 py-4 md:px-8">
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                check.passed
                  ? "bg-positive/12 text-positive"
                  : "bg-red-50 text-red-600",
              )}
            >
              {check.passed ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <X className="h-3 w-3" strokeWidth={3} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium">{check.label}</p>
              <p className="mt-0.5 text-[11.5px] leading-[1.55] text-ink-muted">
                {check.detail}
              </p>
              {check.remedy ? (
                <p className="mt-2 rounded-[10px] bg-surface-soft px-3.5 py-2.5 text-[11px] leading-[1.55] text-ink-soft">
                  <span className="font-medium text-ink">Ce qu&apos;il faut faire — </span>
                  {check.remedy}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-line px-6 py-5 md:px-8">
        <Link
          href={`/destinations/${verdict.slug}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-ink px-4 text-[12px] font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Procédure complète de ce programme
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
        <span className="text-[11px] text-ink-faint">
          Dossier, partenaires, budget et calendrier détaillés.
        </span>
      </div>
    </section>
  );
}
