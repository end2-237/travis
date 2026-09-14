import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import {
  AreaChart,
  BarList,
  DualColumns,
  StatCard,
} from "@/components/admin/charts";
import { getOverview } from "@/lib/admin/queries";
import { formatXaf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ jours?: string }>;
}) {
  const { jours } = await searchParams;
  const range = [7, 30, 90].includes(Number(jours)) ? Number(jours) : 30;
  const data = await getOverview(range);

  return (
    <AdminShell
      title="Vue d'ensemble"
      lede={`Audience, évaluations et chiffre d'affaires sur les ${range} derniers jours.`}
      demo={data.demo}
      actions={<RangePicker current={range} />}
    >
      {/* Chiffres clés */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          accent
          label={`Chiffre d'affaires · ${range} j`}
          value={formatXaf(data.revenueXaf)}
          hint={`${data.reports} rapport${data.reports > 1 ? "s" : ""} à 500 FCFA`}
        />
        <StatCard
          label="Visites"
          value={data.visits.toLocaleString("fr-FR").replace(/[  ]/g, " ")}
          hint={`${data.uniqueVisitors.toLocaleString("fr-FR").replace(/[  ]/g, " ")} visiteurs distincts`}
        />
        <StatCard
          label="Évaluations terminées"
          value={data.evaluations.toLocaleString("fr-FR").replace(/[  ]/g, " ")}
          hint={`${data.visits > 0 ? Math.round((data.evaluations / data.visits) * 100) : 0} % des visites`}
        />
        <StatCard
          label="Taux de conversion"
          value={`${data.conversionPct} %`}
          hint="Rapports payés rapportés aux évaluations terminées"
        />
      </div>

      {/* Chiffre d'affaires */}
      <section className="mt-4 rounded-panel bg-white p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              Chiffre d&apos;affaires quotidien
            </h2>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              Rapports effectivement réglés, en FCFA.
            </p>
          </div>
          <p className="text-[13px] font-semibold tabular-nums">
            {formatXaf(data.revenueXaf)}
          </p>
        </div>
        <AreaChart
          points={data.daily.map((d) => ({ date: d.date, value: d.revenueXaf }))}
          label="Chiffre d'affaires quotidien"
          format="xaf"
        />
      </section>

      {/* Entonnoir */}
      <section className="mt-4 rounded-panel bg-white p-6 shadow-card">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          Évaluations et rapports payés
        </h2>
        <p className="mb-5 mt-1 text-[11.5px] text-ink-muted">
          L&apos;écart entre les deux séries est votre marge de progression.
        </p>
        <DualColumns
          points={data.daily.map((d) => ({
            date: d.date,
            a: d.evaluations,
            b: d.reports,
          }))}
          labels={["Évaluations", "Rapports payés"]}
        />
      </section>

      {/* Demande */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-panel bg-white p-6 shadow-card">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
                Destinations les plus demandées
              </h2>
              <p className="mt-1 text-[11.5px] text-ink-muted">
                Pays cochés par les candidats à l&apos;évaluation.
              </p>
            </div>
            <Link
              href="/admin/destinations"
              className="flex shrink-0 items-center gap-1 text-[11.5px] text-ink-muted transition-colors hover:text-ink"
            >
              Détail
              <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>
          <BarList
            items={data.countries.slice(0, 7).map((c) => ({
              label: c.country,
              value: c.requests,
            }))}
            valueLabel="demandes"
          />
        </section>

        <section className="rounded-panel bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
            Fiches les plus consultées
          </h2>
          <p className="mb-5 mt-1 text-[11.5px] text-ink-muted">
            Programmes ouverts depuis le catalogue ou les résultats.
          </p>
          <BarList
            items={data.programs.slice(0, 7).map((p) => ({
              label: p.title,
              value: p.views,
              hint: p.country,
            }))}
            valueLabel="vues"
          />
        </section>
      </div>
    </AdminShell>
  );
}

function RangePicker({ current }: { current: number }) {
  return (
    <div className="flex rounded-full bg-surface-sunk p-1">
      {[7, 30, 90].map((days) => (
        <Link
          key={days}
          href={`/admin?jours=${days}`}
          aria-current={current === days ? "page" : undefined}
          className={
            current === days
              ? "rounded-full bg-white px-4 py-1.5 text-[12px] font-medium text-ink shadow-pill"
              : "rounded-full px-4 py-1.5 text-[12px] text-ink-muted transition-colors hover:text-ink"
          }
        >
          {days} j
        </Link>
      ))}
    </div>
  );
}
