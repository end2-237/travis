/**
 * Contenu de la page d'accueil.
 * La structure des sections reprend le kit de design au millimètre ;
 * seules les données métier sont propres à Travis.
 */

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "#a-propos" },
  { label: "Bourses", href: "#opportunites" },
  { label: "Destinations", href: "#destinations" },
  { label: "Contact", href: "#contact" },
] as const;

export const IMG = {
  hero: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=75",
  manifesto: [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=640&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=640&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=640&q=80",
  ],
  deals: [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80",
  ],
  about:
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80",
  video:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=75",
  banner:
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=75",
} as const;

/** Section « Our Achievements » — 4 tuiles, la 3ᵉ mise en avant. */
export const ACHIEVEMENTS = [
  { value: "12,4K+", label: "profils évalués" },
  { value: "380+", label: "bourses référencées" },
  { value: "48", label: "pays couverts", featured: true },
  { value: "96%", label: "dossiers conformes" },
] as const;

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
    body: "Votre moyenne, votre filière et votre budget sont confrontés à 380 programmes réels. Aucun résultat inventé.",
  },
  {
    icon: "headset" as const,
    title: "Accompagnement jusqu'au dépôt",
    body: "Calendrier mois par mois, checklist documentaire et référents certifiés pour la légalisation et la traduction.",
  },
] as const;

/** Section « What our customer says ». */
export const TESTIMONIALS = [
  {
    title: "Admise à Rome après deux refus",
    body: "Le rapport a montré que je visais des programmes hors de portée avec ma moyenne. En repositionnant mon dossier sur trois universités compatibles, j'ai reçu deux réponses positives.",
    name: "Aïcha Nkoulou",
    role: "Master Informatique — Italie",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    title: "Le calendrier m'a évité de rater la session",
    body: "La checklist documentaire listait la légalisation et la traduction assermentée avec les bons référents. J'ai déposé mon dossier trois semaines avant la clôture.",
    name: "Steve Mbarga",
    role: "Licence Génie Civil — Turquie",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
] as const;

export const VIDEO_QUOTE = {
  quote: "Travis a transformé ma moyenne en stratégie de candidature.",
  name: "Michael Thompson",
  role: "Conseiller en orientation internationale",
} as const;

export const FOOTER_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "#a-propos" },
  { label: "Services", href: "#destinations" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions", href: "/conditions" },
] as const;
