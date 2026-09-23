/**
 * Contenu de la page d'accueil.
 * La structure des sections reprend le kit de design au millimètre ;
 * seules les données métier sont propres à Travis.
 */

import {
  NB_DESTINATIONS,
  NB_INTEGRALES,
  NB_PROGRAMMES,
} from "@/data/stats";

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "#a-propos" },
  { label: "Bourses", href: "#opportunites" },
  { label: "Destinations", href: "/destinations" },
  { label: "Partenaires", href: "/partenaires" },
] as const;

/**
 * Visuels de l'accueil, avec leur description.
 *
 * Le texte alternatif décrit ce que la photo montre réellement — il a été
 * relu image par image. Annoncer « un belvédère » sur une photo de remise de
 * diplômes ne trompe pas seulement un lecteur d'écran : c'est le signe qu'on
 * a posé une image sans la regarder, et cela finit par se voir partout.
 */
export const IMG = {
  hero: {
    src: "https://images.unsplash.com/photo-1655720348590-c739c860beed?auto=format&fit=crop&w=1920&q=75",
    alt: "Quatre étudiants assis sur des marches, ordinateurs portables ouverts, sur un campus",
  },
  manifesto: [
    {
      src: "https://images.unsplash.com/photo-1620829813573-7c9e1877706f?auto=format&fit=crop&w=640&q=80",
      alt: "Étudiant travaillant sur un ordinateur portable",
    },
    {
      src: "https://images.unsplash.com/photo-1645263012710-35e2fc89cb5c?auto=format&fit=crop&w=640&q=80",
      alt: "Groupe de diplômés en toge riant ensemble",
    },
    {
      src: "https://images.unsplash.com/photo-1765650114546-83a73ec9d461?auto=format&fit=crop&w=640&q=80",
      alt: "Étudiante lisant un classeur sur un banc",
    },
  ],
  deals: [
    "https://images.unsplash.com/photo-1686213011624-8578b598ef0f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1692883702706-a50fc21da44f?auto=format&fit=crop&w=1400&q=80",
  ],
  about: {
    src: "https://images.unsplash.com/photo-1648301033733-44554c74ec50?auto=format&fit=crop&w=1400&q=80",
    alt: "Groupe d'étudiants accoudés à la balustrade d'un bâtiment universitaire",
  },
  banner: {
    src: "https://images.unsplash.com/photo-1594750852517-f37738fa2384?auto=format&fit=crop&w=1920&q=75",
    alt: "Deux diplômés en toge brandissant leur toque sur une allée de campus",
  },
} as const;

/**
 * Diaporama du haut de la section « bourses ».
 *
 * Ces photographies sont illustratives et ne représentent pas des candidats
 * accompagnés par Travis : le texte alternatif décrit donc ce qu'on y voit,
 * sans jamais suggérer qu'il s'agit de boursiers du service. Toutes ont été
 * ouvertes et regardées avant d'entrer ici.
 */
export const DIAPOS_BOURSES = [
  {
    src: "https://images.unsplash.com/photo-1680265254066-b2b65e1e95ca?auto=format&fit=crop&w=1200&q=78",
    alt: "Diplômé en toge devant une fontaine de campus",
    legende: "Une bourse intégrale couvre la scolarité, le logement et le vol.",
  },
  {
    src: "https://images.unsplash.com/photo-1738949538500-54647382e038?auto=format&fit=crop&w=1200&q=78",
    alt: "Groupe de diplômés en toge avant une cérémonie",
    legende: "Les sessions s'ouvrent entre septembre et mars selon le pays.",
  },
  {
    src: "https://images.unsplash.com/photo-1765650114551-1cc2b1873e92?auto=format&fit=crop&w=1200&q=78",
    alt: "Étudiante consultant un classeur, à l'extérieur",
    legende: "Chaque fiche renvoie au site officiel du programme.",
  },
  {
    src: "https://images.unsplash.com/photo-1736613335049-7aaa94a92a33?auto=format&fit=crop&w=1200&q=78",
    alt: "Diplômé traversant la scène lors d'une remise de diplômes",
    legende: "Le reste à charge annuel est affiché avant toute candidature.",
  },
  {
    src: "https://images.unsplash.com/photo-1604933762021-54a5858c9832?auto=format&fit=crop&w=1200&q=78",
    alt: "Étudiante travaillant sur un ordinateur portable à son bureau",
    legende: "L'évaluation se fait en trois étapes, sans créer de compte.",
  },
] as const;

