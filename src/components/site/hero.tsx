import { Sparkles } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { Navbar } from "@/components/site/navbar";
import { QuickCheckCard } from "@/components/site/quick-check-card";
import { IMG } from "@/lib/content";

export function Hero() {
  return (
    <header className="px-3 pt-3 md:px-5 md:pt-5">
      {/* Le visuel remplit le bloc en fond : la scène grandit donc avec son
          contenu en mobile, et se fige à 820 px à partir de `lg`. */}
      <div className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-stage lg:h-[820px]">
        <Photo
          src={IMG.hero}
          alt="Étudiant contemplant un paysage depuis un belvédère"
          priority
          scrim="full"
          sizes="100vw"
          className="absolute inset-0 h-full w-full"
        />

        <Navbar />

        {/* Bloc éditorial + carte d'évaluation, alignés sur la ligne de base */}
        <div className="relative flex min-h-[560px] items-end px-5 pb-8 pt-24 md:min-h-[700px] md:px-10 md:pb-10 lg:h-full lg:px-14 lg:pb-14">
          <div className="grid w-full grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/30 bg-white/14 px-3 text-[11px] font-medium text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                Sessions 2026 ouvertes
              </span>

              <h1 className="mt-4 text-[34px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-[44px] md:text-[52px] lg:text-[56px]">
                Trouvez Votre Bourse,
                <br />
                Bâtissez Votre Avenir
              </h1>

              <p className="mt-4 max-w-[54ch] text-[13px] leading-[1.6] text-white/80 md:text-[14px]">
                Évaluez gratuitement votre admissibilité sur 380 bourses et
                universités réelles, puis débloquez votre feuille de route
                stratégique — calendrier, checklist et référents certifiés.
              </p>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <QuickCheckCard />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
