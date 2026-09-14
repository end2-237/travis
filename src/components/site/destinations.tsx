"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Heart, Star, Users } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { DESTINATIONS, FIELD_FILTERS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Section « Best travel destination » — intitulé à gauche, chapô à droite,
 * rail de filtres, puis grille 3 × 2 de cartes programme.
 */
export function Destinations() {
  const [active, setActive] = useState<string>("Tout");

  const filters = useMemo(() => ["Tout", ...FIELD_FILTERS], []);
  const cards = useMemo(
    () =>
      active === "Tout"
        ? DESTINATIONS
        : DESTINATIONS.filter((d) => d.field === active),
    [active],
  );

  return (
    <section id="destinations" className="shell pt-16 md:pt-24">
      <span className="eyebrow">Où étudier ?</span>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="section-title max-w-[17ch]">
          Meilleures destinations d&apos;études
        </h2>
        <p className="max-w-[44ch] text-[12px] leading-[1.6] text-ink-muted md:text-right">
          Explorez les programmes les plus accessibles depuis l&apos;Afrique
          centrale et de l&apos;Ouest, et mesurez l&apos;écart qui vous sépare de
          chacun d&apos;eux.
        </p>
      </div>

      {/* Filtres par filière */}
      <div className="rail mt-7 flex gap-2 pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            aria-pressed={active === filter}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-[12px] transition-colors",
              active === filter
                ? "border-transparent bg-ink text-white"
                : "border-line bg-white text-ink-muted hover:text-ink",
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="group flex flex-col rounded-panel bg-white p-2.5 shadow-card"
          >
            <Photo
              src={card.image}
              alt={`${card.title} — ${card.country}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="h-[198px] rounded-[15px]"
              imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
            >
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-ink backdrop-blur-sm">
                {card.country}
              </span>
              <button
                type="button"
                aria-label={`Ajouter ${card.title} à mes favoris`}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink backdrop-blur-sm transition-colors hover:bg-white"
              >
                <Heart className="h-[15px] w-[15px]" strokeWidth={1.7} />
              </button>
            </Photo>

            <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
              <h3 className="min-h-[38px] text-[14px] font-semibold leading-[1.32] tracking-[-0.02em]">
                {card.title}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] text-ink-muted">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" strokeWidth={1.7} />
                  {card.applicants}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" strokeWidth={1.7} />
                  {card.deadline}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-star text-star" strokeWidth={0} />
                  {card.rating}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold tracking-[-0.025em]">
                  {card.price}
                  <span className="ml-1 text-[11px] font-normal text-ink-muted">
                    {card.unit}
                  </span>
                </p>
                <Link
                  href="/evaluation"
                  className="flex h-9 items-center rounded-full bg-ink px-4 text-[11.5px] font-medium text-white transition-colors hover:bg-ink-soft"
                >
                  Voir le détail
                </Link>
              </div>

              <p className="mt-3 border-t border-line pt-2.5 text-[10.5px] leading-[1.5] text-ink-faint">
                {card.footnote}
              </p>
            </div>
          </article>
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="mt-10 text-center text-[13px] text-ink-muted">
          Aucun programme vitrine pour cette filière — lancez l&apos;évaluation
          pour interroger l&apos;ensemble du catalogue.
        </p>
      ) : null}
    </section>
  );
}
