import "server-only";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { FALLBACK_CATALOG } from "@/lib/fallback-catalog";
import { regionOf } from "@/lib/regions";
import {
  computeAdmissibilityScore,
  scoreScholarship,
  sortMatches,
} from "@/lib/scoring";
import { catalogEntry } from "@/data/catalog";
import { countryList, plural, withDegreeArticle } from "@/lib/grammar";
import type {
  EligibilityCheck,
  MatchSnapshot,
  ProgramVerdict,
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
  language_level?: string | null;
  /** Slug du programme quand l'évaluation cible une opportunité précise. */
  focus_program?: string | null;
  /**
   * Type d'offre demandé depuis la carte d'accueil.
   * « bourse » : financement intégral seulement.
   * « universite » : admission directe, scolarité à la charge du candidat.
   * Absent : tout le catalogue.
   */
  visee?: "bourse" | "universite" | null;
}

/**
 * Évalue le profil contre UN programme, critère par critère.
 *
 * Produit un verdict même lorsque le candidat n'est pas éligible : le
 * matching global se contente d'écarter ces programmes, alors que c'est
 * justement là que le candidat a besoin de savoir ce qui bloque et ce qu'il
 * peut y faire.
 */
export function evaluateProgram(
  slug: string,
  input: MatchInput,
): ProgramVerdict | null {
  const entry = catalogEntry(slug);
  if (!entry) return null;

  const targetDegrees = deriveTargetDegrees(input.current_degree);
  const checks: EligibilityCheck[] = [];

  // Moyenne
  const margin = Number((input.gpa_score - entry.min_gpa_20).toFixed(2));
  checks.push({
    label: "Moyenne générale",
    passed: margin >= 0,
    detail: `Vous avez ${fmt(input.gpa_score)}/20, le seuil est ${fmt(entry.min_gpa_20)}/20.`,
    remedy:
      margin >= 0
        ? null
        : `Il vous manque ${fmt(Math.abs(margin))} ${plural(Math.abs(margin), "point")}. Une année de mise à niveau ou un second cycle mieux noté relève la moyenne du dernier diplôme, qui est celle retenue.`,
  });

  // Niveau
  const levelOk = entry.degree_levels.some((d) => targetDegrees.includes(d));
  checks.push({
    label: "Niveau visé",
    passed: levelOk,
    detail: levelOk
      ? `Avec ${withDegreeArticle(input.current_degree)}, vous visez ${targetDegrees[0]} — proposé ici.`
      : `Ce programme propose ${entry.degree_levels.join(", ")}, or vous visez ${targetDegrees.join(" ou ")}.`,
    remedy: levelOk
      ? null
      : `Visez un programme de ${targetDegrees[0]}, ou complétez d'abord le cycle intermédiaire.`,
  });

  // Filière
  const fieldOk = entry.eligible_fields.includes(input.field_of_study);
  checks.push({
    label: "Filière",
    passed: fieldOk,
    detail: fieldOk
      ? `${input.field_of_study} figure parmi les filières éligibles.`
      : `${input.field_of_study} n'est pas dans la liste : ${entry.eligible_fields.join(", ")}.`,
    remedy: fieldOk
      ? null
      : "Une réorientation est possible mais coûte une année. Cherchez d'abord un programme équivalent ouvert à votre filière.",
  });

  // Budget
  const budgetOk =
    input.max_budget_xaf === null ||
    entry.annual_cost_xaf <= input.max_budget_xaf;
  checks.push({
    label: "Budget",
    passed: budgetOk,
    detail: budgetOk
      ? entry.annual_cost_xaf === 0
        ? "Aucun reste à charge : la scolarité est intégralement couverte."
        : `Le reste à charge de ${entry.annual_cost_xaf.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} FCFA tient dans votre enveloppe.`
      : `Le reste à charge dépasse votre enveloppe déclarée de ${(entry.annual_cost_xaf - (input.max_budget_xaf ?? 0)).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} FCFA par an.`,
    remedy: budgetOk
      ? null
      : "Visez une bourse intégrale, ou cherchez un cofinancement avant de vous engager : le reste à charge se paie chaque année, pas une seule fois.",
  });

  // Âge
  if (entry.max_age !== null) {
    checks.push({
      label: "Limite d'âge",
      passed: true,
      detail: `Ce programme s'arrête à ${entry.max_age} ans, appréciés à la date de clôture.`,
      remedy: null,
    });
  }

  // Langue — déclaratif, donc signalé comme à vérifier plutôt que tranché
  if (input.language_level) {
    const needsEnglish = /anglais|IELTS|TOEFL/i.test(
      entry.language_requirements,
    );
    const hasEnglish = /anglais|bilingue/i.test(input.language_level);
    const languageOk = !needsEnglish || hasEnglish;
    checks.push({
      label: "Langue",
      passed: languageOk,
      detail: languageOk
        ? `Exigence : ${entry.language_requirements}. Votre niveau déclaré : ${input.language_level}.`
        : `Ce programme exige ${entry.language_requirements}, or vous avez déclaré « ${input.language_level} ».`,
      remedy: languageOk
        ? null
        : "Réservez une session IELTS ou TOEFL dès maintenant : entre la préparation et la délivrance du score, comptez trois à quatre mois.",
    });
  }

  const blocking = checks.filter((c) => !c.passed);
  const eligible = blocking.length === 0;
  const scored = scoreScholarship(entry as unknown as Scholarship, input);

  return {
    slug: entry.slug,
    title: entry.title,
    country: entry.country,
    institution: entry.institution,
    eligible,
    fit_score: eligible ? scored.fit_score : 0,
    checks,
    headline: eligible
      ? `Votre profil remplit les ${checks.length} critères de ce programme.`
      : blocking.length === 1
        ? `Un seul critère bloque : ${blocking[0].label.toLowerCase()}.`
        : `${blocking.length} critères bloquent votre candidature à ce programme.`,
  };
}

