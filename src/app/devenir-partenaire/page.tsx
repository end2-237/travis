import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  Coins,
  FileCheck2,
  Target,
  Users,
} from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ApplicationForm } from "@/components/partners/application-form";
import { StickySteps } from "@/components/partners/sticky-steps";
import { FloatingActions } from "@/components/site/floating-actions";
import { Footer } from "@/components/site/footer";
import { Grain } from "@/components/site/grain";
import { PageHeader } from "@/components/site/page-header";
import { SERVICE_LABELS } from "@/data/services";
import { getPartnerReach } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Devenir partenaire",
  description:
    "Traducteurs assermentés, agences d'immigration, centres de langue : rejoignez les prestataires référencés par Travis auprès des candidats à la mobilité étudiante.",
};

export const dynamic = "force-dynamic";

const VALUE = [
  {
    icon: Target,
    title: "Des candidats déjà décidés",
    body: "Ils arrivent ici après avoir choisi leur destination et connu leur date de clôture. Ils cherchent un prestataire, pas de l'information.",
  },
  {
    icon: Clock3,
    title: "Au moment où le besoin existe",
    body: "Votre service apparaît en regard de la pièce qu'il produit, dans la checklist du candidat. Pas sur une page « nos partenaires » que personne n'ouvre.",
  },
  {
    icon: FileCheck2,
    title: "Dans le rapport qu'ils emportent",
    body: "Le PDF payant détaille chaque démarche. Vos coordonnées et vos tarifs y figurent, consultables hors ligne pendant des mois.",
  },
];

const EXPECTATIONS = [
  {
    title: "Une habilitation vérifiable",
    body: "Inscription à la Cour d'appel pour un traducteur, agrément ministériel, licence d'exploitation. Nous la vérifions avant tout référencement.",
  },
  {
    title: "Des tarifs annoncés et tenus",
    body: "Le prix affiché sur Travis est celui que le candidat paie. Un écart constaté suspend le référencement.",
  },
  {
    title: "Un délai réaliste",
    body: "Mieux vaut annoncer dix jours et tenir, qu'annoncer trois et faire rater une session à un étudiant.",
  },
  {
    title: "Un reçu pour chaque paiement",
    body: "Sans exception. C'est la première protection du candidat, et la vôtre.",
  },
];

const STEPS = [
  {
    title: "Vous déposez votre candidature",
    body: "Le formulaire ci-dessous. Cinq minutes, avec votre agrément et vos conditions.",
  },
  {
    title: "Nous vérifions votre habilitation",
    body: "Auprès de l'organisme qui l'a délivrée. Sous cinq jours ouvrés. C'est ce qui donne sa valeur à la mention « partenaire » sur votre fiche.",
  },
  {
    title: "Nous convenons des conditions",
    body: "Tarifs affichés, délais annoncés, zone couverte, commission. Tout est écrit avant la mise en ligne.",
  },
  {
    title: "Votre fiche est publiée",
    body: "Elle apparaît dans l'annuaire, dans les checklists concernées et dans les rapports PDF. Vous pouvez la faire suspendre à tout moment.",
  },
];

