import { CATALOG } from "@/data/catalog";

/**
 * Chiffres du catalogue, calculés et non recopiés.
 *
 * Ils étaient écrits en dur à une douzaine d'endroits — titre, méta,
 * manifeste, page 404, tuiles de résultats. Le jour où le catalogue est
 * passé de 50 à 105 programmes, chacun de ces endroits est devenu faux, et
 * rien ne le signalait.
 *
 * Un produit dont la promesse est « aucune information inventée » ne peut
 * pas afficher un compte périmé sur sa page d'accueil. Ces valeurs sont donc
 * dérivées à la construction : elles ne peuvent plus diverger de ce que le
 * moteur interroge réellement.
 */

/** Nombre de programmes au catalogue. */
export const NB_PROGRAMMES = CATALOG.length;

/** Programmes dont la scolarité et le séjour sont intégralement financés. */
export const NB_INTEGRALES = CATALOG.filter((e) => e.fully_funded).length;

/**
 * Destinations distinctes.
 *
 * « Multi-pays » désigne les consortiums qui répartissent leurs boursiers
 * entre plusieurs États : ce n'est pas une destination, et le compter comme
 * telle gonflerait le chiffre d'une unité sans rien apporter.
 */
export const NB_DESTINATIONS = new Set(
  CATALOG.map((e) => e.country).filter((c) => c !== "Multi-pays"),
).size;

/** Programmes ouverts à un niveau donné. */
export const NB_PAR_NIVEAU = CATALOG.reduce<Record<string, number>>(
  (acc, entry) => {
    for (const niveau of entry.degree_levels) {
      acc[niveau] = (acc[niveau] ?? 0) + 1;
    }
    return acc;
  },
  {},
);

/** Programmes sans aucun reste à charge annuel. */
export const NB_SANS_RESTE_A_CHARGE = CATALOG.filter(
  (e) => e.annual_cost_xaf === 0,
).length;
