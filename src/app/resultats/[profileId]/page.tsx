import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe2, Lock, Sparkles, Wallet } from "lucide-react";
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
  const { teaser, score, matches } = snapshot;

  return (
    <main>
      <PageHeader />

      <section className="shell pt-12 md:pt-16">
        <span className="eyebrow">Résultat de l&apos;évaluation</span>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div>
            <h1 className="section-title max-w-[20ch]">
              {profile.full_name?.split(" ")[0] ?? "Votre profil"}, votre score
              d&apos;admissibilité est de {score}&nbsp;%
            </h1>
            <p className="mt-3 max-w-[62ch] text-[12.5px] leading-[1.6] text-ink-muted">
              {teaser.headline}
            </p>

            {/* Jauge du score */}
            <div className="mt-7 rounded-panel bg-white p-6 shadow-card">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] text-ink-muted">
                    Score d&apos;admissibilité globale
                  </p>
                  <p className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.045em]">
                    {score}
                    <span className="text-[20px] text-ink-muted">&nbsp;%</span>
                  </p>
                </div>
                <p className="pb-1 text-right text-[11px] text-ink-muted">
                  {formatGpa(Number(profile.gpa_score))}
                  <br />
                  {profile.field_of_study}
                </p>
              </div>

              <div
                className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface-sunk"
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Score d'admissibilité"
              >
                <div
                  className="h-full rounded-full bg-ink transition-[width] duration-700"
                  style={{ width: `${Math.max(score, 3)}%` }}
                />
              </div>
            </div>

            {/* Synthèse chiffrée, sans nommer les programmes */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SummaryTile
                icon={<Sparkles className="h-4 w-4" strokeWidth={1.7} />}
                value={String(teaser.fully_funded)}
                label="bourses à 100 %"
              />
              <SummaryTile
                icon={<Wallet className="h-4 w-4" strokeWidth={1.7} />}
                value={String(teaser.affordable)}
                label="options dans votre budget"
              />
              <SummaryTile
                icon={<Globe2 className="h-4 w-4" strokeWidth={1.7} />}
                value={String(teaser.regions.length)}
                label="régions accessibles"
              />
            </div>

            {/* Liste masquée */}
            <div className="mt-4 rounded-panel bg-white p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-semibold tracking-[-0.02em]">
                  {teaser.total} correspondance
                  {teaser.total > 1 ? "s" : ""} identifiée
                  {teaser.total > 1 ? "s" : ""}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunk px-2.5 py-1 text-[10.5px] text-ink-muted">
                  <Lock className="h-3 w-3" strokeWidth={2} />
                  Noms masqués
                </span>
              </div>

              <ul className="mt-4 divide-y divide-line">
                {matches.slice(0, 5).map((match, index) => (
                  <li
                    key={match.id}
                    className="flex items-center gap-3 py-3 first:pt-0"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-sunk text-[11px] font-medium text-ink-muted">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block h-3 w-[min(72%,280px)] rounded-full bg-surface-sunk" />
                      <span className="mt-2 block text-[11px] text-ink-muted">
                        {match.country} ·{" "}
                        {match.fully_funded
                          ? "financement intégral"
                          : "frais réduits"}{" "}
                        · clôture {match.deadline_month ?? "à confirmer"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold tabular-nums">
                      {match.fit_score}&nbsp;%
                    </span>
                  </li>
                ))}
              </ul>

              {teaser.total > 5 ? (
                <p className="mt-4 text-[11px] text-ink-faint">
                  + {teaser.total - 5} autre
                  {teaser.total - 5 > 1 ? "s" : ""} correspondance
                  {teaser.total - 5 > 1 ? "s" : ""} dans le rapport complet.
                </p>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <UnlockPanel
              profileId={profile.id}
              phoneNumber={profile.phone_number}
              total={teaser.total}
            />
          </div>
        </div>
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
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-sunk text-ink">
        {icon}
      </span>
      <p className="mt-3 text-[24px] font-semibold leading-none tracking-[-0.04em]">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}
