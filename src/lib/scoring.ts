import type { Scholarship, ScoredScholarship } from "@/types/database";

/**
 * Classement des programmes — logique pure.
 *
 * Séparée de `matching.ts`, qui parle à la base et porte `server-only` :
 * les règles de classement sont la partie du moteur qui décide ce qu'un
 * candidat voit en premier, et c'est précisément celle qu'il faut pouvoir
 * exécuter dans un test, sans base ni serveur.
 */

/** Ce dont le classement a besoin, et rien de plus. */
export interface ScoringInput {
  gpa_score: number;
  max_budget_xaf: number | null;
  target_countries: string[];
}

/**
 * Score de compatibilité 0–100 d'un programme pour un profil donné.
 *
 * La pondération traduit une décision de produit, pas une préférence
 * technique. L'ancienne répartition donnait 45 points à la marge de moyenne
 * et 10 au financement intégral : une université privée au seuil bas
 * dépassait donc systématiquement une bourse d'État à 100 %. Un profil à
 * 14,25 voyait Istanbul Aydın (payante) devant Türkiye Bursları (intégrale)
 * — sur un site qui s'appelle « Trouvez Votre Bourse » et met en avant
 * ses bourses à 100 %.
 *
 * Le moteur classait la facilité d'admission ; il doit classer la valeur de
 * l'offre. Tous les programmes de la liste sont déjà éligibles — la requête
 * a filtré sur la moyenne, le niveau et la filière — donc la marge de
 * moyenne n'est plus un critère d'accès mais une mesure de confort, et elle
 * passe derrière.
 *
 *   financement intégral  38 / 12  ce que le candidat vient chercher
 *   reste à charge tenable 25 /  8  ce qui rend l'offre atteignable
 *   marge de moyenne        0 → 22  la sécurité de la candidature
 *   destination demandée   15 /  4  départage ; le tri gros grain agit déjà
 *
 * Les bornes ne sont pas choisies au jugé. L'écart de financement (26
 * points) dépasse strictement l'amplitude de la marge de moyenne (22) :
 * aucune combinaison de marge ne peut donc faire passer une formation
 * payante devant une bourse intégrale. C'est vérifié par un test, parce
 * qu'un déséquilibre de deux points suffit à réintroduire l'inversion —
 * c'est précisément ce qui s'était produit.
 */
export function scoreScholarship(
  scholarship: Scholarship,
  input: ScoringInput,
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

  // Une marge de 4 points sur 20 sature la composante académique : au-delà,
  // être « encore plus éligible » n'apporte rien au candidat.
  const gpaPoints = Math.round(Math.min(Math.max(gpaMargin, 0) / 4, 1) * 22);
  const budgetPoints = withinBudget ? 25 : 8;
  const countryPoints = countryTargeted ? 15 : 4;
  const fundingPoints = scholarship.fully_funded ? 38 : 12;

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

/**
 * Tri des correspondances, en trois paliers successifs.
 *
 * 1. **Les destinations demandées d'abord, toujours.** Un candidat qui a
 *    coché la Turquie et l'Italie ne veut pas voir l'Inde en tête parce
 *    qu'il y aurait une meilleure marge de moyenne.
 * 2. **Puis le financement intégral.** Tous les programmes de la liste sont
 *    déjà éligibles : entre une bourse à 100 % et une scolarité à payer,
 *    aucun score continu ne devrait pouvoir inverser l'ordre.
 * 3. **Le score départage** à l'intérieur de chaque palier, et la moyenne
 *    d'entrée la plus basse tranche les égalités — à valeur égale, la
 *    candidature la plus sûre passe devant.
 *
 * Les paliers ne se mélangent pas : c'est ce qui empêche une accumulation
 * de petits points de renverser une décision qui, pour le candidat, n'est
 * pas une question de points.
 */
export function sortMatches(matches: ScoredScholarship[]): ScoredScholarship[] {
  return [...matches].sort((a, b) => {
    if (a.country_targeted !== b.country_targeted) {
      return a.country_targeted ? -1 : 1;
    }
    if (a.fully_funded !== b.fully_funded) {
      return a.fully_funded ? -1 : 1;
    }
    return b.fit_score - a.fit_score || a.min_gpa_20 - b.min_gpa_20;
  });
}

