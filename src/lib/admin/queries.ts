import "server-only";
import { CATALOG } from "@/data/catalog";
import { SERVICES } from "@/data/services";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { REPORT_PRICE_XAF } from "@/lib/payments";
import type { ServiceProvider } from "@/data/services";

export interface DailyPoint {
  date: string;
  visits: number;
  evaluations: number;
  reports: number;
  revenueXaf: number;
}

export interface CountryDemand {
  country: string;
  requests: number;
  reports: number;
}

export interface ProgramDemand {
  slug: string;
  title: string;
  country: string;
  views: number;
}

export interface AdminOverview {
  /** Vrai quand les chiffres proviennent d'un jeu de démonstration. */
  demo: boolean;
  rangeDays: number;
  visits: number;
  uniqueVisitors: number;
  evaluations: number;
  reports: number;
  revenueXaf: number;
  /** Rapports payés / évaluations terminées, en pourcentage. */
  conversionPct: number;
  daily: DailyPoint[];
  countries: CountryDemand[];
  programs: ProgramDemand[];
}

export interface OrderRow {
  id: string;
  createdAt: string;
  status: string;
  amountXaf: number;
  provider: string | null;
  country: string | null;
  profileName: string | null;
}

/* ------------------------------------------------------------------ */
/* Jeu de démonstration                                                */
/* ------------------------------------------------------------------ */

/**
 * Générateur déterministe : le back-office reste lisible sans base, et deux
 * chargements affichent les mêmes chiffres — un dashboard qui change à chaque
 * rafraîchissement n'inspire aucune confiance, même en démonstration.
 */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function demoOverview(rangeDays: number): AdminOverview {
  const rand = seeded(20260914);
  const daily: DailyPoint[] = [];

  for (let i = rangeDays - 1; i >= 0; i--) {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() - i);
    const weekday = day.getUTCDay();
    // Creux de week-end : un profil d'audience plat sonnerait faux.
    const weekend = weekday === 0 || weekday === 6 ? 0.55 : 1;

    const visits = Math.round((90 + rand() * 110) * weekend);
    const evaluations = Math.round(visits * (0.16 + rand() * 0.08));
    const reports = Math.round(evaluations * (0.22 + rand() * 0.14));

    daily.push({
      date: day.toISOString().slice(0, 10),
      visits,
      evaluations,
      reports,
      revenueXaf: reports * REPORT_PRICE_XAF,
    });
  }

  const countries = [...CATALOG]
    .reduce<Map<string, number>>((acc, entry) => {
      acc.set(entry.country, (acc.get(entry.country) ?? 0) + 1);
      return acc;
    }, new Map())
    .entries();

  const countryDemand: CountryDemand[] = [...countries]
    .map(([country, weight]) => {
      const requests = Math.round(weight * (18 + rand() * 46));
      return {
        country,
        requests,
        reports: Math.round(requests * (0.2 + rand() * 0.2)),
      };
    })
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  const programs: ProgramDemand[] = CATALOG.slice(0, 10)
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      country: entry.country,
      views: Math.round(40 + rand() * 260),
    }))
    .sort((a, b) => b.views - a.views);

  const visits = daily.reduce((s, d) => s + d.visits, 0);
  const evaluations = daily.reduce((s, d) => s + d.evaluations, 0);
  const reports = daily.reduce((s, d) => s + d.reports, 0);

  return {
    demo: true,
    rangeDays,
    visits,
    uniqueVisitors: Math.round(visits * 0.72),
    evaluations,
    reports,
    revenueXaf: reports * REPORT_PRICE_XAF,
    conversionPct: evaluations > 0 ? Math.round((reports / evaluations) * 100) : 0,
    daily,
    countries: countryDemand,
    programs,
  };
}

/* ------------------------------------------------------------------ */
/* Lectures réelles                                                    */
/* ------------------------------------------------------------------ */