/**
 * Section « Our Achievements » — 4 tuiles, la 3ᵉ mise en avant.
 *
 * Trois des quatre valeurs sont comptées dans le catalogue au moment du
 * build. Recopier « 50 » à la main était commode tant que le catalogue en
 * comptait 50 ; le jour où il en a compté 105, la page d'accueil s'est mise
 * à mentir sans que personne ne soit prévenu.
 */
export const ACHIEVEMENTS = [
  { value: String(NB_DESTINATIONS), label: "destinations couvertes" },
  { value: String(NB_PROGRAMMES), label: "programmes détaillés" },
  { value: String(NB_INTEGRALES), label: "bourses à 100 %", featured: true },
  { value: "500", label: "FCFA le rapport" },
];

/** Section « Exclusive deals just for you! » — 2 cartes visuelles. */
export const DEALS = [
  {
    image: IMG.deals[0],
    validity: "Session ouverte 28 Nov — 30 Déc",
    percent: "100%",
    percentTone: "gold" as const,
    title: "Bourses entièrement financées",
    body: "Scolarité, logement et allocation mensuelle couverts sur les programmes partenaires d'Asie et d'Europe de l'Est.",
    chips: ["Licence & Master", "Sans frais de dossier"],
  },
  {
    image: IMG.deals[1],
    validity: "Session ouverte 4 Déc — 26 Fév",
    percent: "50%",
    percentTone: "lime" as const,
    title: "Universités privées abordables",
    body: "Réduction de frais de scolarité négociée pour les profils dont la moyenne dépasse 13/20 sur le dernier cycle.",
    chips: ["Budget < 1,5M FCFA", "Rentrée février"],
  },
] as const;

/** Filtres de la section « Best travel destination ». */
export const FIELD_FILTERS = [
  "Informatique",
  "Génie Civil",
  "Médecine",
  "Business",
  "Agronomie",
  "Droit",
  "Sciences Éco",
  "Arts & Design",
] as const;

export type DestinationCard = {
  image: string;
  country: string;
  title: string;
  field: (typeof FIELD_FILTERS)[number];
  applicants: string;
  deadline: string;
  rating: string;
  price: string;
  unit: string;
  footnote: string;
};

/** Section « Best travel destination » — grille 3 × 2. */
export const DESTINATIONS: DestinationCard[] = [
  {
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
    country: "Italie",
    title: "Bourse d'excellence Invest Your Talent",
    field: "Informatique",
    applicants: "412 candidats",
    deadline: "Clôture 15 Fév",
    rating: "12,50 /20 min.",
    price: "0 FCFA",
    unit: "/ scolarité",
    footnote: "Financement intégral + allocation mensuelle de 900 €",
  },
  {
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
    country: "Japon",
    title: "Programme MEXT — Recherche & Ingénierie",
    field: "Génie Civil",
    applicants: "288 candidats",
    deadline: "Clôture 7 Mai",
    rating: "14,00 /20 min.",
    price: "0 FCFA",
    unit: "/ scolarité",
    footnote: "Billet d'avion, scolarité et 117 000 ¥ par mois",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80",
    country: "Kenya",
    title: "African Leadership Scholarship",
    field: "Business",
    applicants: "146 candidats",
    deadline: "Clôture 30 Mar",
    rating: "11,00 /20 min.",
    price: "320 000 FCFA",
    unit: "/ an",
    footnote: "Frais réduits de 70 % pour les profils CEMAC",
  },
  {
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
    country: "Maroc",
    title: "AMCI — Coopération universitaire",
    field: "Médecine",
    applicants: "530 candidats",
    deadline: "Clôture 22 Juin",
    rating: "12,00 /20 min.",
    price: "0 FCFA",
    unit: "/ scolarité",
    footnote: "Bourse mensuelle de 750 MAD + logement universitaire",
  },
  {
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80",
    country: "Turquie",
    title: "Türkiye Bursları — Cycle complet",
    field: "Agronomie",
    applicants: "377 candidats",
    deadline: "Clôture 20 Fév",
    rating: "13,00 /20 min.",
    price: "0 FCFA",
    unit: "/ scolarité",
    footnote: "Cours de langue, logement et couverture santé inclus",
  },
  {
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1000&q=80",
    country: "Canada",
    title: "Admission directe — Universités francophones",
    field: "Droit",
    applicants: "864 candidats",
    deadline: "Clôture 1 Nov",
    rating: "12,50 /20 min.",
    price: "1 200 000 FCFA",
    unit: "/ an",
    footnote: "Exemption partielle des droits de scolarité majorés",
  },
];

