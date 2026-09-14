/** Regroupement des pays du catalogue en régions, pour le teaser gratuit. */
const REGION_BY_COUNTRY: Record<string, string> = {
  Japon: "Asie",
  Chine: "Asie",
  "Corée du Sud": "Asie",
  Inde: "Asie",
  Malaisie: "Asie",
  "Émirats Arabes Unis": "Moyen-Orient",
  Turquie: "Europe",
  Chypre: "Europe",
  Italie: "Europe",
  France: "Europe",
  Allemagne: "Europe",
  Belgique: "Europe",
  "Pays-Bas": "Europe",
  Suède: "Europe",
  Hongrie: "Europe",
  Pologne: "Europe",
  Roumanie: "Europe",
  "Royaume-Uni": "Europe",
  Maroc: "Afrique du Nord",
  Tunisie: "Afrique du Nord",
  Égypte: "Afrique du Nord",
  Sénégal: "Afrique de l'Ouest",
  Ghana: "Afrique de l'Ouest",
  "Burkina Faso": "Afrique de l'Ouest",
  Kenya: "Afrique de l'Est",
  Rwanda: "Afrique de l'Est",
  "Afrique du Sud": "Afrique australe",
  Canada: "Amérique du Nord",
  "États-Unis": "Amérique du Nord",
  "Multi-pays": "International",
};

export function regionOf(country: string): string {
  return REGION_BY_COUNTRY[country] ?? "International";
}
