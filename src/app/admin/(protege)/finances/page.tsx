import { AdminShell } from "@/components/admin/shell";
import { AreaChart, StatCard } from "@/components/admin/charts";
import { getOrders, getOverview } from "@/lib/admin/queries";
import { REPORT_PRICE_XAF } from "@/lib/payments";
import { formatXaf } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  SUCCESS: "Réglée",
  PENDING: "En attente",
  FAILED: "Échouée",
};

export default async function AdminFinancesPage() {
  const [data, orders] = await Promise.all([getOverview(90), getOrders(50)]);

  const paid = orders.filter((o) => o.status === "SUCCESS");
  const pending = orders.filter((o) => o.status === "PENDING");
  const failed = orders.filter((o) => o.status === "FAILED");

  const last30 = data.daily.slice(-30);
  const previous30 = data.daily.slice(-60, -30);
  const revenue30 = last30.reduce((s, d) => s + d.revenueXaf, 0);
  const revenuePrev = previous30.reduce((s, d) => s + d.revenueXaf, 0);
  const delta =
    revenuePrev > 0
      ? Math.round(((revenue30 - revenuePrev) / revenuePrev) * 100)
      : null;

  const avgDaily = Math.round(revenue30 / Math.max(last30.length, 1));

  return (
    <AdminShell
      title="Finances"
      lede="Chiffre d'affaires, transactions et taux d'échec de paiement. Sur 90 jours."
      demo={data.demo}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          accent
          label="CA sur 30 jours"
          value={formatXaf(revenue30)}
          hint={
            delta === null
              ? "Pas encore de période de comparaison"
              : `${delta >= 0 ? "+" : ""}${delta} % par rapport aux 30 jours précédents`
          }
        />
        <StatCard
          label="CA sur 90 jours"
          value={formatXaf(data.revenueXaf)}
          hint={`${data.reports} rapport${data.reports > 1 ? "s" : ""} réglé${data.reports > 1 ? "s" : ""}`}
        />
        <StatCard
          label="Moyenne journalière"
          value={formatXaf(avgDaily)}
          hint={`Soit ${Math.round(avgDaily / REPORT_PRICE_XAF)} rapports par jour`}
        />
        <StatCard
          label="Paiements échoués"
          value={
            orders.length > 0
              ? `${Math.round((failed.length / orders.length) * 100)} %`
              : "—"
          }
          hint={`${failed.length} sur ${orders.length} transactions récentes`}
        />
      </div>

      <section className="mt-4 rounded-panel bg-white p-6 shadow-card">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          Chiffre d&apos;affaires quotidien
        </h2>
        <p className="mb-5 mt-1 text-[11.5px] text-ink-muted">
          Seules les transactions confirmées par l&apos;agrégateur sont
          comptées.
        </p>
        <AreaChart
          points={data.daily.map((d) => ({ date: d.date, value: d.revenueXaf }))}
          label="Chiffre d'affaires quotidien"
          format="xaf"
          height={200}
        />
      </section>

      <section className="mt-4 rounded-panel bg-white p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
            Transactions récentes
          </h2>
          <p className="text-[11.5px] text-ink-muted">
            {paid.length} réglée{paid.length > 1 ? "s" : ""} ·{" "}
            {pending.length} en attente · {failed.length} échouée
            {failed.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {["Référence", "Candidat", "Date", "Montant", "Statut"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={cn(
                        "pb-3 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-faint",
                        i === 3 && "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line last:border-b-0">
                  <td className="py-3 pr-4 font-mono text-[11px] text-ink-muted">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="py-3 pr-4 text-[12.5px]">
                    {order.profileName ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-[12px] text-ink-muted">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="py-3 pr-4 text-right text-[12.5px] font-semibold tabular-nums">
                    {formatXaf(order.amountXaf)}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-medium",
                        order.status === "SUCCESS" &&
                          "bg-positive/10 text-positive",
                        order.status === "PENDING" &&
                          "bg-surface-sunk text-ink-muted",
                        order.status === "FAILED" && "bg-red-50 text-red-700",
                      )}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-ink-muted">
            Aucune transaction enregistrée.
          </p>
        ) : null}
      </section>
    </AdminShell>
  );
}
