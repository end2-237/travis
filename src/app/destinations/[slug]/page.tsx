import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  FileText,
  GraduationCap,
  Languages,
  Plane,
  Wallet,
} from "lucide-react";
import {
  CoverageList,
  FactRow,
  Section,
  StatTile,
  Steps,
} from "@/components/destination/detail-blocks";
import { DocumentChecklist } from "@/components/destination/document-checklist";
import { PageViewTracker } from "@/components/analytics/page-view";
import { FloatingActions } from "@/components/site/floating-actions";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";
import { Photo } from "@/components/site/photo";
import { CATALOG, catalogEntry, relatedEntries } from "@/data/catalog";
import { formatGpa, formatXaf } from "@/lib/utils";

export function generateStaticParams() {
  return CATALOG.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = catalogEntry(slug);
  if (!entry) return { title: "Programme introuvable" };

  return {
    title: `${entry.title} — ${entry.country}`,
    description: entry.summary,
    openGraph: {
      title: `${entry.title} — ${entry.country}`,
      description: entry.summary,
      images: [entry.image],
    },
  };
}

const NAV = [
  { href: "#couverture", label: "Financement" },
  { href: "#admissibilite", label: "Admissibilité" },
  { href: "#budget", label: "Budget" },
  { href: "#procedure", label: "Procédure" },
  { href: "#dossier", label: "Dossier" },
  { href: "#depart", label: "Départ" },
];

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = catalogEntry(slug);
  if (!entry) notFound();

  const profile = entry.country_profile;
  const related = relatedEntries(entry);
  const monthlyTotal = profile.livingCostXaf + profile.housingCostXaf;

  return (
    <main>
      <PageViewTracker subject={entry.slug} country={entry.country} />
      <PageHeader />

      {/* En-tête visuel */}
      <header className="px-3 pt-3 md:px-5 md:pt-5">
        <div className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-stage">
          <Parallax amount={48} className="absolute inset-0">
            <Photo
              src={entry.image}
              alt={`${entry.institution} — ${entry.country}`}
              priority
              scrim="full"
              sizes="100vw"
              className="absolute inset-0 h-full w-full"
            />
          </Parallax>

          <div className="relative flex min-h-[420px] items-end p-6 md:min-h-[500px] md:p-10 lg:p-14">
            <Reveal from="up" duration={800}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-medium text-ink">
                  {entry.country}
                </span>
                <span className="rounded-full border border-white/25 bg-white/14 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  {entry.fully_funded
                    ? "Financement intégral"
                    : "Frais réduits"}
                </span>
                <span className="rounded-full border border-white/25 bg-white/14 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  Clôture&nbsp;: {entry.deadline_month}
                </span>
              </div>

              <h1 className="mt-4 max-w-[20ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.04em] text-white md:text-[42px] lg:text-[46px]">
                {entry.title}
              </h1>
              <p className="mt-3 text-[13px] text-white/75">
                {entry.institution}
              </p>
            </Reveal>
          </div>
        </div>
      </header>

      {/* Sommaire ancré */}
      <nav className="sticky top-0 z-20 mt-6 border-b border-line bg-canvas/88 backdrop-blur-md">
        <div className="shell rail flex gap-1 py-2.5">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] text-ink-muted transition-colors hover:bg-surface-sunk hover:text-ink"
            >
              {item.label}
            </a>
          ))}
          <Link
            href={`/evaluation?program=${entry.slug}`}
            className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-ink-soft sm:inline-flex"
          >
            Évaluer mon profil ici
          </Link>
          <a
            href={entry.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-4 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-surface-soft sm:inline-flex"
          >
            Site officiel
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </a>
        </div>
      </nav>

      <div className="shell pt-12 md:pt-16">
        {/* Synthèse */}
        <Reveal>
          <p className="max-w-[70ch] text-[15px] leading-[1.65] text-ink md:text-[17px]">
            {entry.summary}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              accent
              value={
                entry.annual_cost_xaf === 0
                  ? "0 FCFA"
                  : formatXaf(entry.annual_cost_xaf)
              }
              label="Reste à charge annuel"
              hint={entry.tuition_note}
            />
            <StatTile
              value={formatGpa(entry.min_gpa_20)}
              label="Moyenne minimale exigée"
              hint={`Sur votre dernier cycle validé`}
            />
            <StatTile
              value={entry.monthly_allowance ? "Oui" : "Non"}
              label="Allocation mensuelle"
              hint={entry.monthly_allowance ?? "Ce programme ne verse pas d'allocation"}
            />
            <StatTile
              value={entry.max_age ? `${entry.max_age} ans` : "Sans limite"}
              label="Âge maximal"
              hint="Apprécié à la date de clôture"
            />
          </div>
        </Reveal>

        {/* Couverture */}
        <Reveal>
          <Section
            id="couverture"
            eyebrow="Financement"
            title="Ce que le programme couvre — et ce qu'il laisse à votre charge"
            lede="La différence entre une bourse « intégrale » et votre budget réel tient presque toujours à cette seconde colonne."
            className="mt-16"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-panel border border-line bg-white p-6">
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-positive">
                  Pris en charge
                </p>
                <CoverageList items={entry.covers} tone="included" />
              </div>
              <div className="rounded-panel bg-surface-sunk/60 p-6">
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  À votre charge
                </p>
                <CoverageList items={entry.not_covered} tone="excluded" />
              </div>
            </div>
          </Section>
        </Reveal>

        {/* Admissibilité */}
        <Reveal>
          <Section
            id="admissibilite"
            eyebrow="Admissibilité"
            title="Conditions d'accès"
            className="mt-16"
          >
            <dl className="rounded-panel border border-line bg-white px-6 py-2">
              <FactRow
                label="Niveaux proposés"
                value={entry.degree_levels.join(" · ")}
              />
              <FactRow
                label="Filières éligibles"
                value={entry.eligible_fields.join(" · ")}
              />
              <FactRow
                label="Moyenne minimale"
                value={formatGpa(entry.min_gpa_20)}
                hint="Une moyenne au-dessus du seuil ne suffit pas : c'est la marge qui vous classe."
              />
              <FactRow
                label="Langue exigée"
                value={entry.language_requirements}
              />
              <FactRow
                label="Limite d'âge"
                value={
                  entry.max_age
                    ? `${entry.max_age} ans à la date de clôture`
                    : "Aucune limite d'âge annoncée"
                }
              />
              <FactRow label="Comment se fait la sélection" value={entry.selection} />
            </dl>
          </Section>
        </Reveal>

        {/* Budget */}
        <Reveal>
          <Section
            id="budget"
            eyebrow="Budget"
            title="Ce que coûte réellement une année"
            lede="Ordres de grandeur observés sur place, convertis en FCFA. À vérifier auprès de l'établissement avant tout engagement financier."
            className="mt-16"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                value={
                  entry.annual_cost_xaf === 0
                    ? "0 FCFA"
                    : formatXaf(entry.annual_cost_xaf)
                }
                label="Scolarité après bourse"
              />
              <StatTile
                value={formatXaf(profile.housingCostXaf)}
                label="Logement par mois"
              />
              <StatTile
                value={formatXaf(profile.livingCostXaf)}
                label="Vie courante par mois"
              />
              <StatTile
                accent
                value={
                  entry.fully_funded
                    ? "Couvert"
                    : formatXaf(entry.estimated_annual_total_xaf)
                }
                label="Total annuel estimé"
                hint={
                  entry.fully_funded
                    ? "Logement et vie courante pris en charge par la bourse"
                    : `Scolarité + ${formatXaf(monthlyTotal)} par mois sur 12 mois`
                }
              />
            </div>

            <div className="mt-4 rounded-panel border border-line bg-white p-6">
              <div className="flex gap-3">
                <BedDouble
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted"
                  strokeWidth={1.7}
                />
                <div>
                  <p className="text-[13px] font-semibold">Logement</p>
                  <p className="mt-1.5 max-w-[70ch] text-[12.5px] leading-[1.65] text-ink-muted">
                    {profile.housing}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-3 border-t border-line pt-5">
                <BriefcaseBusiness
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted"
                  strokeWidth={1.7}
                />
                <div>
                  <p className="text-[13px] font-semibold">Travail étudiant</p>
                  <p className="mt-1.5 max-w-[70ch] text-[12.5px] leading-[1.65] text-ink-muted">
                    {profile.work} Monnaie locale&nbsp;: {profile.currency}.
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </Reveal>

        {/* Procédure */}
        <Reveal>
          <Section
            id="procedure"
            eyebrow="Procédure"
            title="La démarche, étape par étape"
            lede="Chaque étape conditionne la suivante. Sauter la première fait perdre une session entière."
            className="mt-16"
          >
            <div className="rounded-panel border border-line bg-white p-6 md:p-8">
              <Steps steps={entry.application_steps} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-card border border-line bg-white p-5">
                <CalendarDays className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
                <p className="mt-3 text-[12px] font-semibold">Clôture</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {entry.deadline_month}
                </p>
              </div>
              <div className="rounded-card border border-line bg-white p-5">
                <GraduationCap className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
                <p className="mt-3 text-[12px] font-semibold">Rentrées</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {profile.intake.join(" · ")}
                </p>
              </div>
              <div className="rounded-card border border-line bg-white p-5">
                <Languages className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
                <p className="mt-3 text-[12px] font-semibold">Langue</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {entry.language_requirements}
                </p>
              </div>
            </div>
          </Section>
        </Reveal>

        {/* Dossier */}
        <Reveal>
          <Section
            id="dossier"
            eyebrow="Dossier"
            title="Les pièces à réunir"
            lede="Dépliez chaque pièce : qui la délivre, dans quel ordre, avec quoi, en combien de temps et à quel coût. Commencez par la légalisation — elle conditionne tout le reste."
            className="mt-16"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <DocumentChecklist documents={entry.required_documents} />

              <aside className="h-fit rounded-panel bg-surface-sunk/60 p-6 lg:sticky lg:top-24">
                <FileText className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
                <p className="mt-3 text-[13px] font-semibold">Traductions</p>
                <p className="mt-2 text-[12px] leading-[1.65] text-ink-muted">
                  {entry.translation}
                </p>
                <p className="mt-4 border-t border-line-strong pt-4 text-[11.5px] leading-[1.6] text-ink-faint">
                  Comptez 5 à 10 jours ouvrés par traduction assermentée, et
                  autant pour la légalisation en préfecture.
                </p>
              </aside>
            </div>
          </Section>
        </Reveal>

        {/* Départ */}
        <Reveal>
          <Section
            id="depart"
            eyebrow="Départ"
            title="Visa et installation"
            className="mt-16"
          >
            <dl className="rounded-panel border border-line bg-white px-6 py-2">
              <FactRow label="Procédure consulaire" value={profile.visa} />
              <FactRow
                label="Délai d'obtention"
                value={profile.visaLeadTime}
                hint="À compter de la réception de l'admission définitive."
              />
              <FactRow label="Rentrées universitaires" value={profile.intake.join(" · ")} />
              <FactRow label="Travail étudiant" value={profile.work} />
            </dl>

            <a
              href={entry.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex items-center justify-between gap-4 rounded-panel bg-ink p-6 text-white transition-colors hover:bg-ink-soft"
            >
              <span>
                <span className="flex items-center gap-2 text-[14px] font-semibold">
                  <Plane className="h-4 w-4" strokeWidth={1.8} />
                  Appel à candidatures officiel
                </span>
                <span className="mt-1.5 block text-[11.5px] text-white/65">
                  {entry.official_website.replace(/^https?:\/\//, "")} — vérifiez
                  toujours les dates et critères sur la source officielle avant
                  de déposer.
                </span>
              </span>
              <ArrowUpRight
                className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </a>
          </Section>
        </Reveal>

        {/* Programmes liés */}
        {related.length > 0 ? (
          <Reveal>
            <Section
              title="À comparer avec"
              lede="Les alternatives les plus proches, même destination ou même filière."
              className="mt-16"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/destinations/${item.slug}`}
                    className="group flex flex-col rounded-panel bg-white p-2.5 shadow-card transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Photo
                      src={item.image}
                      alt={item.title}
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="h-[150px] rounded-[15px]"
                      imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
                    >
                      <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-medium text-ink">
                        {item.country}
                      </span>
                    </Photo>
                    <div className="px-1.5 pb-1 pt-3.5">
                      <p className="text-[13px] font-semibold leading-[1.35] tracking-[-0.02em]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[11px] text-ink-muted">
                        {item.fully_funded
                          ? "Financement intégral"
                          : `${formatXaf(item.annual_cost_xaf)} / an`}{" "}
                        · dès {formatGpa(item.min_gpa_20)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          </Reveal>
        ) : null}

        {/* CTA évaluation */}
        <Reveal>
          <div className="mt-16 rounded-stage bg-white p-8 shadow-card md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="max-w-[24ch] text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] md:text-[28px]">
                  Ce programme est-il à votre portée&nbsp;?
                </h2>
                <p className="mt-2.5 max-w-[56ch] text-[12.5px] leading-[1.65] text-ink-muted">
                  Verdict critère par critère sur ce programme précis — moyenne,
                  niveau, filière, budget, langue — et ce qu&apos;il faut
                  corriger si un critère bloque. Les autres options compatibles
                  suivent.
                </p>
              </div>
              <Link
                href={`/evaluation?program=${entry.slug}`}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-btn bg-ink px-6 text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
              >
                <Wallet className="h-4 w-4" strokeWidth={1.8} />
                Évaluer mon admissibilité pour ce programme
              </Link>
            </div>
          </div>
        </Reveal>

        <Link
          href="/#destinations"
          className="mt-10 inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Toutes les destinations
        </Link>
      </div>

      <Footer />

      {/*
        La barre d'ancres collante couvre déjà la navigation entre sections :
        seul le retour en haut manque sur une page de cette longueur.
      */}
      <FloatingActions actions={[]} />
    </main>
  );
}
