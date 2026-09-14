import { countryProfile, type CountryProfile } from "@/data/countries";
import { countryImage } from "@/data/images";
import {
  BASE_DOCUMENTS,
  PROCEDURE_TEMPLATES,
  conditionalDocuments,
  translationNeeds,
  type RequiredDocument,
} from "@/data/procedure";
import { PROGRAMS, type ProgramSpec } from "@/data/programs";

/**
 * Fiche complète d'un programme : ses caractéristiques propres, enrichies
 * du profil de son pays et de la procédure correspondant à son type.
 */
export interface CatalogEntry extends ProgramSpec {
  country_profile: CountryProfile;
  /** Procédure de candidature, étape par étape. */
  application_steps: string[];
  /** Pièces à constituer, chacune rattachée au service qui la produit. */
  required_documents: RequiredDocument[];
  /** Besoins de traduction assermentée. */
  translation: string;
  /** Budget annuel total estimé : reste à charge + logement + vie courante. */
  estimated_annual_total_xaf: number;
}

function buildEntry(program: ProgramSpec): CatalogEntry {
  const profile = countryProfile(program.country);

  const yearlyLiving = (profile.livingCostXaf + profile.housingCostXaf) * 12;
  // Une bourse intégrale couvre logement et vie courante : le reste à charge
  // se limite alors aux frais de départ, hors périmètre de cette estimation.
  const estimated = program.fully_funded
    ? program.annual_cost_xaf
    : program.annual_cost_xaf + yearlyLiving;

  return {
    ...program,
    // Le visuel suit la destination, jamais l'ordre du catalogue.
    image: countryImage(program.country),
    country_profile: profile,
    application_steps: PROCEDURE_TEMPLATES[program.kind],
    required_documents: [
      ...BASE_DOCUMENTS,
      ...conditionalDocuments({
        languageRequirements: program.language_requirements,
        maxAge: program.max_age,
        fullyFunded: program.fully_funded,
        country: program.country,
      }),
    ],
    translation: translationNeeds(program.language_requirements),
    estimated_annual_total_xaf: estimated,
  };
}

export const CATALOG: CatalogEntry[] = PROGRAMS.map(buildEntry);

const BY_SLUG = new Map(CATALOG.map((entry) => [entry.slug, entry]));

export function catalogEntry(slug: string): CatalogEntry | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Programmes de la même destination, hors celui affiché. */
export function relatedEntries(entry: CatalogEntry, limit = 3): CatalogEntry[] {
  const sameCountry = CATALOG.filter(
    (e) => e.country === entry.country && e.slug !== entry.slug,
  );
  const sameField = CATALOG.filter(
    (e) =>
      e.slug !== entry.slug &&
      e.country !== entry.country &&
      e.eligible_fields.some((f) => entry.eligible_fields.includes(f)),
  );

  return [...sameCountry, ...sameField].slice(0, limit);
}

export const COUNTRIES_IN_CATALOG = [
  ...new Set(CATALOG.map((e) => e.country)),
].sort((a, b) => a.localeCompare(b, "fr"));
