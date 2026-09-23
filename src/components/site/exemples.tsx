import { Reveal } from "@/components/motion/reveal";
import { Motif } from "@/components/site/motif";
import { PhotoSlider } from "@/components/site/photo-slider";
import { DIAPOS_PARCOURS, EXEMPLES_LECTURE } from "@/lib/content";
import { NB_INTEGRALES, NB_PROGRAMMES } from "@/data/stats";

/**
 * Section « Ce que le rapport dit ».
 *
 * Diaporama à gauche, cas de lecture à droite. Elle remplace la section de
 * témoignages, dont les deux clients — nom, photo, cinq étoiles — étaient
 * inventés de bout en bout.
 */
export function Exemples() {
  return (
    <section className="relative pt-16 md:pt-24">
      <Motif
        nom="adinkra"
        opacite={0.07}
        fondu="bords"
        className="-z-10"
      />

      <div className="shell">
        <Reveal className="flex justify-center">
          <span className="eyebrow">Exemples de lecture</span>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="section-title mt-6 text-center">
            Ce que le rapport dit, concrètement
          </h2>
          <p className="mx-auto mt-3 max-w-[62ch] text-center text-[11.5px] leading-[1.6] text-ink-muted">
            Trois profils, trois lectures du même catalogue de{" "}
            {NB_PROGRAMMES} programmes. Ce sont des cas de figure, pas des
            témoignages&nbsp;: Travis n&apos;a pas encore de promotion derrière
            lui, et n&apos;en inventera pas.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-4 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)]">
          <Reveal from="up">
            <PhotoSlider
              diapos={[...DIAPOS_PARCOURS]}
              etiquette="Photographies illustratives du parcours de candidature"
              className="min-h-[320px] rounded-panel lg:min-h-full"
              sizes="(max-width: 1024px) 100vw, 520px"
              intervalMs={5200}
            />
          </Reveal>

          <div className="grid gap-4">
            {EXEMPLES_LECTURE.map((item, index) => (
              <Reveal key={item.titre} from="right" delay={index * 90}>
                <figure className="lift relative flex h-full flex-col overflow-hidden rounded-panel bg-white p-6 shadow-card hover:shadow-float">
                  <Motif
                    nom="kuba"
                    opacite={0.06}
                    fondu="haut"
                    className="-z-0"
                  />

                  <div className="relative">
                    <span className="inline-flex rounded-full bg-surface-sunk px-2.5 py-1 text-[10px] font-medium text-ink-muted">
                      {item.profil}
                    </span>
                    <figcaption className="mt-3 text-[14px] font-semibold tracking-[-0.02em]">
                      {item.titre}
                    </figcaption>
                    <blockquote className="mt-2 text-[11.5px] leading-[1.65] text-ink-muted">
                      {item.body}
                    </blockquote>
                  </div>
                </figure>
              </Reveal>
            ))}

            <Reveal delay={280}>
              <p className="rounded-card border border-dashed border-line-strong px-5 py-4 text-[11px] leading-[1.6] text-ink-faint">
                Sur les {NB_PROGRAMMES} programmes du catalogue,{" "}
                {NB_INTEGRALES} couvrent la scolarité et le séjour en totalité.
                Ce chiffre est compté dans les données, pas annoncé&nbsp;: il
                change tout seul quand le catalogue change.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
