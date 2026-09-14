import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe2, Sparkles, Wallet } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { MatchList } from "@/components/results/match-list";
import { ProgramVerdictCard } from "@/components/results/program-verdict";
import { DossierSection } from "@/components/results/dossier-section";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";
import { UnlockPanel } from "@/components/checkout/unlock-panel";
import { loadEvaluation } from "@/server/profiles";
import { formatGpa } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Votre score d'admissibilité",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const evaluation = await loadEvaluation(profileId);

  if (!evaluation) notFound();

  const { profile, snapshot } = evaluation;
  const { teaser, score, matches, focus } = snapshot;
  const firstName = profile.full_name?.split(" ")[0] ?? "Votre profil";

  return (
    <main>
      <PageHeader />

      <section className="shell pt-12 md:pt-16">
        {/* Diagnostic */}
        <Reveal>
          <span className="eyebrow">Résultat de l&apos;évaluation</span>
          <h1 className="section-title mt-5 max-w-[22ch]">
            {firstName}, votre score d&apos;admissibilité est de {score}&nbsp;%
          </h1>
          <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.65] text-ink-muted">
            {teaser.headline} Tout est détaillé ci-dessous — noms, montants,
            échéances et liens officiels. Rien n&apos;est réservé au rapport
            payant.
          </p>
        </Reveal>

        {/* Verdict ciblé, avant tout le reste quand il existe */}
        {focus ? (
          <Reveal delay={60}>
            <div className="mt-8">
              <ProgramVerdictCard verdict={focus} />
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={80}>
          <div className="mt-8 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div className="rounded-panel bg-ink p-6 text-white">
              <p className="text-[11px] text-white/60">
                Score d&apos;admissibilité globale
              </p>
              <p className="mt-2 text-[44px] font-semibold leading-none tracking-[-0.045em]">
                <CountUp value={score} />
                <span className="text-[22px] text-white/60">&nbsp;%</span>
              </p>
              <div
                className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Score d'admissibilité"
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.max(score, 3)}%` }}
                />
              </div>
              <p className="mt-4 text-[11px] text-white/55">
                {formatGpa(Number(profile.gpa_score))} ·{" "}
                {profile.field_of_study} · {profile.current_degree}
              </p>
            </div>

            <SummaryTile
              icon={<Sparkles className="h-4 w-4" strokeWidth={1.7} />}
              value={teaser.fully_funded}
              label="bourses à 100 %"
            />
            <SummaryTile
              icon={<Wallet className="h-4 w-4" strokeWidth={1.7} />}
              value={teaser.affordable}
              label="options dans votre budget"
            />
            <SummaryTile
              icon={<Globe2 className="h-4 w-4" strokeWidth={1.7} />}
              value={teaser.regions.length}
              label="régions accessibles"
            />
          </div>
        </Reveal>

        {/* Les offres, en clair */}
        <Reveal>
          <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">
                {focus ? "Autres options" : "Vos options"}
              </span>
              <h2 className="section-title mt-4 max-w-[20ch]">
                {teaser.total} programme{teaser.total > 1 ? "s" : ""}{" "}
                correspond{teaser.total > 1 ? "ent" : ""} à votre profil
              </h2>
            </div>
            <p className="max-w-[46ch] text-[12px] leading-[1.6] text-ink-muted">
              Classés par compatibilité. Chaque fiche détaille la procédure, le
              budget réel, les pièces à fournir et le lien officiel.
            </p>
          </div>
        </Reveal>

        {matches.length === 0 ? (
          <Reveal>
            <div className="mt-8 rounded-panel bg-white p-8 text-center shadow-card">
              <p className="text-[14px] font-semibold">
                Aucune correspondance directe avec vos critères actuels
              </p>
              <p className="mx-auto mt-2.5 max-w-[60ch] text-[12.5px] leading-[1.65] text-ink-muted">
                Élargissez vos pays cibles ou votre enveloppe budgétaire, ou
                visez une passerelle : une année de mise à niveau relève souvent
                un profil au-dessus des seuils.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8">
            <MatchList matches={matches} />
          </div>
        )}

        {/* Constituer le dossier — après le choix, avant le rapport */}
        {matches.length > 0 ? (
          <Reveal>
            <div className="mt-16">
              <span className="eyebrow">Constituer votre dossier</span>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <h2 className="section-title max-w-[20ch]">
                  Les démarches, dans l&apos;ordre où il faut les faire
                </h2>
                <p className="max-w-[46ch] text-[12px] leading-[1.6] text-ink-muted md:text-right">
                  Qui délivre chaque pièce, avec quoi s&apos;y présenter, en
                  combien de temps et à quel coût. Faire traduire avant de
                  légaliser oblige à tout refaire.
                </p>
              </div>
              <DossierSection matches={matches} />
            </div>
          </Reveal>
        ) : null}

        {/* Le rapport, en complément — après les offres, jamais avant */}
        <Reveal>
          <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div>
              <span className="eyebrow">Pour aller plus loin</span>
              <h2 className="section-title mt-4 max-w-[18ch]">
                Emportez votre feuille de route
              </h2>
              <p className="mt-3 max-w-[58ch] text-[12.5px] leading-[1.65] text-ink-muted">
                Vous avez maintenant toutes les informations à l&apos;écran. Le
                rapport ne les cache pas : il les met en ordre. Un document de
                11 à 13 pages, imprimable et transmissible, avec votre
                calendrier personnel et la démarche complète pour chaque pièce
                du dossier de{" "}
                <strong className="font-medium text-ink">vos</strong> programmes.
              </p>
              <ul className="mt-5 space-y-2 text-[12px] leading-[1.6] text-ink-muted">
                <li>
                  — Un calendrier mois par mois calé sur vos échéances, pas sur
                  un modèle générique.
                </li>
                <li>
                  — Chaque pièce du dossier avec sa procédure, l&apos;organisme
                  qui la délivre, le délai et le coût.
                </li>
                <li>
                  — Une version hors ligne, à montrer à votre famille ou à votre
                  conseiller sans reconnexion.
                </li>
              </ul>
            </div>

            <div className="lg:sticky lg:top-6 lg:self-start">
              <UnlockPanel
                profileId={profile.id}
                phoneNumber={profile.phone_number}
                total={teaser.total}
              />
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}

function SummaryTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-panel border border-line bg-white p-5">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-sunk text-ink">
        {icon}
      </span>
      <p className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.04em]">
        <CountUp value={value} />
      </p>
      <p className="mt-2 text-[11px] leading-[1.4] text-ink-muted">{label}</p>
    </div>
  );
}
