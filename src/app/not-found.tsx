import { NB_PROGRAMMES } from "@/data/stats";
import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";

/**
 * Page introuvable.
 *
 * Le 404 par défaut de Next est une page blanche sans marque et sans issue :
 * un candidat qui suit un lien périmé — partagé sur WhatsApp des mois plus
 * tôt, ce qui est le mode de diffusion principal ici — se retrouve nulle
 * part et s'en va. Celle-ci le remet dans le parcours.
 */
export default function NotFound() {
  return (
    <main>
      <PageHeader />

      <section className="shell pt-16 md:pt-24">
        <div className="mx-auto max-w-[620px] text-center">
          <span className="eyebrow">Erreur 404</span>

          <h1 className="section-title mt-5">Cette page n&apos;existe pas</h1>

          <p className="mx-auto mt-3 max-w-[52ch] text-[12.5px] leading-[1.65] text-ink-muted">
            Le lien est peut-être périmé, ou le programme a été retiré du
            catalogue. Voici par où reprendre.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/evaluation"
              className="lift flex flex-col items-start gap-2 rounded-card border border-line bg-white p-5 text-left hover:shadow-card"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-sunk text-ink">
                <Compass className="h-[17px] w-[17px]" strokeWidth={1.7} />
              </span>
              <span className="text-[13.5px] font-semibold tracking-[-0.02em]">
                Évaluer mon profil
              </span>
              <span className="text-[11.5px] leading-[1.55] text-ink-muted">
                Trois écrans, gratuit, et le résultat est immédiat.
              </span>
            </Link>

            <Link
              href="/destinations"
              className="lift flex flex-col items-start gap-2 rounded-card border border-line bg-white p-5 text-left hover:shadow-card"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-sunk text-ink">
                <Search className="h-[17px] w-[17px]" strokeWidth={1.7} />
              </span>
              <span className="text-[13.5px] font-semibold tracking-[-0.02em]">
                Parcourir le catalogue
              </span>
              <span className="text-[11.5px] leading-[1.55] text-ink-muted">
                Les {NB_PROGRAMMES} programmes, filtrables par filière et par
                destination.
              </span>
            </Link>
          </div>

          <Link
            href="/"
            className="mt-7 inline-block text-[12px] text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
