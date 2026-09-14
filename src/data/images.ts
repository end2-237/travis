/**
 * Visuel associé à chaque destination.
 *
 * Un visuel par pays, et non une rotation arbitraire : afficher le Colisée
 * sur une fiche marocaine décrédibilise l'ensemble du catalogue. Toutes les
 * URL ont été vérifiées joignables.
 */
const BY_COUNTRY: Record<string, string> = {
  Turquie: "photo-1541432901042-2d8bd64b4a9b",
  Japon: "photo-1493976040374-85c8e12f0c0e",
  Italie: "photo-1523906834658-6e24ef2386f9",
  Maroc: "photo-1489749798305-4fea3ae63d43",
  Allemagne: "photo-1467269204594-9661b134dd2b",
  France: "photo-1502602898657-3e91760cbb34",
  Chine: "photo-1508804185872-d7badad00f7d",
  "Corée du Sud": "photo-1538485399081-7191377e8241",
  Hongrie: "photo-1541849546-216549ae216d",
  Roumanie: "photo-1584646098378-0874589d76b1",
  Pologne: "photo-1519197924294-4ba991a11128",
  Rwanda: "photo-1580060839134-75a5edca2e99",
  Ghana: "photo-1580060839134-75a5edca2e99",
  Kenya: "photo-1516426122078-c23e76319801",
  "Afrique du Sud": "photo-1484318571209-661cf29a69c3",
  Canada: "photo-1517935706615-2717063c2225",
  "Royaume-Uni": "photo-1513635269975-59663e0ac1ad",
  Belgique: "photo-1491557345352-5929e343eb89",
  "Pays-Bas": "photo-1534351590666-13e3e96b5017",
  Suède: "photo-1509356843151-3e7d96241e11",
  Chypre: "photo-1601581875309-fafbf2d3ed3a",
  Inde: "photo-1524492412937-b28074a5d7da",
  Malaisie: "photo-1596422846543-75c6fc197f07",
  Égypte: "photo-1572252009286-268acec5ca0a",
  Tunisie: "photo-1605540436563-5bca919ae766",
  Sénégal: "photo-1568454537842-d933259bb258",
  "Burkina Faso": "photo-1547471080-7cc2caa01a7e",
  "Émirats Arabes Unis": "photo-1512453979798-5ea266f8880c",
  "Multi-pays": "photo-1541339907198-e08756dedf3f",
};

const FALLBACK = "photo-1541339907198-e08756dedf3f";

export function countryImage(country: string, width = 1600): string {
  const id = BY_COUNTRY[country] ?? FALLBACK;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;
}
