/** Étape 4, page 5 du rapport : checklist documentaire et référents. */

export interface ChecklistItem {
  document: string;
  detail: string;
  referent: string;
}

export const DOCUMENT_CHECKLIST: ChecklistItem[] = [
  {
    document: "Relevés de notes légalisés",
    detail:
      "Copies certifiées conformes de toutes les années du dernier cycle, timbrées et signées.",
    referent: "Préfecture ou mairie du lieu de résidence",
  },
  {
    document: "Diplôme légalisé",
    detail:
      "Original + copie certifiée. Prévoir l'attestation de réussite si le diplôme n'est pas encore délivré.",
    referent: "Service de scolarité de l'établissement d'origine",
  },
  {
    document: "Traduction assermentée",
    detail:
      "Obligatoire pour les dossiers en anglais, turc, chinois ou hongrois. Compter 5 à 10 jours ouvrés.",
    referent: "Traducteur assermenté agréé près la Cour d'appel",
  },
  {
    document: "Passeport biométrique valide",
    detail:
      "Validité minimale de 18 mois à la date de dépôt. Renouveler dès maintenant si nécessaire.",
    referent: "Délégation générale à la Sûreté nationale",
  },
  {
    document: "Acte de naissance sécurisé",
    detail: "Version plurilingue recommandée, datant de moins de 6 mois.",
    referent: "Centre d'état civil de naissance",
  },
  {
    document: "Certificat médical & vaccinations",
    detail:
      "Fièvre jaune obligatoire ; certaines destinations exigent un test de tuberculose.",
    referent: "Centre de vaccination international agréé",
  },
  {
    document: "Attestation de niveau de langue",
    detail:
      "IELTS, TOEFL, TCF ou DELF selon la destination. Réserver la session 3 mois à l'avance.",
    referent: "Centre d'examen agréé (British Council, Institut français)",
  },
  {
    document: "Preuve de ressources financières",
    detail:
      "Relevé bancaire ou attestation de prise en charge, exigée pour le visa étudiant.",
    referent: "Banque domiciliataire + notaire pour la prise en charge",
  },
  {
    document: "Lettre de motivation & projet d'études",
    detail:
      "Une version par programme, alignée sur les axes de recherche de l'établissement visé.",
    referent: "Accompagnement Travis",
  },
  {
    document: "Lettres de recommandation",
    detail:
      "Deux minimum, signées et tamponnées, datant de moins de 12 mois.",
    referent: "Enseignants du dernier cycle ou employeur",
  },
];

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;

export interface TimelineStep {
  month: string;
  title: string;
  actions: string[];
}

/**
 * Calendrier chronologique construit à rebours des clôtures réelles
 * des programmes retenus (étape 4, page 4 du rapport).
 */
export function buildTimeline(deadlineMonths: string[]): TimelineStep[] {
  const now = new Date();
  const earliest = firstDeadlineIndex(deadlineMonths, now.getMonth());

  const steps: Omit<TimelineStep, "month">[] = [
    {
      title: "Verrouiller le socle documentaire",
      actions: [
        "Lancer la légalisation des relevés de notes et du diplôme",
        "Vérifier la validité du passeport, engager le renouvellement si besoin",
        "Demander l'acte de naissance sécurisé plurilingue",
      ],
    },
    {
      title: "Sécuriser la langue et les recommandations",
      actions: [
        "Réserver la session d'examen de langue exigée par vos programmes",
        "Solliciter deux lettres de recommandation signées et tamponnées",
        "Commander les traductions assermentées des pièces maîtresses",
      ],
    },
    {
      title: "Rédiger et adapter les candidatures",
      actions: [
        "Écrire une lettre de motivation par programme, pas une version générique",
        "Aligner le projet d'études sur les axes de recherche de chaque établissement",
        "Faire relire le dossier complet avant toute soumission",
      ],
    },
    {
      title: "Déposer les dossiers",
      actions: [
        "Soumettre au moins trois semaines avant la clôture officielle",
        "Archiver chaque accusé de réception et numéro de dossier",
        "Suivre les demandes de pièces complémentaires quotidiennement",
      ],
    },
    {
      title: "Préparer le visa et le départ",
      actions: [
        "Constituer la preuve de ressources et l'attestation de prise en charge",
        "Prendre rendez-vous au consulat dès réception de l'admission",
        "Organiser le logement et la couverture santé sur place",
      ],
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    month: MONTHS[(earliest - steps.length + index + 1 + 24) % 12],
  }));
}

/** Index du mois de clôture le plus proche parmi les programmes retenus. */
function firstDeadlineIndex(months: string[], currentMonth: number): number {
  const indexes = months
    .map((m) => MONTHS.findIndex((x) => x.toLowerCase() === m?.toLowerCase()))
    .filter((i) => i >= 0)
    .map((i) => (i < currentMonth ? i + 12 : i));

  if (indexes.length === 0) return currentMonth + 6;
  return Math.min(...indexes);
}
