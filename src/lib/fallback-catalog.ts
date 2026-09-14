import { CATALOG } from "@/data/catalog";
import type { Scholarship } from "@/types/database";

/**
 * Catalogue servi quand Supabase n'est pas configuré.
 * Il dérive de la même source que `supabase/seed.sql` : le mode
 * démonstration expose donc exactement les 50 programmes de production.
 */
export const FALLBACK_CATALOG: Scholarship[] = CATALOG.map((entry) => ({
  id: entry.slug,
  slug: entry.slug,
  title: entry.title,
  country: entry.country,
  institution: entry.institution,
  degree_levels: entry.degree_levels,
  eligible_fields: entry.eligible_fields,
  min_gpa_20: entry.min_gpa_20,
  max_age: entry.max_age,
  funding_coverage: entry.funding_coverage,
  deadline_month: entry.deadline_month,
  language_requirements: entry.language_requirements,
  annual_cost_xaf: entry.annual_cost_xaf,
  fully_funded: entry.fully_funded,
  application_url: entry.official_website,
  official_website: entry.official_website,
  notes: entry.summary,
  is_active: true,
  created_at: "1970-01-01T00:00:00.000Z",
}));
