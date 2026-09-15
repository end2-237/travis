import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Handshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageViewTracker } from "@/components/analytics/page-view";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { WordRise } from "@/components/motion/split-words";
import { ServiceDirectory } from "@/components/partners/service-directory";
import { StickySteps } from "@/components/partners/sticky-steps";
import { FloatingActions } from "@/components/site/floating-actions";
import { Footer } from "@/components/site/footer";
import { Grain } from "@/components/site/grain";
import { Marquee } from "@/components/site/marquee";
import { PageHeader } from "@/components/site/page-header";
import { Photo } from "@/components/site/photo";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { SERVICE_LABELS } from "@/data/services";
import { getPublicServices } from "@/lib/partners";

/**
 * Visuels d'ouverture, choisis pour ce qu'ils montrent et non pour l'ambiance :
 * un guichet pour la promesse de la page, une poignée de main pour l'appel
 * aux professionnels. Les deux ont été ouverts et regardés avant d'être posés.
 */
const COVER = {
  src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1800&q=72",
  alt: "Personne accueillie à un comptoir de service",
};

const PARTNER_CALL = {
  src: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=72",
  alt: "Poignée de main entre deux professionnels",
};

export const metadata: Metadata = {
  title: "Partenaires et démarches",
  description:
    "Les organismes et partenaires qui délivrent chaque pièce de votre dossier d'immigration : procédure, délai, coût et coordonnées.",
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Vous évaluez votre profil",
    body: "Trois écrans, gratuits. Le moteur confronte votre moyenne, votre filière et votre budget aux 50 programmes du catalogue, et vous dit où vous passez.",
  },
  {
    title: "Vous choisissez une destination",
    body: "Chaque fiche détaille le financement, le budget réel, le calendrier et le lien officiel. C'est ce choix qui détermine les pièces à réunir.",
  },
  {
    title: "Nous listons vos démarches, dans l'ordre",
    body: "État civil, légalisation, traduction assermentée, apostille : l'ordre n'est pas négociable. Faire traduire avant de légaliser oblige à tout refaire.",
  },
  {
    title: "Vous vous adressez au bon guichet",
    body: "Pour chaque pièce, l'organisme qui la délivre, ce qu'il faut apporter, le délai et le coût. Et quand un partenaire peut s'en charger, son tarif est affiché.",
  },
];

