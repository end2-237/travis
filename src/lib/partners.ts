import "server-only";
import { SERVICES, type ServiceKind, type ServiceProvider } from "@/data/services";
import { NB_DESTINATIONS } from "@/data/stats";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

/**
 * Services visibles du public.
 *
 * Les démarches officielles viennent toujours du code : elles ne dépendent
 * d'aucun contrat. Les partenaires commerciaux viennent de la base, et seuls
 * ceux marqués « actif » sont servis — un partenaire sans coordonnées
 * vérifiées ne doit pas apparaître comme s'il en avait.
 */
export async function getPublicServices(): Promise<ServiceProvider[]> {
  const official = SERVICES.filter((s) => s.nature === "institution");
  const placeholders = SERVICES.filter((s) => s.nature === "partner");

  if (!isSupabaseConfigured()) return [...official, ...placeholders];

  const { data, error } = await getSupabaseAdmin()
    .from("partners")
    .select("*")
    .eq("status", "actif")
    .order("sort_order", { ascending: true });

  if (error) {
    // Un incident de base ne doit pas vider la page : les démarches
    // officielles restent servies, elles sont la partie la plus utile.
    console.warn("[partenaires] lecture impossible", error.message);
    return [...official, ...placeholders];
  }

  const live: ServiceProvider[] = (data ?? []).map((row) => ({
    id: String(row.slug),
    kind: row.kind as ServiceKind,
    nature: "partner",
    status: "actif",
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
  }));

  // Un emplacement dont le partenaire est référencé disparaît au profit du vrai.
  const liveKinds = new Set(live.map((p) => p.kind));

  return [
    ...official,
    ...live,
    ...placeholders.filter((p) => !liveKinds.has(p.kind)),
  ];
}

/** Repères d'audience affichés aux candidats partenaires. */
export async function getPartnerReach(): Promise<{
  evaluations: number;
  countries: number;
  services: number;
  demo: boolean;
}> {
  const services = SERVICES.filter((s) => s.nature === "institution").length;

  if (!isSupabaseConfigured()) {
    return { evaluations: 0, countries: NB_DESTINATIONS, services, demo: true };
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);

  const { count } = await getSupabaseAdmin()
    .from("student_profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since.toISOString());

  return {
    evaluations: count ?? 0,
    // Compté dans le catalogue, pas recopié : la valeur était restée figée
    // à 29 depuis l'époque où le catalogue couvrait 29 destinations.
    countries: NB_DESTINATIONS,
    services,
    demo: false,
  };
}
