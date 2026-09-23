import { About } from "@/components/site/about";
import { Achievements } from "@/components/site/achievements";
import { CtaBanner } from "@/components/site/cta-banner";
import { Deals } from "@/components/site/deals";
import { Destinations } from "@/components/site/destinations";
import { Footer } from "@/components/site/footer";
import { Grain } from "@/components/site/grain";
import { Hero } from "@/components/site/hero";
import { Manifesto } from "@/components/site/manifesto";
import { Marquee } from "@/components/site/marquee";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { Testimonials } from "@/components/site/testimonials";
import { CATALOG } from "@/data/catalog";

/**
 * Les pays défilants sortent du catalogue, pas d'une liste écrite à la main :
 * le bandeau reste juste le jour où un programme est ajouté ou retiré.
 */
const DESTINATIONS = [...new Set(CATALOG.map((entry) => entry.country))].sort(
  (a, b) => a.localeCompare(b, "fr"),
);

export default function HomePage() {
  return (
    <main>
      <ScrollProgress />

      <Hero />
      <Manifesto />
      <Achievements />

      {/* Respiration sombre au milieu d'une page claire : le chiffre annoncé
          juste au-dessus défile ici sous forme de noms. */}
      <Grain
        soft
        className="mesh mt-14 overflow-hidden md:mt-20"
        as="section"
      >
        <Marquee
          items={DESTINATIONS}
          className="relative z-10 py-4 text-[12.5px] font-medium text-white/80"
          durationSeconds={58}
          separator="—"
        />
      </Grain>

      <Deals />
      <Destinations />
      <About />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  );
}