export default async function PartnersPage() {
  const services = await getPublicServices();

  const official = services.filter((s) => s.nature === "institution");
  const activePartners = services.filter(
    (s) => s.nature === "partner" && s.status === "actif",
  );
  // Nombre d'étapes réellement documentées : c'est la profondeur du contenu,
  // pas le nombre de fiches, qui fait la valeur de cette page.
  const totalSteps = services.reduce((sum, s) => sum + s.steps.length, 0);

  // Afficher « 0 partenaire » en chiffre de héros dessert la page sans rien
  // apprendre : tant qu'aucun n'est référencé, on met en avant la profondeur
  // du contenu, qui est vraie.
  const stats =
    activePartners.length > 0
      ? [
          { value: official.length, label: "démarches officielles documentées" },
          { value: activePartners.length, label: "partenaires référencés" },
          { value: totalSteps, label: "étapes détaillées pas à pas" },
        ]
      : [
          { value: Object.keys(SERVICE_LABELS).length, label: "services couverts" },
          { value: official.length, label: "démarches officielles documentées" },
          { value: totalSteps, label: "étapes détaillées pas à pas" },
        ];

  return (
    <main>
      <PageViewTracker />
      <ScrollProgress />
      <PageHeader />

      {/* Ouverture — la photographie porte le fond, le voile de mailles la
          teinte et le grain la texture. La superposition garde le titre
          lisible là où la photo est claire. */}
      <header className="px-3 pt-3 md:px-5 md:pt-5">
        <Grain className="relative overflow-hidden rounded-stage bg-ink">
          <Image
            src={COVER.src}
            alt={COVER.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div aria-hidden className="mesh-veil absolute inset-0 opacity-75" />
          <div aria-hidden className="scrim-lead absolute inset-0" />

          <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 lg:px-16 lg:py-28">
            <Reveal duration={850}>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3 text-[11px] font-medium text-white backdrop-blur-md">
                <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                Procédures vérifiées
              </span>
            </Reveal>

            <WordRise
              as="h1"
              lines={["Le bon guichet,", "au bon moment"]}
              delay={140}
              className="mt-5 max-w-[16ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-[46px] lg:text-[58px]"
            />

            <Reveal duration={850} delay={480}>
              <p className="mt-5 max-w-[58ch] text-[13.5px] leading-[1.65] text-white/80 md:text-[15px]">
                Un dossier d&apos;immigration se perd rarement sur le fond. Il
                se perd sur une pièce demandée trop tard, une traduction faite
                avant la légalisation, un guichet qui n&apos;était pas le bon.
                Voici qui délivre quoi, dans quel ordre, et à quel prix.
              </p>
            </Reveal>

            <Reveal delay={120} duration={850}>
              <dl className="mt-12 grid max-w-[720px] grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[34px] font-semibold leading-none tracking-[-0.045em] text-white md:text-[42px]">
                      <CountUp value={stat.value} />
                    </dt>
                    <dd className="mt-2.5 max-w-[20ch] text-[11.5px] leading-[1.45] text-white/65">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Grain>
      </header>

      {/* Bandeau des services */}
      <Marquee
        items={Object.values(SERVICE_LABELS)}
        className="border-y border-line bg-white py-3.5 text-[12px] font-medium text-ink-muted"
        durationSeconds={44}
      />

      {/* Déroulé */}
      <section className="shell pt-16 md:pt-24">
        <Reveal>
          <span className="eyebrow">Comment ça se passe</span>
          <h2 className="section-title mt-5 max-w-[16ch]">
            De votre profil au guichet
          </h2>
        </Reveal>

        <StickySteps steps={STEPS} />
      </section>

      {/* Annuaire */}
      <section id="annuaire" className="shell scroll-mt-20 pt-16 md:pt-24">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Annuaire</span>
              <h2 className="section-title mt-5 max-w-[16ch]">
                Qui délivre quoi
              </h2>
            </div>
            <p className="max-w-[46ch] text-[12px] leading-[1.6] text-ink-muted md:text-right">
              Les démarches officielles sont réalisables par vous-même et ne
              coûtent que les frais d&apos;administration. Un partenaire ne
              remplace jamais cette voie : il la prend en charge.
            </p>
          </div>
        </Reveal>

        <div className="mt-10">
          <ServiceDirectory services={services} />
        </div>
      </section>

      {/* Devenir partenaire */}
      <section className="shell pt-16 md:pt-24">
        <Reveal>
          <Grain
            soft
            className="overflow-hidden rounded-stage border border-line bg-white"
          >
            <div className="relative z-10 grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
              <div className="p-8 md:p-12">
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-sunk px-3 text-[11px] font-medium text-ink-muted">
                  <Handshake className="h-3 w-3" strokeWidth={2} />
                  Vous êtes un professionnel
                </span>
                <h2 className="section-title mt-5 max-w-[20ch]">
                  Traducteur, agence, centre de langue&nbsp;?
                </h2>
                <p className="mt-3 max-w-[58ch] text-[12.5px] leading-[1.65] text-ink-muted">
                  Les candidats qui arrivent ici ont déjà choisi leur
                  destination et connaissent leur échéance. Ils cherchent un
                  prestataire, pas de l&apos;information.
                </p>

                <Link
                  href="/devenir-partenaire"
                  className="lift mt-7 inline-flex h-12 shrink-0 items-center gap-2 rounded-btn bg-ink px-6 text-[13px] font-medium text-white hover:bg-ink-soft"
                >
                  Devenir partenaire
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>

              <Photo
                src={PARTNER_CALL.src}
                alt={PARTNER_CALL.alt}
                sizes="(max-width: 768px) 100vw, 340px"
                className="h-[220px] w-full md:h-full"
              />
            </div>
          </Grain>
        </Reveal>
      </section>

      {/* Évaluation */}
      <section className="shell pt-4">
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-stage bg-white p-8 shadow-card md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-sunk px-3 text-[11px] font-medium text-ink-muted">
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                Avant les démarches
              </span>
              <h2 className="section-title mt-5 max-w-[22ch]">
                Commencez par savoir où vous passez
              </h2>
              <p className="mt-3 max-w-[56ch] text-[12.5px] leading-[1.65] text-ink-muted">
                Inutile de lancer une légalisation avant de savoir quels
                programmes vous acceptent. L&apos;évaluation est gratuite et
                prend trois minutes.
              </p>
            </div>
            <Link
              href="/evaluation"
              className="lift inline-flex h-12 shrink-0 items-center gap-2 rounded-btn border border-line bg-white px-6 text-[13px] font-medium text-ink hover:bg-surface-soft"
            >
              <Building2 className="h-4 w-4" strokeWidth={1.8} />
              Évaluer mon profil
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />

      <FloatingActions
        actions={[
          {
            target: "annuaire",
            label: "L'annuaire",
            shortLabel: "Annuaire",
            icon: "annuaire",
          },
        ]}
      />
    </main>
  );
}
