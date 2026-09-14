import "server-only";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { FALLBACK_CATALOG } from "@/lib/fallback-catalog";
import { regionOf } from "@/lib/regions";
import type {
  MatchSnapshot,
  Scholarship,
  ScoredScholarship,
  TeaserSummary,
} from "@/types/database";

export interface MatchInput {
  gpa_score: number;
  current_degree: string;
  field_of_study: string;
  max_budget_xaf: number | null;
  target_countries: string[];
}

/**
 * Niveaux visés déduits du dernier diplôme obtenu.
 * Un titulaire de Licence vise un Master, mais reste éligible aux
 * programmes de Licence (réorientation, double cursus).
 */
export function deriveTargetDegrees(currentDegree: string): string[] {
  switch (currentDegree) {
    case "Baccalauréat":
      return ["Licence"];
    case "BTS":
    case "DUT":
      return ["Licence", "Master"];
    case "Licence":
      return ["Master", "Licence"];
    case "Master":
      return ["Doctorat", "Master"];
    case "Doctorat":
      return ["Doctorat"];
    default:
      return ["Licence", "Master"];
  }
}

/**
 * Requête de matching d'admissibilité (cf. SRS §3, étape 2) :
 * moyenne suffisante, niveau visé proposé et filière éligible.
 */
export async function fetchEligibleScholarships(
  input: MatchInput,
): Promise<Scholarship[]> {
  const targetDegrees = deriveTargetDegrees(input.current_degree);

  if (!isSupabaseConfigured()) {
    // Mode démonstration : catalogue local réduit, aucun accès base.
    return FALLBACK_CATALOG.filter(
      (s) =>
        s.min_gpa_20 <= input.gpa_score &&
        s.degree_levels.some((d) => targetDegrees.includes(d)) &&
        s.eligible_fields.includes(input.field_of_study),
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("scholarships")
    .select("*")
    .eq("is_active", true)
    .lte("min_gpa_20", input.gpa_score)
    .overlaps("degree_levels", targetDegrees)
    .contains("eligible_fields", [input.field_of_study]);

  if (error) {
    throw new Error(`Échec du matching d'admissibilité : ${error.message}`);
  }

  return (data ?? []) as Scholarship[];
}

/**
 * Score de compatibilité 0–100 d'un programme pour un profil donné.
 * Marge de moyenne (45 pts) + budget (30 pts) + pays visé (15 pts)
 * + financement intégral (10 pts).
 */
export function scoreScholarship(
  scholarship: Scholarship,
  input: MatchInput,
): ScoredScholarship {
  const gpaMargin = Number(
    (input.gpa_score - scholarship.min_gpa_20).toFixed(2),
  );
  const withinBudget =
    input.max_budget_xaf === null ||
    Number(scholarship.annual_cost_xaf) <= input.max_budget_xaf;
  const countryTargeted =
    input.target_countries.length === 0 ||
    input.target_countries.includes(scholarship.country);

  // Une marge de 4 points sur 20 sature la composante académique.
  const gpaPoints = Math.round(Math.min(gpaMargin / 4, 1) * 45);
  const budgetPoints = withinBudget ? 30 : Math.max(0, 30 - 20);
  const countryPoints = countryTargeted ? 15 : 4;
  const fundingPoints = scholarship.fully_funded ? 10 : 5;

  return {
    ...scholarship,
    fit_score: Math.min(
      100,
      gpaPoints + budgetPoints + countryPoints + fundingPoints,
    ),
    gpa_margin: gpaMargin,
    within_budget: withinBudget,
    country_targeted: countryTargeted,
  };
}

/** Score d'admissibilité global du profil, affiché dans le teaser. */
export function computeAdmissibilityScore(
  matches: ScoredScholarship[],
): number {
  if (matches.length === 0) return 0;

  const top = matches.slice(0, 5);
  const avgFit = top.reduce((sum, m) => sum + m.fit_score, 0) / top.length;
  // Le volume d'options compte pour 20 % du score global.
  const breadth = Math.min(matches.length / 10, 1) * 20;

  return Math.round(Math.min(99, avgFit * 0.8 + breadth));
}

/** Résumé gratuit : volumes et régions, sans jamais nommer un programme. */
export function buildTeaser(matches: ScoredScholarship[]): TeaserSummary {
  const fullyFunded = matches.filter((m) => m.fully_funded).length;
  const affordable = matches.filter(
    (m) => !m.fully_funded && m.within_budget,
  ).length;

  const byRegion = new Map<string, number>();
  for (const match of matches) {
    const region = regionOf(match.country);
    byRegion.set(region, (byRegion.get(region) ?? 0) + 1);
  }

  const regions = [...byRegion.entries()]
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);

  const parts: string[] = [];
  if (fullyFunded > 0) {
    const where = regions[0]?.region ? ` en ${regions[0].region}` : "";
    parts.push(
      `${fullyFunded} bourse${fullyFunded > 1 ? "s" : ""} à 100 %${where}`,
    );
  }
  if (affordable > 0) {
    const where = regions[1]?.region ?? regions[0]?.region;
    parts.push(
      `${affordable} université${affordable > 1 ? "s" : ""} abordable${
        affordable > 1 ? "s" : ""
      }${where ? ` en ${where}` : ""}`,
    );
  }

  return {
    total: matches.length,
    fully_funded: fullyFunded,
    affordable,
    regions: regions.slice(0, 4),
    best_fit_score: matches[0]?.fit_score ?? 0,
    headline:
      parts.length > 0
        ? `${parts.join(", ")} correspondent à votre profil.`
        : "Aucune correspondance directe — votre rapport détaille les passerelles possibles.",
  };
}

/** Matching complet : requête, scoring, tri et teaser. */
export async function runMatching(input: MatchInput): Promise<MatchSnapshot> {
  const eligible = await fetchEligibleScholarships(input);

  const matches = eligible
    .map((s) => scoreScholarship(s, input))
    .sort((a, b) => b.fit_score - a.fit_score || a.min_gpa_20 - b.min_gpa_20);

  return {
    generated_at: new Date().toISOString(),
    score: computeAdmissibilityScore(matches),
    matches,
    teaser: buildTeaser(matches),
  };
}
