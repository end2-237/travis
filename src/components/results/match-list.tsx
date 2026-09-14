"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Globe2, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { MatchCard } from "@/components/results/match-card";
import type { ScoredScholarship } from "@/types/database";

/** Nombre de fiches dépliées d'emblée dans chaque groupe. */
const INITIAL = 6;

/**
 * Liste des programmes retenus, en deux groupes.
 *
 * Les destinations demandées passent devant, toujours, et dans leur propre
 * bloc : un candidat qui a coché la Turquie ne doit pas avoir à chercher la
 * Turquie au milieu de programmes indiens mieux notés.
 */
export function MatchList({ matches }: { matches: ScoredScholarship[] }) {
  const { targeted, others } = useMemo(
    () => ({
      targeted: matches.filter((m) => m.country_targeted),
      others: matches.filter((m) => !m.country_targeted),
    }),
    [matches],
  );

  // Sans destination demandée, tout est « ciblé » : un seul bloc, sans titre.
  const grouped = targeted.length > 0 && others.length > 0;

  if (!grouped) {
    return <Group matches={matches} offset={0} />;
  }

  return (
    <div className="space-y-12">
      <div>
        <GroupHeading
          icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />}
          title="Dans vos destinations"
          count={targeted.length}
          hint="Les pays que vous avez demandés, classés par compatibilité."
        />
        <Group matches={targeted} offset={0} />
      </div>

      <div>
        <GroupHeading
          icon={<Globe2 className="h-3.5 w-3.5" strokeWidth={1.8} />}
          title="Ailleurs, si vous élargissez"
          count={others.length}
          hint="Hors de vos destinations, mais compatibles avec votre profil."
        />
        <Group matches={others} offset={targeted.length} />
      </div>
    </div>
  );
}

function GroupHeading({
  icon,
  title,
  count,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  hint: string;
}) {
  return (
    <Reveal>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 border-b border-line pb-3.5">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
          <span className="text-ink-muted">{icon}</span>
          {title}
          <span className="rounded-full bg-surface-sunk px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            {count}
          </span>
        </h3>
        <p className="text-[11.5px] text-ink-muted">{hint}</p>
      </div>
    </Reveal>
  );
}

function Group({
  matches,
  offset,
}: {
  matches: ScoredScholarship[];
  offset: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? matches : matches.slice(0, INITIAL);
  const remaining = matches.length - visible.length;

  return (
    <>
      <div className="grid gap-4">
        {visible.map((match, index) => (
          <Reveal key={match.id} delay={Math.min(index, 4) * 55}>
            <MatchCard match={match} rank={offset + index + 1} />
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
            Afficher les {remaining} autres
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
