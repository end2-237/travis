import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { WordRise } from "@/components/motion/split-words";
import { BandeKente, Motif } from "@/components/site/motif";
import { Photo } from "@/components/site/photo";
import { IMG } from "@/lib/content";

/**
 * Bandeau final — visuel pleine largeur, titre dont les mots se relèvent au
 * passage, et bouton circulaire bleu en bas à droite.
 */
export function CtaBanner() {
  return (
    <section id="contact" className="shell pt-16 md:pt-24">
      <Reveal>
        <Photo
          src={IMG.banner.src}
          alt={IMG.banner.alt}
          scrim="tile"
          sizes="100vw"
          className="grain min-h-[400px] rounded-stage md:min-h-[460px] lg:h-[510px]"
        >
          {/* Trame adinkra claire sur le voile : le bandeau final était le
              plus grand aplat sombre de la page. */}
          <Motif
            nom="adinkra-clair"
            opacite={0.12}
            fondu="radial"
            className="z-[1]"
          />

          <div className="absolute inset-0 z-10 flex flex-col justify-center p-7 md:p-12 lg:p-14">
            {/* Titre bas de page : la montée des mots suit le défilement,
                sinon elle serait jouée bien avant qu'on y arrive. */}
            {/* Une seule ligne déclarée : c'est `max-w-[13ch]` qui décide des
                retours, comme sur la maquette. Forcer la coupure ici la
                ferait tomber une deuxième fois sur écran étroit. */}
            <WordRise
              on="scroll"
              lines={["Débloquez Votre Feuille de Route Stratégique"]}
              className="max-w-[13ch] text-[32px] font-semibold leading-[1.06] tracking-[-0.04em] text-white md:text-[44px] lg:text-[52px]"
            />

            <p className="mt-7 text-[11px] uppercase tracking-[0.14em] text-white/65">
              Offre de lancement
            </p>
            <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-white md:text-[24px]">
              500 FCFA — dossier complet de 11 à 15 pages
            </p>
          </div>

          <Link
            href="/evaluation"
            aria-label="Démarrer mon évaluation"
            className="sheen lift absolute bottom-7 right-7 z-10 grid h-14 w-14 place-items-center rounded-full bg-electric text-white shadow-float md:bottom-10 md:right-10 md:h-16 md:w-16"
          >
            <ArrowUpRight className="h-6 w-6" strokeWidth={2} />
          </Link>

          {/* Lisière tissée en bas de la scène, à la place des trois puces
              décoratives qui ne pilotaient rien. */}
          <BandeKente className="absolute inset-x-0 bottom-0 z-10" />
        </Photo>
      </Reveal>
    </section>
  );
}
