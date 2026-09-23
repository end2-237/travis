import { NB_PROGRAMMES } from "@/data/stats";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/destination/catalog-browser";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/motion/reveal";
import { CATALOG, COUNTRIES_IN_CATALOG } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Catalogue des bourses et universités",
  description:
    `Les ${NB_PROGRAMMES} programmes internationaux référencés par Travis : financement, seuils de moyenne, échéances et procédure complète pour chacun.`,
};

export default function CatalogPage() {
  const fullyFunded = CATALOG.filter((e) => e.fully_funded).length;

  return (
    <main>
      <PageHeader />

      <section className="shell pt-12 md:pt-16">
        <Reveal>
          <span className="eyebrow">Catalogue</span>
          <h1 className="section-title mt-5 max-w-[18ch]">
            {CATALOG.length} programmes, détaillés de bout en bout
          </h1>
          <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.65] text-ink-muted">
            {fullyFunded} bourses intégrales et{" "}
            {CATALOG.length - fullyFunded} universités à frais réduits, réparties
            sur {COUNTRIES_IN_CATALOG.length} destinations. Chaque fiche donne
            la procédure exacte, le budget réel et le lien officiel.
          </p>
        </Reveal>

        <div className="mt-10">
          <CatalogBrowser />
        </div>
      </section>

      <Footer />
    </main>
  );
}
