import { Reveal } from "@/components/motion/reveal";
import { ScrollWords } from "@/components/motion/split-words";
import { Photo } from "@/components/site/photo";
import { IMG } from "@/lib/content";

/**
 * Section « Qui sommes-nous ? » — énoncé centré qui s'allume mot à mot,
 * suivi de trois vignettes dont celle du milieu est plus haute.
 */
export function Manifesto() {
  return (
    <section id="a-propos" className="shell pt-16 md:pt-24">
      <Reveal className="flex justify-center">
        <span className="eyebrow">Qui sommes-nous ?</span>
      </Reveal>

      {/* Le texte s'éclaire à la vitesse du défilement : on le lit au rythme
          où il apparaît, au lieu de sauter directement aux photos. */}
      <ScrollWords
        className="mx-auto mt-7 max-w-[880px] text-center text-[20px] font-medium leading-[1.42] tracking-[-0.025em] text-ink sm:text-[24px] md:text-[28px]"
        segments={[
          { text: "Nous sommes des conseillers d'orientation, d'anciens boursiers" },
          {
            text: "et des ingénieurs réunis pour rendre lisible",
            className: "text-ink-faint",
          },
          { text: "ce qui ne l'est jamais. De la première évaluation au dépôt du dossier," },
          {
            text: "nous chiffrons vos chances réelles",
            className: "text-ink-faint",
          },
          { text: "au lieu de vous vendre du rêve." },
        ]}
      />

      <Reveal delay={140} className="mt-10 flex items-end justify-center gap-2 md:gap-3">
        <Photo
          src={IMG.manifesto[0].src}
          alt={IMG.manifesto[0].alt}
          sizes="(max-width: 768px) 30vw, 160px"
          className="lift h-[86px] w-[110px] rounded-[14px] md:h-[104px] md:w-[144px]"
        />
        <Photo
          src={IMG.manifesto[1].src}
          alt={IMG.manifesto[1].alt}
          sizes="(max-width: 768px) 34vw, 180px"
          className="lift h-[104px] w-[126px] rounded-[14px] md:h-[126px] md:w-[166px]"
        />
        <Photo
          src={IMG.manifesto[2].src}
          alt={IMG.manifesto[2].alt}
          sizes="(max-width: 768px) 30vw, 160px"
          className="lift h-[86px] w-[110px] rounded-[14px] md:h-[104px] md:w-[144px]"
        />
      </Reveal>
    </section>
  );
}
