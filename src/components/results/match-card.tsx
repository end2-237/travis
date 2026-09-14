import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  Languages,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { catalogEntry } from "@/data/catalog";
import { cn, formatGpa, formatXaf } from "@/lib/utils";
import type { ScoredScholarship } from "@/types/database";

/**
 * Fiche complète d'un programme retenu.
 *
 * Rien n'est masqué : le nom, l'établissement, les montants, l'échéance et le
 * lien officiel sont visibles avant tout paiement. Le rapport payant apporte
 * la version imprimable et le calendrier personnalisé, pas l'information.
 */
export function MatchCard({
  match,
  rank,
}: {
  match: ScoredScholarship;
  rank: number;
}) {
  const entry = match.slug ? catalogEntry(match.slug) : null;
  const website = match.official_website ?? match.application_url;

  return (
    <article className="rounded-panel bg-white p-5 shadow-card transition-transform duration-300 hover:-translate-y-0.5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-sunk text-[12px] font-semibold text-ink">
            {rank}
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-[1.3] tracking-[-0.02em]">
              {entry ? (
                <Link
                  href={`/destinations/${match.slug}`}
                  className="transition-colors hover:text-ink-muted"
                >
                  {match.title}
                </Link>
              ) : (
                match.title
              )}
            </h3>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              {match.institution ?? "Établissement partenaire"} · {match.country}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums",
            match.fit_score >= 75
              ? "bg-positive/10 text-positive"
              : "bg-surface-sunk text-ink-muted",
          )}
        >
          {match.fit_score}&nbsp;%
        </span>
      </div>

      {entry ? (
        <p className="mt-4 text-[12.5px] leading-[1.65] text-ink-soft">
          {entry.summary}
        </p>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-line pt-4 sm:grid-cols-4">
        <Fact
          icon={<Wallet className="h-3.5 w-3.5" strokeWidth={1.7} />}
          label="Reste à charge"
          value={
            Number(match.annual_cost_xaf) === 0
              ? "0 FCFA"
              : `${formatXaf(Number(match.annual_cost_xaf))} / an`
          }
        />
        <Fact
          icon={<TrendingUp className="h-3.5 w-3.5" strokeWidth={1.7} />}
          label="Votre marge"
          value={`${match.gpa_margin >= 0 ? "+" : ""}${match.gpa_margin
            .toFixed(2)
            .replace(".", ",")} pts`}
          hint={`Seuil ${formatGpa(Number(match.min_gpa_20))}`}
        />
        <Fact
          icon={<CalendarDays className="h-3.5 w-3.5" strokeWidth={1.7} />}
          label="Clôture"
          value={match.deadline_month ?? "À confirmer"}
        />
        <Fact
          icon={<Languages className="h-3.5 w-3.5" strokeWidth={1.7} />}
          label="Langue"
          value={match.language_requirements ?? "À confirmer"}
        />
      </dl>

      {match.funding_coverage ? (
        <p className="mt-4 rounded-card bg-surface-soft px-4 py-3 text-[11.5px] leading-[1.55] text-ink-soft">
          <span className="font-medium text-ink">Financement&nbsp;:</span>{" "}
          {match.funding_coverage}
        </p>
      ) : null}

      {!match.within_budget ? (
        <p className="mt-3 rounded-card border border-gold/40 bg-gold/10 px-4 py-3 text-[11.5px] leading-[1.55] text-ink-soft">
          Ce programme dépasse le budget que vous avez déclaré. Il reste listé
          parce que votre niveau y ouvre droit — à arbitrer selon vos moyens
          réels.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {entry ? (
          <Link
            href={`/destinations/${match.slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-ink px-4 text-[12px] font-medium text-white transition-colors hover:bg-ink-soft"
          >
            Voir la procédure complète
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        ) : null}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-btn border border-line px-4 text-[12px] font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            Site officiel
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function Fact({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[10.5px] text-ink-muted">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-[12.5px] font-medium leading-[1.35]">{value}</dd>
      {hint ? (
        <dd className="mt-0.5 text-[10.5px] text-ink-faint">{hint}</dd>
      ) : null}
    </div>
  );
}
