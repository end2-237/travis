import { ArrowUpRight, Compass, Headset, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Motif } from "@/components/site/motif";
import { Photo } from "@/components/site/photo";
import { ABOUT_FEATURES, IMG } from "@/lib/content";

const ICONS = { compass: Compass, headset: Headset } as const;

/**
 * Section « Handpicked stays, honest prices » — colonne éditoriale à gauche,
 * visuel à droite surmonté de deux cartes de statistiques flottantes.
 */
export function About() {
  return (
    <section className="shell relative pt-16 md:pt-24">
      <Motif nom="kuba" opacite={0.07} fondu="bords" className="-z-10" />

      <Reveal>
        <span className="eyebrow">À propos</span>
      </Reveal>

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Reveal>
          <h2 className="section-title max-w-[16ch]">
            Des dossiers solides, des coûts honnêtes
          </h2>
          <p className="mt-3 max-w-[48ch] text-[12px] leading-[1.6] text-ink-muted">
            Une évaluation gratuite, un rapport à 500 FCFA, et aucun
            intermédiaire facturé au passage. Voilà tout le modèle.
          </p>

          <div className="mt-7 space-y-3">
            {ABOUT_FEATURES.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <div
                  key={feature.title}
                  className="lift rounded-card border border-line bg-white p-5 hover:shadow-card"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-sunk text-ink">
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-3.5 text-[14px] font-semibold tracking-[-0.02em]">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 max-w-[52ch] text-[11.5px] leading-[1.6] text-ink-muted">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={120} from="right" className="relative">
          <Photo
            src={IMG.about.src}
            alt={IMG.about.alt}
            sizes="(max-width: 1024px) 100vw, 620px"
            className="h-[340px] rounded-panel md:h-[420px] lg:h-[468px]"
          />

          {/* Carte flottante — admissibilité */}
          <div className="float-slow absolute left-4 top-6 w-[236px] rounded-[18px] bg-white p-4 shadow-float md:left-6 md:w-[264px]">
            <p className="text-[12px] font-semibold tracking-[-0.02em]">
              Statistiques
            </p>
            <p className="mt-3 text-[11px] text-ink-muted">
              Taux d&apos;admission suivi
            </p>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-[26px] font-semibold tracking-[-0.04em]">
                68,4&nbsp;%
              </span>
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
                <TrendingUp className="h-3 w-3" strokeWidth={2} />
                +12&nbsp;%
              </span>
            </div>
            <div className="mt-3 flex h-9 items-end gap-1">
              {[38, 52, 44, 66, 58, 82, 71].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-[3px] bg-surface-sunk last:bg-ink"
                />
              ))}
            </div>
          </div>

          {/* Carte flottante — coût de la feuille de route */}
          <div className="float-slow-delayed absolute bottom-6 right-4 w-[248px] rounded-[18px] bg-white p-4 shadow-float md:right-6 md:w-[276px]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold tracking-[-0.02em]">
                Feuille de route
              </p>
              <ArrowUpRight
                className="h-3.5 w-3.5 text-ink-muted"
                strokeWidth={2}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-surface-soft p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
                PDF
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-medium">
                  Rapport personnalisé
                </p>
                <p className="text-[10px] text-ink-muted">11 à 15 pages · Mobile Money</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[20px] font-semibold tracking-[-0.035em]">
                500 FCFA
              </span>
              <span className="rounded-full bg-surface-sunk px-2.5 py-1 text-[10px] text-ink-muted">
                Paiement unique
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
