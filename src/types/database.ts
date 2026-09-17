/** Types de la base Supabase — alignés sur supabase/migrations. */

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface Scholarship {
  id: string;
  /** Identifiant lisible, utilisé dans l'URL de la fiche détaillée. */
  slug: string;
  title: string;
  country: string;
  degree_levels: string[];
  eligible_fields: string[];
  min_gpa_20: number;
  max_age: number | null;
  funding_coverage: string | null;
  deadline_month: string | null;
  language_requirements: string | null;
  institution: string | null;
  annual_cost_xaf: number;
  fully_funded: boolean;
  application_url: string | null;
  official_website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  full_name: string | null;
  phone_number: string;
  current_degree: string;
  field_of_study: string;
  gpa_score: number;
  max_budget_xaf: number | null;
  city: string | null;
  target_countries: string[];
  language_level: string | null;
  /** Programme visé quand l'évaluation porte sur une seule opportunité. */
  focus_program: string | null;
  /** Matching figé à l'évaluation ; absent sur les profils antérieurs. */
  match_snapshot?: MatchSnapshot | null;
  created_at: string;
}

export interface Order {
  id: string;
  profile_id: string | null;
  amount: number;
  payment_status: PaymentStatus;
  transaction_ref: string | null;
  provider: string | null;
  provider_payload: Record<string, unknown> | null;
  pdf_storage_url: string | null;
  match_snapshot: MatchSnapshot | null;
  admissibility_score: number | null;
  paid_at: string | null;
  created_at: string;
}

/** Instantané du matching stocké sur la commande (PDF reproductible). */
export interface MatchSnapshot {
  generated_at: string;
  score: number;
  matches: ScoredScholarship[];
  teaser: TeaserSummary;
  /** Verdict détaillé quand l'évaluation cible un programme précis. */
  focus: ProgramVerdict | null;
}

/** Critère d'admissibilité évalué individuellement. */
export interface EligibilityCheck {
  label: string;
  passed: boolean;
  /** Ce que le candidat a, face à ce qui est exigé. */
  detail: string;
  /** Action concrète quand le critère n'est pas rempli. */
  remedy: string | null;
}

/**
 * Résultat d'une évaluation ciblée sur un programme unique.
 * Contrairement au matching global, il est produit même lorsque le candidat
 * n'est pas éligible : c'est précisément là qu'il a besoin de savoir pourquoi.
 */
export interface ProgramVerdict {
  slug: string;
  title: string;
  country: string;
  institution: string | null;
  eligible: boolean;
  fit_score: number;
  checks: EligibilityCheck[];
  headline: string;
}

export interface ScoredScholarship extends Scholarship {
  /** Score de compatibilité 0–100 du candidat avec ce programme. */
  fit_score: number;
  /** Écart entre la moyenne du candidat et le minimum requis. */
  gpa_margin: number;
  /** Le reste à charge tient-il dans le budget déclaré ? */
  within_budget: boolean;
  /** Le pays fait-il partie des destinations visées ? */
  country_targeted: boolean;
}

/** Résumé anonymisé affiché gratuitement (noms masqués). */
export interface TeaserSummary {
  total: number;
  /** Correspondances situées dans les destinations demandées. */
  targeted: number;
  fully_funded: number;
  affordable: number;
  regions: { region: string; count: number }[];
  best_fit_score: number;
  headline: string;
}
