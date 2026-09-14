/**
 * Accords et prépositions.
 *
 * « en Japon » ou « avec un Licence » décrédibilisent un service vendu à des
 * francophones. Les règles françaises n'étant pas dérivables du nom, elles
 * sont déclarées explicitement pour les entrées du catalogue.
 */

type Preposition = "en" | "au" | "aux" | "à";

/** Préposition de lieu par pays ; « en » par défaut (majorité féminine). */
const PREPOSITION: Record<string, Preposition> = {
  Japon: "au",
  Maroc: "au",
  Canada: "au",
  Kenya: "au",
  Rwanda: "au",
  Ghana: "au",
  Sénégal: "au",
  "Burkina Faso": "au",
  "Royaume-Uni": "au",
  "Émirats Arabes Unis": "aux",
  "Pays-Bas": "aux",
  "États-Unis": "aux",
  Chypre: "à",
};

/** « au Japon », « en Turquie », « aux Pays-Bas », « à Chypre ». */
export function inCountry(country: string): string {
  if (country === "Multi-pays") return "dans plusieurs pays";
  return `${PREPOSITION[country] ?? "en"} ${country}`;
}

/** « en Turquie et en Italie », « dans vos 4 destinations ». */
export function countryList(countries: string[]): string {
  if (countries.length === 0) return "";
  if (countries.length > 3) return `dans vos ${countries.length} destinations`;

  const parts = countries.map(inCountry);
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} et ${parts[parts.length - 1]}`;
}

/** Article indéfini du diplôme : « une Licence », « un Master ». */
const FEMININE_DEGREES = new Set(["Licence", "Maîtrise"]);

export function withDegreeArticle(degree: string): string {
  return `${FEMININE_DEGREES.has(degree) ? "une" : "un"} ${degree}`;
}

/**
 * Accord du pluriel à la française : au-dessous de 2, le nom reste au
 * singulier — « 1,50 point », et non « 1,50 points ».
 */
export function plural(value: number, word: string, suffix = "s"): string {
  return Math.abs(value) >= 2 ? `${word}${suffix}` : word;
}
