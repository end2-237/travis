import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/site/photo";
import { IMG } from "@/lib/content";

/**
 * Bandeau final — visuel pleine largeur, titre sur trois lignes
 * et bouton circulaire bleu en bas à droite.
 */
export function CtaBanner() {
  return (
    <section id="contact" className="shell pt-16 md:pt-24">
      <Reveal>
      <Photo
        src={IMG.banner}
        alt="Sentier de randonnée traversant une forêt"
        scrim="tile"
        sizes="100vw"
        className="min-h-[400px] rounded-stage md:min-h-[460px] lg:h-[510px]"
      >
        <div className="absolute inset-0 flex flex-col justify-center p-7 md:p-12 lg:p-14">
          <h2 className="max-w-[13ch] text-[32px] font-semibold leading-[1.06] tracking-[-0.04em] text-white md:text-[44px] lg:text-[52px]">
            Débloquez Votre Feuille de Route Stratégique
          </h2>

          <p className="mt-7 text-[11px] uppercase tracking-[0.14em] text-white/65">
            Offre de lancement
          </p>
          <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-white md:text-[24px]">
            500 FCFA — rapport de 8 pages
          </p>
        </div>

        <Link
          href="/evaluation"
          aria-label="Démarrer mon évaluation"
          className="absolute bottom-7 right-7 grid h-14 w-14 place-items-center rounded-full bg-electric text-white shadow-float transition-transform hover:scale-105 md:bottom-10 md:right-10 md:h-16 md:w-16"
        >
          <ArrowUpRight className="h-6 w-6" strokeWidth={2} />
        </Link>

        <div className="absolute bottom-9 left-7 flex gap-1.5 md:bottom-12 md:left-12">
          <span className="h-1.5 w-5 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
        </div>
      </Photo>
      </Reveal>
    </section>
  );
}