function fmt(value: number): string {
  return value.toFixed(2).replace(".", ",");
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
        s.eligible_fields.includes(input.field_of_study) &&
        (input.visee === "bourse"
          ? s.fully_funded
          : input.visee === "universite"
            ? !s.fully_funded
            : true),
    );
  }

  let query = getSupabaseAdmin()
    .from("scholarships")
    .select("*")
    .eq("is_active", true)
    .lte("min_gpa_20", input.gpa_score)
    .overlaps("degree_levels", targetDegrees)
    .contains("eligible_fields", [input.field_of_study]);

  // La carte d'accueil propose « Bourse » ou « Université » : la distinction
  // doit se voir dans le résultat, sans quoi les deux boutons mènent au même
  // écran et ne promettent rien.
  if (input.visee === "bourse") query = query.eq("fully_funded", true);
  if (input.visee === "universite") query = query.eq("fully_funded", false);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Échec du matching d'admissibilité : ${error.message}`);
  }

  return (data ?? []) as Scholarship[];
}

/** Résumé chiffré : volumes, régions, et priorité aux destinations visées. */
export function buildTeaser(
  matches: ScoredScholarship[],
  targetCountries: string[] = [],
): TeaserSummary {
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

  const inTarget = matches.filter((m) => m.country_targeted);
  const hasTarget = targetCountries.length > 0;

  let headline: string;
  if (matches.length === 0) {
    headline =
      "Aucune correspondance directe — élargissez vos critères ou visez une passerelle.";
  } else if (hasTarget && inTarget.length > 0) {
    const label = countryList(targetCountries);
    const others = matches.length - inTarget.length;
    headline =
      `${inTarget.length} programme${inTarget.length > 1 ? "s" : ""} ` +
      `correspond${inTarget.length > 1 ? "ent" : ""} à votre profil ${label}` +
      (others > 0
        ? `, et ${others} autre${others > 1 ? "s" : ""} ailleurs.`
        : ".");
  } else if (hasTarget) {
    headline =
      `Aucun programme ${countryList(targetCountries)} ne correspond à ` +
      `votre profil, mais ${matches.length} option${matches.length > 1 ? "s" : ""} ` +
      `existe${matches.length > 1 ? "nt" : ""} sur d'autres destinations.`;
  } else {
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
    headline = `${parts.join(", ")} correspondent à votre profil.`;
  }

  return {
    total: matches.length,
    targeted: inTarget.length,
    fully_funded: fullyFunded,
    affordable,
    regions: regions.slice(0, 4),
    best_fit_score: matches[0]?.fit_score ?? 0,
    headline,
  };
}


/** Matching complet : requête, scoring, tri et teaser. */
export async function runMatching(input: MatchInput): Promise<MatchSnapshot> {
  const eligible = await fetchEligibleScholarships(input);

  const matches = sortMatches(
    eligible.map((s) => scoreScholarship(s, input)),
  );

  const targeted = matches.filter((m) => m.country_targeted);

  return {
    focus: input.focus_program
      ? evaluateProgram(input.focus_program, input)
      : null,
    generated_at: new Date().toISOString(),
    // Le score global reflète les destinations visées quand il y en a :
    // sinon un candidat verrait 90 % grâce à des pays qu'il n'a pas demandés.
    score: computeAdmissibilityScore(
      targeted.length > 0 ? targeted : matches,
    ),
    matches,
    teaser: buildTeaser(matches, input.target_countries),
  };
}

// Réexportés depuis `scoring` : le point d'entrée du moteur reste unique
// pour le reste de l'application.
export { computeAdmissibilityScore, scoreScholarship, sortMatches };
