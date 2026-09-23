import { Sparkles } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { WordRise } from "@/components/motion/split-words";
import { Motif } from "@/components/site/motif";
import { Photo } from "@/components/site/photo";
import { PhotoRail } from "@/components/site/photo-rail";
import { Navbar } from "@/components/site/navbar";
import { QuickCheckCard } from "@/components/site/quick-check-card";
import { CATALOG } from "@/data/catalog";
import { NB_DESTINATIONS, NB_PROGRAMMES } from "@/data/stats";
import { IMG } from "@/lib/content";

/**
 * Photos du bandeau défilant du héros.
 *
 * Ce sont les visuels de destination du catalogue, pas des images
 * d'ambiance : chacun a été ouvert et vérifié dans `data/images.ts`, et
 * correspond au pays qu'il annonce. Le bandeau montre donc réellement où
 * mènent les programmes, au lieu de meubler le bas de la bannière.
 *
 * Les consortiums multi-pays et les destinations sans visuel vérifié sont
 * écartés : un bandeau de vingt vignettes dont quatre montrent la même image
 * neutre se lit comme une erreur d'affichage.
 */
const VIGNETTES = (() => {
  const vues = new Map<string, string>();
  for (const entree of CATALOG) {
    if (entree.country === "Multi-pays" || vues.has(entree.country)) continue;
    vues.set(entree.country, entree.image);
  }
  const uniques = new Map<string, { src: string; alt: string }>();
  for (const [pays, src] of vues) {
    // Deux pays peuvent partager un visuel de repli : on ne garde que le
    // premier, sinon la même vignette revient plusieurs fois dans la boucle.
    if (uniques.has(src)) continue;
    uniques.set(src, { src, alt: pays });
  }
  return [...uniques.values()].slice(0, 16);
})();

export function Hero() {
  return (
    <header className="px-3 pt-3 md:px-5 md:pt-5">
      {/* Le visuel remplit le bloc en fond : la scène grandit donc avec son
          contenu en mobile, et se fige à 820 px à partir de `lg`. Le grain se
          pose par-dessus la photo et casse le lissé du dégradé JPEG. */}
      <div className="grain relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-stage lg:h-[820px]">
        <Parallax amount={56} className="absolute inset-0">
          <Photo
            src={IMG.hero.src}
            alt={IMG.hero.alt}
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full"
          />
        </Parallax>

        {/* Voile de lecture solidaire du cadre, et non de la photo : dans le
            parallaxe, il glissait avec l'image et sa partie dense quittait le
            bas de la scène, là où se trouve le titre. */}
        <div aria-hidden className="scrim absolute inset-0" />

        {/* Dédale kuba en lumière douce : il n'assombrit rien, il donne au
            voile une trame au lieu d'un aplat noir. */}
        <Motif
          nom="dedale"
          opacite={0.1}
          fondu="haut"
          className="mix-blend-soft-light"
        />

        <Navbar />

        {/* Bloc éditorial + carte d'évaluation, alignés sur la ligne de base.
            Le bas est dégagé pour le bandeau de destinations. */}
        <div className="relative z-10 flex min-h-[560px] items-end px-5 pb-[136px] pt-24 md:min-h-[700px] md:px-10 md:pb-[168px] lg:h-full lg:px-14">
          <div className="grid w-full grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Reveal duration={850}>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/30 bg-white/14 px-3 text-[11px] font-medium text-white backdrop-blur-md">
                  <Sparkles className="h-3 w-3" strokeWidth={2} />
                  Sessions 2026 ouvertes
                </span>
              </Reveal>

              {/* Le titre est au-dessus de la ligne de flottaison : ses mots se
                  relèvent au chargement, sans attendre un défilement. */}
              <WordRise
                as="h1"
                lines={["Trouvez Votre Bourse,", "Bâtissez Votre Avenir"]}
                delay={160}
                className="mt-4 text-[34px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-[44px] md:text-[52px] lg:text-[56px]"
              />

              <Reveal duration={850} delay={520}>
                <p className="mt-4 max-w-[54ch] text-[13px] leading-[1.6] text-white/80 md:text-[14px]">
                  Évaluez gratuitement votre admissibilité sur{" "}
                  {NB_PROGRAMMES} bourses et universités réelles, puis consultez
                  chaque procédure en détail — budget, échéances et liens
                  officiels.
                </p>
              </Reveal>
            </div>

            <Reveal
              className="lg:col-span-5 lg:col-start-8"
              from="up"
              delay={140}
              duration={850}
            >
              <QuickCheckCard />
            </Reveal>
          </div>
        </div>

        {/* Bandeau des destinations, en bas de la scène. Il occupe la bande
            que le voile laissait vide et dit, en images, ce que la phrase
            au-dessus annonce en chiffres. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div
            aria-hidden
            className="h-20 bg-gradient-to-t from-black/45 to-transparent"
          />
          <div className="bg-gradient-to-t from-black/45 to-black/25 pb-3.5 pt-1 backdrop-blur-[2px]">
            <p className="shell mb-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/70">
              {NB_DESTINATIONS} destinations couvertes
            </p>
            <PhotoRail
              photos={VIGNETTES}
              durationSeconds={64}
              hauteur="h-[62px] md:h-[76px]"
              largeur="w-[102px] md:w-[124px]"
              className="[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
