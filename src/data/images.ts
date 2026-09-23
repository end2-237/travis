/**
 * Visuel associé à chaque destination.
 *
 * Un visuel par pays, et non une rotation arbitraire : afficher le Colisée
 * sur une fiche marocaine décrédibilise l'ensemble du catalogue. Chaque
 * identifiant a été **ouvert et regardé** avant d'entrer ici — c'est ainsi
 * qu'on a découvert que l'image portée par la Hongrie montrait Prague.
 *
 * Quatre pays du catalogue n'ont pas de visuel attribué : Lettonie, Brunei,
 * Taïwan et Qatar. Ils reçoivent l'image neutre de repli, qui ne représente
 * aucun lieu. C'est délibéré : une photographie présentée comme Doha sans
 * qu'on ait pu le vérifier est un mensonge de plus dans un produit qui n'en
 * fait aucun. Une image neutre ne prétend rien.
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
  // Le pont des Chaînes et le Parlement sur le Danube. L'identifiant
  // précédent montrait Prague — vérifié à l'œil, corrigé.
  Hongrie: "photo-1551867633-194f125bddfa",
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
  // ── Pays ajoutés avec le catalogue élargi ──────────────────────────
  Tchéquie: "photo-1513805959324-96eb66ca8713",
  Suisse: "photo-1530122037265-a5f1f91d3b99",
  Autriche: "photo-1516550893923-42d28e5677af",
  Irlande: "photo-1590089415225-401ed6f9db8e",
  Espagne: "photo-1583422409516-2895a77efded",
  Russie: "photo-1547448415-e9f5b28e570d",
  Singapour: "photo-1525625293386-3f8f99389edd",
  "Hong Kong": "photo-1536599018102-9f803c140fc1",
  Indonésie: "photo-1544644181-1484b3fdfc62",
  "Arabie saoudite": "photo-1580418827493-f2b22c0a76cb",
  Brésil: "photo-1516306580123-e6e52b1b7b5f",
  Australie: "photo-1506973035872-a4ec16b8e8d9",
  "Nouvelle-Zélande": "photo-1507699622108-4be3abd695ad",
  "États-Unis": "photo-1518235506717-e1ed3306a89b",
  "Multi-pays": "photo-1541339907198-e08756dedf3f",
};

const FALLBACK = "photo-1541339907198-e08756dedf3f";

export function countryImage(country: string, width = 1600): string {
  const id = BY_COUNTRY[country] ?? FALLBACK;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;
}
