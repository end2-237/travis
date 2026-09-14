/** Référentiels partagés entre le formulaire, le moteur de matching et le PDF. */

export const DEGREES = [
  "Baccalauréat",
  "BTS",
  "DUT",
  "Licence",
  "Master",
  "Doctorat",
] as const;

export const FIELDS = [
  "Informatique",
  "Génie Civil",
  "Génie Électrique",
  "Médecine",
  "Pharmacie",
  "Business",
  "Sciences Économiques",
  "Droit",
  "Agronomie",
  "Sciences de l'Environnement",
  "Arts & Design",
  "Sciences de l'Éducation",
  "Communication",
  "Logistique & Transport",
] as const;

export const COUNTRIES = [
  "Afrique du Sud",
  "Allemagne",
  "Belgique",
  "Burkina Faso",
  "Canada",
  "Chine",
  "Chypre",
  "Corée du Sud",
  "Égypte",
  "Émirats Arabes Unis",
  "États-Unis",
  "France",
  "Hongrie",
  "Inde",
  "Italie",
  "Japon",
  "Kenya",
  "Ghana",
  "Malaisie",
  "Maroc",
  "Pays-Bas",
  "Pologne",
  "Roumanie",
  "Rwanda",
  "Sénégal",
  "Suède",
  "Turquie",
  "Tunisie",
  "Royaume-Uni",
] as const;

export const LANGUAGE_LEVELS = [
  "Français uniquement",
  "Anglais débutant (A1-A2)",
  "Anglais intermédiaire (B1-B2)",
  "Anglais avancé (C1-C2)",
  "Bilingue français / anglais",
] as const;

export const BUDGET_BRACKETS = [
  { value: 0, label: "Bourse intégrale uniquement (0 FCFA)" },
  { value: 500_000, label: "Jusqu'à 500 000 FCFA / an" },
  { value: 1_500_000, label: "Jusqu'à 1 500 000 FCFA / an" },
  { value: 3_000_000, label: "Jusqu'à 3 000 000 FCFA / an" },
  { value: 9_000_000, label: "Plus de 3 000 000 FCFA / an" },
] as const;

export type Degree = (typeof DEGREES)[number];
export type Field = (typeof FIELDS)[number];
export type Country = (typeof COUNTRIES)[number];
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];
