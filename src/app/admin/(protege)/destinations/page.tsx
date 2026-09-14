import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { BarList, StatCard } from "@/components/admin/charts";
import { CATALOG } from "@/data/catalog";
import { getOverview } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage() {
  const data = await getOverview(90);

  // Confronter la demande à l'offre : une destination très demandée mais peu
  // couverte est un trou de catalogue, pas une bonne nouvelle.
  const supply = new Map<string, number>();
  for (const entry of CATALOG) {
    supply.set(entry.country, (supply.get(entry.country) ?? 0) + 1);
  }

  const gaps = data.countries
    .map((c) => ({
      ...c,
      programs: supply.get(c.country) ?? 0,
      ratio: c.requests / Math.max(supply.get(c.country) ?? 0, 1),
    }))
    .sort((a, b) => b.ratio - a.ratio);

  const uncovered = gaps.filter((g) => g.programs === 0);

  return (
    <AdminShell
      title="Destinations"
      lede="Ce que les candidats demandent, confronté à ce que le catalogue propose. Sur 90 jours."
      demo={data.demo}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Destinations demandées"
          value={String(data.countries.length)}
          hint={`Sur ${supply.size} couvertes par le catalogue`}
        />
        <StatCard
          label="Demande la plus forte"
          value={data.countries[0]?.country ?? "—"}
          hint={`${data.countries[0]?.requests ?? 0} demandes`}
        />
        <StatCard
          accent={uncovered.length > 0}
          label="Destinations sans programme"
          value={String(uncovered.length)}
          hint={
            uncovered.length > 0
              ? uncovered.map((u) => u.country).join(", ")
              : "Toute la demande est couverte"
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-panel bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
            Demande par destination
          </h2>
          <p className="mb-5 mt-1 text-[11.5px] text-ink-muted">
            Pays cochés à l&apos;évaluation, tous profils confondus.
          </p>
          <BarList
            items={data.countries.map((c) => ({
              label: c.country,
              value: c.requests,
              hint: `${supply.get(c.country) ?? 0} programme${(supply.get(c.country) ?? 0) > 1 ? "s" : ""} au catalogue`,
            }))}
            valueLabel="demandes"
          />
        </section>

        <section className="rounded-panel bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
            Tension offre / demande
          </h2>
          <p className="mb-5 mt-1 text-[11.5px] text-ink-muted">
            Demandes par programme disponible. Au-dessus de 30, le catalogue
            mérite d&apos;être étoffé sur cette destination.
          </p>
          <BarList
            items={gaps.slice(0, 10).map((g) => ({
              label: g.country,
              value: Math.round(g.ratio),
              hint:
                g.programs === 0
                  ? "Aucun programme référencé"
                  : `${g.requests} demandes · ${g.programs} programme${g.programs > 1 ? "s" : ""}`,
            }))}
            valueLabel="dem./prog."
          />
        </section>
      </div>

      {/* Fiches générées */}
      <section className="mt-4 rounded-panel bg-white p-6 shadow-card">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          Fiches les plus consultées
        </h2>
        <p className="mb-5 mt-1 text-[11.5px] text-ink-muted">
          Programmes ouverts en détail. Un programme très consulté et peu retenu
          signale souvent un critère dissuasif.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="pb-3 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-faint">
                  Programme
                </th>
                <th className="pb-3 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-faint">
                  Destination
                </th>
                <th className="pb-3 text-right text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-faint">
                  Vues
                </th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {data.programs.map((program) => (
                <tr key={program.slug} className="border-b border-line last:border-b-0">
                  <td className="py-3 pr-4 text-[12.5px]">{program.title}</td>
                  <td className="py-3 pr-4 text-[12px] text-ink-muted">
                    {program.country}
                  </td>
                  <td className="py-3 pr-4 text-right text-[12.5px] font-semibold tabular-nums">
                    {program.views}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/destinations/${program.slug}`}
                      className="inline-flex items-center gap-1 text-[11.5px] text-ink-muted transition-colors hover:text-ink"
                    >
                      Ouvrir
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
