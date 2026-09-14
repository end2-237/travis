"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ProviderCard } from "@/components/destination/document-checklist";
import { catalogEntry } from "@/data/catalog";
import type { RequiredDocument } from "@/data/procedure";
import {
  SERVICE_LABELS,
  servicesOfKind,
  type ServiceKind,
} from "@/data/services";
import { cn } from "@/lib/utils";
import type { ScoredScholarship } from "@/types/database";

/** Ordre de réalisation, pas ordre alphabétique : l'enchaînement compte. */
const ORDER: ServiceKind[] = [
  "etat-civil",
  "passeport",
  "legalisation",
  "traduction",
  "apostille",
  "langue",
  "medical",
  "photo",
  "financier",
  "visa",
];

/**
 * Démarches communes aux programmes retenus.
 *
 * Placée après les offres : tant que le candidat n'a pas choisi où
 * postuler, la question des traductions et des légalisations ne se pose pas.
 */
export function DossierSection({ matches }: { matches: ScoredScholarship[] }) {
  const kinds = useMemo(() => {
    const found = new Set<ServiceKind>();
    for (const match of matches.slice(0, 8)) {
      const entry = match.slug ? catalogEntry(match.slug) : null;
      if (!entry) continue;
      for (const doc of entry.required_documents as RequiredDocument[]) {
        found.add(doc.service);
      }
    }
    return ORDER.filter((k) => found.has(k));
  }, [matches]);

  const [active, setActive] = useState<ServiceKind | null>(kinds[0] ?? null);

  if (kinds.length === 0) return null;

  const providers = active ? servicesOfKind(active) : [];

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
      {/* Enchaînement des démarches */}
      <ol className="rail flex gap-2 lg:flex-col lg:gap-1">
        {kinds.map((kind, index) => (
          <li key={kind} className="shrink-0 lg:w-full">
            <button
              type="button"
              onClick={() => setActive(kind)}
              aria-pressed={active === kind}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-field px-3.5 py-2.5 text-left text-[12px] transition-colors",
                active === kind
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:bg-surface-soft hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  active === kind ? "text-white/50" : "text-ink-faint",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-nowrap font-medium lg:whitespace-normal">
                {SERVICE_LABELS[kind]}
              </span>
              {active === kind ? (
                <ArrowRight
                  className="ml-auto hidden h-3.5 w-3.5 lg:block"
                  strokeWidth={2}
                />
              ) : null}
            </button>
          </li>
        ))}
      </ol>

      <div className="space-y-3">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
