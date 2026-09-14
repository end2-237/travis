"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { MatchCard } from "@/components/results/match-card";
import type { ScoredScholarship } from "@/types/database";

/** Nombre de fiches dépliées d'emblée. */
const INITIAL = 8;

/**
 * Liste des programmes retenus.
 *
 * Les premières fiches sont ouvertes, le reste se déplie à la demande : toutes
 * les données restent accessibles sans paiement, mais la page ne s'étire pas
 * sur quinze écrans avant la section suivante.
 */
export function MatchList({ matches }: { matches: ScoredScholarship[] }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? matches : matches.slice(0, INITIAL);
  const remaining = matches.length - visible.length;

  return (
    <>
      <div className="grid gap-4">
        {visible.map((match, index) => (
          <Reveal key={match.id} delay={Math.min(index, 4) * 55}>
            <MatchCard match={match} rank={index + 1} />
          </Reveal>
        ))}
      </div>

      {remaining > 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-[13px] font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            Afficher les {remaining} autres programmes
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
          <p className="text-[11px] text-ink-faint">
            Toutes les fiches sont gratuites — aucune n&apos;est réservée au
            rapport.
          </p>
        </div>
      ) : null}
    </>
  );
}