export default async function BecomePartnerPage() {
  const reach = await getPartnerReach();

  return (
    <main>
      <PageHeader />

      {/* Ouverture */}
      <header className="px-3 pt-3 md:px-5 md:pt-5">
        <Grain className="mesh overflow-hidden rounded-stage">
          <div className="relative z-10 grid gap-12 px-6 py-16 md:px-12 md:py-24 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:px-16 lg:py-28">
            <Reveal duration={850}>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3 text-[11px] font-medium text-white backdrop-blur-md">
                <BadgeCheck className="h-3 w-3" strokeWidth={2} />
                Référencement sur habilitation
              </span>

              <h1 className="mt-5 max-w-[15ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-[46px] lg:text-[56px]">
                Vos clients savent déjà ce qu&apos;ils cherchent
              </h1>

              <p className="mt-5 max-w-[56ch] text-[13.5px] leading-[1.65] text-white/70 md:text-[15px]">
                Traducteur assermenté, agence d&apos;immigration, centre de
                langue : Travis place votre service au moment exact où le
                candidat en a besoin — en regard de la pièce que vous produisez,
                dans sa checklist.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {Object.values(SERVICE_LABELS)
                  .slice(0, 6)
                  .map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-md"
                    >
                      {label}
                    </span>
                  ))}
              </div>
            </Reveal>

            <Reveal delay={140} duration={850}>
              <div className="hairline-top rounded-panel border border-white/15 bg-white/8 p-6 backdrop-blur-md">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-white/50">
                  L&apos;audience
                </p>

                <dl className="mt-5 space-y-5">
                  <div>
                    <dt className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-white">
                      {reach.demo ? (
                        "—"
                      ) : (
                        <CountUp value={reach.evaluations} />
                      )}
                    </dt>
                    <dd className="mt-2 text-[11.5px] text-white/55">
                      évaluations sur 30 jours
                    </dd>
                  </div>
                  <div className="border-t border-white/12 pt-5">
                    <dt className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-white">
                      <CountUp value={reach.countries} />
                    </dt>
                    <dd className="mt-2 text-[11.5px] text-white/55">
                      destinations couvertes
                    </dd>
                  </div>
                  <div className="border-t border-white/12 pt-5">
                    <dt className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-white">
                      <CountUp value={reach.services} />
                    </dt>
                    <dd className="mt-2 text-[11.5px] text-white/55">
                      démarches documentées
                    </dd>
                  </div>
                </dl>

                {reach.demo ? (
                  <p className="mt-5 border-t border-white/12 pt-4 text-[10px] leading-[1.5] text-white/40">
                    Le volume d&apos;évaluations sera affiché dès la mise en
                    service de la base. Nous ne publions pas de chiffre que nous
                    ne mesurons pas.
                  </p>
                ) : null}
              </div>
            </Reveal>
          </div>
        </Grain>
      </header>

      {/* Ce que nous apportons */}
      <section className="shell pt-16 md:pt-24">
        <Reveal>
          <span className="eyebrow">Ce que nous apportons</span>
          <h2 className="section-title mt-5 max-w-[18ch]">
            Un placement, pas une bannière
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {VALUE.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <article className="lift h-full rounded-panel border border-line bg-white p-7">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-sunk text-ink">
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.65] text-ink-muted">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ce que nous attendons */}
      <section className="shell pt-16 md:pt-24">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Ce que nous attendons</span>
              <h2 className="section-title mt-5 max-w-[18ch]">
                Quatre engagements, non négociables
              </h2>
            </div>
            <p className="max-w-[46ch] text-[12px] leading-[1.6] text-ink-muted md:text-right">
              Un étudiant qui se déplace sur la foi de cette page doit trouver
              un prestataire réel, au prix annoncé. C&apos;est ce qui rend le
              référencement utile — pour lui comme pour vous.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {EXPECTATIONS.map((item, index) => (
            <Reveal key={item.title} delay={Math.min(index, 3) * 70}>
              <article className="h-full rounded-panel bg-white p-7 shadow-card">
                <h3 className="text-[15px] font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.65] text-ink-muted">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Modèle */}
      <section className="shell pt-16 md:pt-24">
        <Reveal>
          <Grain soft className="overflow-hidden rounded-stage bg-ink text-white">
            <div className="relative z-10 grid gap-10 p-8 md:grid-cols-2 md:p-12 lg:p-16">
              <div>
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-medium text-white">
                  <Coins className="h-3 w-3" strokeWidth={2} />
                  Le modèle
                </span>
                <h2 className="mt-5 max-w-[16ch] text-[26px] font-semibold leading-[1.12] tracking-[-0.035em] md:text-[34px]">
                  Rien à l&apos;entrée, une commission sur ce qui passe
                </h2>
                <p className="mt-4 max-w-[52ch] text-[12.5px] leading-[1.7] text-white/65">
                  Le référencement est gratuit. Travis se rémunère par une
                  commission sur les prestations effectivement réalisées via la
                  plateforme, négociée par service et inscrite au contrat. Aucun
                  abonnement, aucun frais de mise en avant : une place ne
                  s&apos;achète pas, elle se mérite par l&apos;habilitation et
                  les délais tenus.
                </p>
              </div>

              <dl className="grid gap-px self-start overflow-hidden rounded-panel bg-white/10">
                {[
                  ["Frais de référencement", "0 FCFA"],
                  ["Abonnement mensuel", "Aucun"],
                  ["Mise en avant payante", "N'existe pas"],
                  ["Commission", "Négociée par service"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 bg-ink px-5 py-4"
                  >
                    <dt className="text-[12px] text-white/55">{label}</dt>
                    <dd className="text-[13px] font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Grain>
        </Reveal>
      </section>

      {/* Déroulé */}
      <section className="shell pt-16 md:pt-24">
        <Reveal>
          <span className="eyebrow">Comment ça se passe</span>
          <h2 className="section-title mt-5 max-w-[16ch]">
            De la candidature à la fiche
          </h2>
        </Reveal>

        <StickySteps steps={STEPS} />
      </section>

      {/* Candidature */}
      <section id="candidature" className="shell scroll-mt-20 pt-16 md:pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-12">
          <Reveal>
            <span className="eyebrow">Candidature</span>
            <h2 className="section-title mt-5 max-w-[16ch]">
              Dites-nous ce que vous faites
            </h2>
            <p className="mt-3 max-w-[54ch] text-[12.5px] leading-[1.7] text-ink-muted">
              Cinq minutes. Nous revenons vers vous sous cinq jours ouvrés,
              après vérification de votre habilitation auprès de l&apos;organisme
              qui l&apos;a délivrée.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Votre candidature est examinée, jamais publiée automatiquement.",
                "Nous vérifions l'agrément avant tout référencement.",
                "Vous pouvez demander la suspension de votre fiche à tout moment.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[12px] leading-[1.6] text-ink-soft"
                >
                  <Users
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint"
                    strokeWidth={1.8}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/partenaires"
              className="mt-8 inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
            >
              Voir l&apos;annuaire existant
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <ApplicationForm />
          </Reveal>
        </div>
      </section>

      <Footer />

      <FloatingActions
        actions={[
          {
            target: "candidature",
            label: "Déposer ma candidature",
            shortLabel: "Candidater",
            icon: "candidature",
            primary: true,
          },
        ]}
      />
    </main>
  );
}
