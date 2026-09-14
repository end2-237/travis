import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/site/photo";
import { IMG } from "@/lib/content";

/**
 * Section « Who we are? » — énoncé centré en deux teintes,
 * suivi de trois vignettes dont celle du milieu est plus haute.
 */
export function Manifesto() {
  return (
    <section id="a-propos" className="shell pt-16 md:pt-24">
      <Reveal className="flex justify-center">
        <span className="eyebrow">Qui sommes-nous ?</span>
      </Reveal>

      <Reveal delay={70}>
      <p className="mx-auto mt-7 max-w-[880px] text-center text-[20px] font-medium leading-[1.42] tracking-[-0.025em] text-ink sm:text-[24px] md:text-[28px]">
        Nous sommes des conseillers d&apos;orientation, d&apos;anciens boursiers{" "}
        <span className="text-ink-faint">
          et des ingénieurs réunis pour rendre lisible
        </span>{" "}
        ce qui ne l&apos;est jamais. De la première évaluation au dépôt du
        dossier,{" "}
        <span className="text-ink-faint">
          nous chiffrons vos chances réelles
        </span>{" "}
        au lieu de vous vendre du rêve.
      </p>
      </Reveal>

      <Reveal delay={140} className="mt-10 flex items-end justify-center gap-2 md:gap-3">
        <Photo
          src={IMG.manifesto[0]}
          alt="Étudiants en salle de cours"
          sizes="(max-width: 768px) 30vw, 160px"
          className="h-[86px] w-[110px] rounded-[14px] md:h-[104px] md:w-[144px]"
        />
        <Photo
          src={IMG.manifesto[1]}
          alt="Campus universitaire international"
          sizes="(max-width: 768px) 34vw, 180px"
          className="h-[104px] w-[126px] rounded-[14px] md:h-[126px] md:w-[166px]"
        />
        <Photo
          src={IMG.manifesto[2]}
          alt="Diplômés le jour de la remise des diplômes"
          sizes="(max-width: 768px) 30vw, 160px"
          className="h-[86px] w-[110px] rounded-[14px] md:h-[104px] md:w-[144px]"
        />
      </Reveal>
    </section>
  );
}
