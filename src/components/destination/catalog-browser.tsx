"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/site/photo";
import { CATALOG, COUNTRIES_IN_CATALOG } from "@/data/catalog";
import { FIELDS } from "@/lib/taxonomy";
import { cn, formatGpa, formatXaf } from "@/lib/utils";

type Funding = "tous" | "integral" | "reduit";

/** Parcours filtré du catalogue complet. */
/** Trois rangées pleines en grand écran, largement de quoi se faire une idée. */
const PAR_PAGE = 12;

export function CatalogBrowser() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [funding, setFunding] = useState<Funding>("tous");

  /**
   * Nombre de fiches rendues.
   *
   * Les 50 programmes d'un coup, c'est 50 images à décoder et 22 écrans de
   * hauteur : la plus grande image visible mettait 3,5 s à s'afficher sur un
   * mobile d'entrée de gamme en 3G — le public exact de ce produit. On rend
   * ce qu'un visiteur parcourt réellement avant de filtrer, et il demande la
   * suite s'il la veut.
   */
  const [visibles, setVisibles] = useState(PAR_PAGE);

  /*
   * Un nouveau filtre rend une nouvelle liste : conserver le décompte
   * précédent afficherait « 36 / 4 », ou masquerait des fiches sans que rien
   * ne l'indique.
   *
   * L'ajustement a lieu pendant le rendu, pas dans un effet. React relance
   * alors le rendu sans rien peindre entre les deux ; un effet, lui,
   * afficherait d'abord l'ancien décompte puis le corrigerait — un
   * scintillement, et une cascade de rendus que la règle
   * `set-state-in-effect` signale à juste titre.
   */
  const cleFiltres = `${query}|${country}|${field}|${funding}`;
  const [derniereCle, setDerniereCle] = useState(cleFiltres);
  if (cleFiltres !== derniereCle) {
    setDerniereCle(cleFiltres);
    setVisibles(PAR_PAGE);
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return CATALOG.filter((entry) => {
      if (country && entry.country !== country) return false;
      if (field && !entry.eligible_fields.includes(field)) return false;
      if (funding === "integral" && !entry.fully_funded) return false;
      if (funding === "reduit" && entry.fully_funded) return false;
      if (!needle) return true;

      return (
        entry.title.toLowerCase().includes(needle) ||
        entry.institution.toLowerCase().includes(needle) ||
        entry.country.toLowerCase().includes(needle)
      );
    });
  }, [query, country, field, funding]);



  const reset = () => {
    setQuery("");
    setCountry("");
    setField("");
    setFunding("tous");
  };

  const filtered = Boolean(query || country || field || funding !== "tous");

  return (
    <>
      {/* Filtres */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-line bg-canvas/90 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6">
        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={1.7}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un programme, une université, un pays…"
              aria-label="Rechercher dans le catalogue"
              className="h-11 w-full rounded-field border border-line bg-white pl-10 pr-3 text-[12.5px] outline-none placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
            />
          </div>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filtrer par pays"
            className="h-11 rounded-field border border-line bg-white px-3.5 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          >
            <option value="">Toutes les destinations</option>
            {COUNTRIES_IN_CATALOG.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            aria-label="Filtrer par filière"
            className="h-11 rounded-field border border-line bg-white px-3.5 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          >
            <option value="">Toutes les filières</option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <div className="flex rounded-full bg-surface-sunk p-1">
            {(
              [
                ["tous", "Tous"],
                ["integral", "100 %"],
                ["reduit", "Réduits"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFunding(value)}
                aria-pressed={funding === value}
                className={cn(
                  "h-9 flex-1 whitespace-nowrap rounded-full px-3 text-[11.5px] font-medium transition-all",
                  funding === value
                    ? "bg-white text-ink shadow-pill"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-[11.5px] text-ink-muted">
            {results.length} programme{results.length > 1 ? "s" : ""}
            {filtered ? " correspondant à vos filtres" : " au catalogue"}
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={reset}
              className="text-[11.5px] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="py-20 text-center text-[13px] text-ink-muted">
          Aucun programme ne correspond à cette combinaison de filtres.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, visibles).map((entry, index) => (
            <Reveal key={entry.slug} delay={Math.min(index, 5) * 45}>
              <Link
                href={`/destinations/${entry.slug}`}
                className="group flex h-full flex-col rounded-panel bg-white p-2.5 shadow-card transition-transform duration-400 hover:-translate-y-1.5"
              >
                <Photo
                  src={entry.image}
                  alt={`${entry.title} — ${entry.country}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  // Les deux premières vignettes sont au-dessus de la ligne
                  // de flottaison : en chargement paresseux, le navigateur
                  // attend la fin de la mise en page pour les demander, et
                  // c'est justement l'une d'elles qui constitue le plus grand
                  // élément peint. Sur un mobile bridé, cette attente coûtait
                  // plus d'une seconde.
                  priority={index < 2}
                  className="h-[160px] rounded-[15px]"
                  imageClassName="transition-transform duration-700 group-hover:scale-[1.06]"
                >
                  <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-medium text-ink backdrop-blur-sm">
                    {entry.country}
                  </span>
                  {entry.fully_funded ? (
                    <span className="absolute bottom-3 left-3 rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold text-ink">
                      100 % financé
                    </span>
                  ) : null}
                </Photo>

                <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
                  <h2 className="min-h-[38px] text-[13.5px] font-semibold leading-[1.32] tracking-[-0.02em]">
                    {entry.title}
                  </h2>
                  <p className="mt-1.5 truncate text-[11px] text-ink-muted">
                    {entry.institution}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-[13px] font-semibold tracking-[-0.02em]">
                      {entry.annual_cost_xaf === 0
                        ? "0 FCFA"
                        : formatXaf(entry.annual_cost_xaf)}
                    </span>
                    <span className="text-[10.5px] text-ink-muted">
                      dès {formatGpa(entry.min_gpa_20)}
                    </span>
                  </div>

                  <span className="mt-3 inline-flex items-center gap-1 border-t border-line pt-2.5 text-[11px] font-medium text-ink">
                    Voir la fiche
                    <ArrowUpRight
                      className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {results.length > visibles ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibles((n) => n + PAR_PAGE)}
            className="lift inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-6 text-[13px] font-medium text-ink hover:bg-surface-soft"
          >
            Afficher {Math.min(PAR_PAGE, results.length - visibles)} programmes
            de plus
            <span className="text-ink-muted">
              ({visibles} / {results.length})
            </span>
          </button>
        </div>
      ) : null}
    </>
  );
}