/** Section « Handpicked stays, honest prices ». */
export const ABOUT_FEATURES = [
  {
    icon: "compass" as const,
    title: "Un diagnostic chiffré, pas une promesse",
    body: `Votre moyenne, votre filière et votre budget sont confrontés à ${NB_PROGRAMMES} programmes réels, sources officielles à l'appui. Aucun résultat inventé.`,
  },
  {
    icon: "headset" as const,
    title: "Accompagnement jusqu'au dépôt",
    body: "Calendrier mois par mois, checklist documentaire et référents certifiés pour la légalisation et la traduction.",
  },
] as const;

/**
 * Diaporama de la section « exemples de lecture ».
 *
 * Même règle que ci-dessus : des scènes de travail et de révision, décrites
 * pour ce qu'elles sont. Aucune ne prétend montrer un utilisateur du service.
 */
export const DIAPOS_PARCOURS = [
  {
    src: "https://images.unsplash.com/photo-1610473068514-276d33c606dd?auto=format&fit=crop&w=1200&q=78",
    alt: "Étudiante travaillant à un bureau devant un ordinateur portable",
    legende: "Trois étapes : le profil, le budget, la destination visée.",
  },
  {
    src: "https://images.unsplash.com/photo-1647942678807-453cd34b98a7?auto=format&fit=crop&w=1200&q=78",
    alt: "Étudiant lisant un livre à une table",
    legende: "Le moteur compare votre moyenne au seuil réel de chaque programme.",
  },
  {
    src: "https://images.unsplash.com/photo-1765650114188-104862097861?auto=format&fit=crop&w=1200&q=78",
    alt: "Étudiante annotant un carnet dans un café",
    legende: "Le rapport détaille le calendrier mois par mois.",
  },
  {
    src: "https://images.unsplash.com/photo-1612299273045-362a39972259?auto=format&fit=crop&w=1200&q=78",
    alt: "Étudiant souriant devant un ordinateur portable",
    legende: "Chaque source officielle est citée et cliquable.",
  },
] as const;

/**
 * Section « Ce que le rapport dit » — exemples de lecture.
 *
 * Ce bloc portait auparavant deux témoignages signés d'un prénom, d'un nom,
 * d'une photo et de cinq étoiles. Aucun de ces étudiants n'existe : le
 * service n'a pas encore de promotion derrière lui. Sur un produit dont
 * l'argument principal est « aucun résultat inventé », inventer sa propre
 * clientèle était la seule ligne du site qu'on ne pouvait pas tenir.
 *
 * Ce sont donc des cas de lecture, présentés comme tels. Chacun décrit un
 * profil et ce que le moteur en fait — pas un client satisfait. Le jour où
 * de vrais retours existeront, ils prendront cette place avec un vrai nom
 * et un vrai accord.
 */
export const EXEMPLES_LECTURE = [
  {
    profil: "Moyenne 12,4 · Génie civil · budget nul",
    titre: "Écarter ce qui est hors de portée",
    body: "Une moyenne de 12,4 ferme la porte des programmes qui exigent 14. Le rapport les retire de la liste au lieu de les afficher comme des espoirs, et concentre le dossier sur les bourses dont le seuil est réellement franchi.",
  },
  {
    profil: "Licence obtenue · vise un Master · Europe",
    titre: "Deux niveaux ouverts, pas un",
    body: "Un titulaire de Licence reste éligible aux programmes de Licence tout en visant le Master. Les deux niveaux sont interrogés, parce qu'une réorientation coûte moins cher qu'une année perdue.",
  },
  {
    profil: "Budget 400 000 FCFA par an",
    titre: "Le reste à charge affiché avant le dépôt",
    body: "Chaque fiche porte le coût annuel restant, logement et vie courante compris. Un programme « gratuit » dont le séjour coûte 2 millions par an n'est pas gratuit, et le rapport le dit dans ces termes.",
  },
] as const;

export const FOOTER_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "#a-propos" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Devenir partenaire", href: "/devenir-partenaire" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions", href: "/conditions" },
] as const;
