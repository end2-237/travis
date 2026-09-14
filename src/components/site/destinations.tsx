"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, GraduationCap, Wallet } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/site/photo";
import { CATALOG } from "@/data/catalog";
import { FIELD_FILTERS } from "@/lib/content";
import { cn, formatGpa, formatXaf } from "@/lib/utils";

/**
 * Section « destinations » de l'accueil — vitrine du catalogue réel.
 * Chaque carte mène à la fiche détaillée du programme, plus vers un
 * formulaire générique.
 */
export function Destinations() {
  const [active, setActive] = useState<string>("Tout");

  const filters = useMemo(() => ["Tout", ...FIELD_FILTERS], []);

  const cards = useMemo(() => {
    const pool =
      active === "Tout"
        ? CATALOG
        : CATALOG.filter((entry) => entry.eligible_fields.includes(active));

    // Six vitrines, en privilégiant la diversité des destinations.
    const seen = new Set<string>();
    const spread = pool.filter((entry) => {
      if (seen.has(entry.country)) return false;
      seen.add(entry.country);
      return true;
    });

    return [...spread, ...pool.filter((e) => !spread.includes(e))].slice(0, 6);
  }, [active]);

  return (
    <section id="destinations" className="shell pt-16 md:pt-24">
      <Reveal>
        <span className="eyebrow">Où étudier ?</span>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="section-title max-w-[17ch]">
            Meilleures destinations d&apos;études
          </h2>
          <p className="max-w-[44ch] text-[12px] leading-[1.6] text-ink-muted md:text-right">
            Explorez les programmes les plus accessibles depuis l&apos;Afrique
            centrale et de l&apos;Ouest, et mesurez l&apos;écart qui vous sépare
            de chacun d&apos;eux.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="rail mt-7 flex gap-2 pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              aria-pressed={active === filter}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-[12px] transition-all duration-300",
                active === filter
                  ? "border-transparent bg-ink text-white"
                  : "border-line bg-white text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Reveal key={card.slug} delay={Math.min(index, 3) * 70}>
            <Link
              href={`/destinations/${card.slug}`}
              className="group flex h-full flex-col rounded-panel bg-white p-2.5 shadow-card transition-transform duration-400 hover:-translate-y-1.5"
            >
              <Photo
                src={card.image}
                alt={`${card.title} — ${card.country}`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                className="h-[198px] rounded-[15px]"
                imageClassName="transition-transform duration-700 group-hover:scale-[1.06]"
              >
                <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-medium text-ink backdrop-blur-sm">
                  {card.country}
                </span>
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/92 text-ink backdrop-blur-sm transition-all duration-300 group-hover:bg-ink group-hover:text-white">
                  <ArrowUpRight
                    className="h-[15px] w-[15px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.9}
                  />
                </span>
                {card.fully_funded ? (
                  <span className="absolute bottom-3 left-3 rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold text-ink">
                    100 % financé
                  </span>
                ) : null}
              </Photo>

              <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
                <h3 className="min-h-[38px] text-[14px] font-semibold leading-[1.32] tracking-[-0.02em]">
                  {card.title}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" strokeWidth={1.7} />
                    dès {formatGpa(card.min_gpa_20)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" strokeWidth={1.7} />
                    {card.deadline_month}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Wallet className="h-3 w-3" strokeWidth={1.7} />
                    {card.degree_levels[0]}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <p className="text-[15px] font-semibold tracking-[-0.025em]">
                    {card.annual_cost_xaf === 0
                      ? "0 FCFA"
                      : formatXaf(card.annual_cost_xaf)}
                    <span className="ml-1 text-[11px] font-normal text-ink-muted">
                      {card.annual_cost_xaf === 0 ? "/ scolarité" : "/ an"}
                    </span>
                  </p>
                  <span className="flex h-9 items-center rounded-full bg-ink px-4 text-[11.5px] font-medium text-white transition-colors group-hover:bg-ink-soft">
                    Voir le détail
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 border-t border-line pt-2.5 text-[10.5px] leading-[1.5] text-ink-faint">
                  {card.funding_coverage}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="mt-8 flex justify-center">
          <Link
            href="/destinations"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-6 text-[13px] font-medium text-ink transition-colors hover:bg-surface-soft"
          >
            Voir les {CATALOG.length} programmes du catalogue
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
