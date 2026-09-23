import Link from "next/link";
import { ArrowUpRight, BadgePercent, CircleCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Motif } from "@/components/site/motif";
import { Photo } from "@/components/site/photo";
import { PhotoSlider } from "@/components/site/photo-slider";
import { DEALS, DIAPOS_BOURSES } from "@/lib/content";
import {
  NB_DESTINATIONS,
  NB_INTEGRALES,
  NB_PROGRAMMES,
  NB_SANS_RESTE_A_CHARGE,
} from "@/data/stats";
import { cn } from "@/lib/utils";

/**
 * Trois repères chiffrés, comptés dans le catalogue.
 * Ils tiennent la colonne de texte à hauteur du diaporama : sans eux, le
 * titre flottait seul à côté d'un visuel deux fois plus haut que lui.
 */
const REPERES = [
  { valeur: NB_PROGRAMMES, libelle: "programmes documentés" },
  { valeur: NB_INTEGRALES, libelle: "bourses intégrales" },
  { valeur: NB_DESTINATIONS, libelle: "destinations" },
];

/**
 * Section « bourses » — en-tête éditorial et diaporama, puis deux cartes.
 *
 * L'en-tête ne portait qu'un titre et un lien « Tout voir » : sur un écran
 * large, la moitié droite de la section était vide avant même le premier
 * visuel. Le diaporama occupe cette moitié et sert à quelque chose — il
 * montre ce dont parle la section.
 */
export function Deals() {
  return (
    <section id="opportunites" className="relative pt-16 md:pt-24">
      <Motif nom="adinkra" opacite={0.06} fondu="radial" className="-z-10" />

      <div className="shell">
        <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <Reveal>
            <span className="eyebrow">Bourses ouvertes</span>

            <h2 className="section-title mt-5 max-w-[18ch]">
              Des opportunités rien que pour vous&nbsp;!
            </h2>

            <p className="mt-3.5 max-w-[50ch] text-[12.5px] leading-[1.65] text-ink-muted">
              Chaque programme est documenté à la main&nbsp;: ce que la bourse
              couvre, ce qu&apos;elle laisse à votre charge, la date de
              clôture, et le lien officiel pour candidater. Rien n&apos;est
              recopié d&apos;un agrégateur.
            </p>

            <ul className="mt-6 grid grid-cols-3 gap-3">
              {REPERES.map((repere) => (
                <li
                  key={repere.libelle}
                  className="rounded-card border border-line bg-white/80 px-3 py-3.5 backdrop-blur-sm"
                >
                  <span className="block text-[22px] font-semibold leading-none tracking-[-0.04em] md:text-[26px]">
                    {repere.valeur}
                  </span>
                  <span className="mt-1.5 block text-[10.5px] leading-[1.35] text-ink-muted">
                    {repere.libelle}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 inline-flex items-center gap-2 text-[11.5px] text-ink-muted">
              <CircleCheck
                className="h-4 w-4 shrink-0 text-positive"
                strokeWidth={1.9}
              />
              {NB_SANS_RESTE_A_CHARGE} programmes sans aucun reste à charge
              annuel
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/evaluation"
                className="lift inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-[13px] font-medium text-white hover:bg-ink-soft"
              >
                Tester mon admissibilité
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/destinations"
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-white px-5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-soft"
              >
                Parcourir le catalogue
              </Link>
            </div>
          </Reveal>

          <Reveal delay={90} from="right">
            <PhotoSlider
              diapos={[...DIAPOS_BOURSES]}
              etiquette="Photographies illustratives d'études à l'étranger"
              className="h-[300px] rounded-panel md:h-[380px] lg:h-[428px]"
              sizes="(max-width: 1024px) 100vw, 620px"
            />
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {DEALS.map((deal, index) => (
            <Reveal key={deal.title} delay={index * 90}>
              <Photo
                src={deal.image}
                alt={deal.title}
                scrim="tile"
                sizes="(max-width: 768px) 100vw, 620px"
                className="lift h-[280px] rounded-panel md:h-[310px]"
              >
                {/* Le dédale ocre accroche la lumière dans le coin haut
                    gauche, là où la photo est la plus sombre sous le voile. */}
                <Motif
                  nom="dedale"
                  opacite={0.14}
                  fondu="bas"
                  className="mix-blend-soft-light"
                />

                <div className="absolute inset-0 flex flex-col p-5 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/18 text-white backdrop-blur-md">
                      <BadgePercent className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="rounded-full border border-white/25 bg-white/14 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                      {deal.validity}
                    </span>
                  </div>

                  <div className="mt-auto flex items-end gap-4">
                    <span
                      className={cn(
                        "shrink-0 text-[44px] font-semibold leading-none tracking-[-0.045em] md:text-[52px]",
                        deal.percentTone === "gold" ? "text-gold" : "text-lime",
                      )}
                    >
                      {deal.percent}
                    </span>
                    <div className="pb-1">
                      <p className="text-[14px] font-medium leading-tight text-white">
                        {deal.title}
                      </p>
                      <p className="mt-1 max-w-[38ch] text-[11px] leading-[1.5] text-white/70">
                        {deal.body}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {deal.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </Photo>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
