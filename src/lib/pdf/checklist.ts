/** Calendrier des démarches, construit à rebours des clôtures réelles. */

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