export async function getOverview(rangeDays = 30): Promise<AdminOverview> {
  if (!isSupabaseConfigured()) return demoOverview(rangeDays);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - rangeDays);
  const sinceIso = since.toISOString();

  const supabase = getSupabaseAdmin();

  const [events, profiles, orders] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("kind, country, subject, visitor_hash, created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("student_profiles")
      .select("target_countries, created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("orders")
      .select("amount, payment_status, paid_at, created_at")
      .gte("created_at", sinceIso),
  ]);

  const eventRows = events.data ?? [];
  const profileRows = profiles.data ?? [];
  const orderRows = orders.data ?? [];

  const byDay = new Map<string, DailyPoint>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    byDay.set(key, {
      date: key,
      visits: 0,
      evaluations: 0,
      reports: 0,
      revenueXaf: 0,
    });
  }

  const visitors = new Set<string>();
  for (const row of eventRows) {
    const key = String(row.created_at).slice(0, 10);
    const point = byDay.get(key);
    if (!point) continue;
    if (row.kind === "page_view" || row.kind === "program_viewed") {
      point.visits += 1;
      if (row.visitor_hash) visitors.add(String(row.visitor_hash));
    }
  }

  for (const row of profileRows) {
    const point = byDay.get(String(row.created_at).slice(0, 10));
    if (point) point.evaluations += 1;
  }

  for (const row of orderRows) {
    if (row.payment_status !== "SUCCESS") continue;
    const key = String(row.paid_at ?? row.created_at).slice(0, 10);
    const point = byDay.get(key);
    if (!point) continue;
    point.reports += 1;
    point.revenueXaf += Number(row.amount);
  }

  // Destinations demandées : ce que les candidats ont coché, pas ce que le
  // catalogue propose. C'est la demande réelle.
  const demand = new Map<string, CountryDemand>();
  for (const row of profileRows) {
    for (const country of (row.target_countries as string[] | null) ?? []) {
      const entry = demand.get(country) ?? { country, requests: 0, reports: 0 };
      entry.requests += 1;
      demand.set(country, entry);
    }
  }
  for (const row of eventRows) {
    if (!row.country) continue;
    const entry = demand.get(String(row.country)) ?? {
      country: String(row.country),
      requests: 0,
      reports: 0,
    };
    entry.reports += 1;
    demand.set(String(row.country), entry);
  }

  const programViews = new Map<string, number>();
  for (const row of eventRows) {
    if (row.kind !== "program_viewed" || !row.subject) continue;
    const key = String(row.subject);
    programViews.set(key, (programViews.get(key) ?? 0) + 1);
  }

  const daily = [...byDay.values()];
  const visits = daily.reduce((s, d) => s + d.visits, 0);
  const evaluations = daily.reduce((s, d) => s + d.evaluations, 0);
  const reports = daily.reduce((s, d) => s + d.reports, 0);
  const revenueXaf = daily.reduce((s, d) => s + d.revenueXaf, 0);

  return {
    demo: false,
    rangeDays,
    visits,
    uniqueVisitors: visitors.size,
    evaluations,
    reports,
    revenueXaf,
    conversionPct:
      evaluations > 0 ? Math.round((reports / evaluations) * 100) : 0,
    daily,
    countries: [...demand.values()]
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10),
    programs: [...programViews.entries()]
      .map(([slug, views]) => {
        const entry = CATALOG.find((e) => e.slug === slug);
        return {
          slug,
          title: entry?.title ?? slug,
          country: entry?.country ?? "—",
          views,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
  };
}

export async function getOrders(limit = 50): Promise<OrderRow[]> {
  if (!isSupabaseConfigured()) {
    const rand = seeded(424242);
    const statuses = ["SUCCESS", "SUCCESS", "SUCCESS", "PENDING", "FAILED"];
    const names = [
      "Aïcha Nkoulou",
      "Steve Mbarga",
      "Fatou Diop",
      "Jean-Claude Ateba",
      "Mariam Traoré",
      "Ousmane Fall",
    ];
    return Array.from({ length: 12 }, (_, i) => {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - i);
      return {
        id: `demo-${(i + 1).toString().padStart(4, "0")}`,
        createdAt: day.toISOString(),
        status: statuses[Math.floor(rand() * statuses.length)],
        amountXaf: REPORT_PRICE_XAF,
        provider: "demo",
        country: CATALOG[Math.floor(rand() * CATALOG.length)].country,
        profileName: names[Math.floor(rand() * names.length)],
      };
    });
  }

  const { data } = await getSupabaseAdmin()
    .from("orders")
    .select("id, created_at, payment_status, amount, provider, student_profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const profile = row.student_profiles as { full_name?: string } | null;
    return {
      id: String(row.id),
      createdAt: String(row.created_at),
      status: String(row.payment_status),
      amountXaf: Number(row.amount),
      provider: (row.provider as string | null) ?? null,
      country: null,
      profileName: profile?.full_name ?? null,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Partenaires                                                         */
/* ------------------------------------------------------------------ */

export interface PartnerRow extends ServiceProvider {
  /** Présent uniquement pour les partenaires stockés en base. */
  dbId?: string;
  commissionPct: number;
  editable: boolean;
}

export async function getPartners(): Promise<PartnerRow[]> {
  // Les démarches officielles vivent dans le code : elles ne dépendent
  // d'aucun contrat et ne sont donc pas éditables depuis le back-office.
  const fromCode: PartnerRow[] = SERVICES.map((service) => ({
    ...service,
    commissionPct: 0,
    editable: false,
  }));

  if (!isSupabaseConfigured()) return fromCode;

  const { data } = await getSupabaseAdmin()
    .from("partners")
    .select("*")
    .order("sort_order", { ascending: true });

  const fromDb: PartnerRow[] = (data ?? []).map((row) => ({
    id: String(row.slug),
    dbId: String(row.id),
    kind: row.kind,
    nature: "partner" as const,
    status: row.status === "actif" ? "actif" : "a_confirmer",
    name: String(row.name),
    summary: String(row.summary ?? ""),
    coverage: (row.coverage as string[]) ?? [],
    steps: (row.steps as { label: string; detail?: string }[]) ?? [],
    bring: (row.bring as string[]) ?? [],
    leadTime: String(row.lead_time ?? "À confirmer"),
    officialFee: (row.official_fee as string | null) ?? null,
    serviceFee: (row.service_fee as string | null) ?? null,
    address: (row.address as string | null) ?? null,
    hours: (row.hours as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    warning: (row.warning as string | null) ?? null,
    commissionPct: Number(row.commission_pct ?? 0),
    editable: true,
  }));

  // La base fait autorité : un partenaire re-référencé en base remplace son
  // emplacement déclaré dans le code.
  const dbSlugs = new Set(fromDb.map((p) => p.id));
  return [
    ...fromDb,
    ...fromCode.filter((p) => !dbSlugs.has(p.id)),
  ];
}
