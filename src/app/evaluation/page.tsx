import { NB_PROGRAMMES } from "@/data/stats";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FunnelEvent } from "@/components/analytics/page-view";
import { StepperForm } from "@/components/evaluation/stepper-form";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";

export const metadata: Metadata = {
  title: "Évaluation d'admissibilité",
  description:
    `Trois écrans pour confronter votre moyenne, votre filière et votre budget aux ${NB_PROGRAMMES} programmes du catalogue.`,
};

export default function EvaluationPage() {
  return (
    <main>
      {/* Première marche du tunnel : sans elle, le back-office ne voit que
          des pages vues et ne peut pas dire où les candidats abandonnent. */}
      <FunnelEvent kind="evaluation_started" />
      <PageHeader />

      <section className="shell pt-12 md:pt-16">
        <span className="eyebrow">Évaluation gratuite</span>
        <h1 className="section-title mt-5 max-w-[18ch]">
          Mesurons vos chances réelles en trois écrans
        </h1>
        <p className="mt-3 max-w-[62ch] text-[12.5px] leading-[1.6] text-ink-muted">
          Vos réponses alimentent directement le moteur de matching. Plus votre
          moyenne est exacte, plus le diagnostic est fiable.
        </p>

        <div className="mt-10">
          <Suspense
            fallback={
              <div className="h-[520px] animate-pulse rounded-panel bg-white/60" />
            }
          >
            <StepperForm />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
