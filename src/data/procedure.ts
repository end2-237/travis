/**
 * Procédures de candidature et pièces exigées.
 *
 * Les étapes sont factorisées par type de programme : une bourse
 * gouvernementale, une admission universitaire directe et un consortium
 * européen ne se déposent pas de la même façon. Chaque fiche ajoute ensuite
 * ses étapes propres.
 */

import type { ServiceKind } from "@/data/services";

export type ProgramKind = "gouvernementale" | "universitaire" | "consortium";

/**
 * Pièce du dossier, rattachée au service qui la produit.
 * Ce lien permet d'afficher le bon interlocuteur en regard de chaque
 * document, à l'écran comme dans le rapport.
 */
export interface RequiredDocument {
  label: string;
  service: ServiceKind;
}

export const PROCEDURE_TEMPLATES: Record<ProgramKind, string[]> = {
  gouvernementale: [
    "Créer un compte sur le portail officiel du programme et vérifier que votre filière figure dans l'appel de l'année en cours.",
    "Réunir les pièces légalisées avant d'ouvrir le formulaire : le portail se ferme à la date annoncée, sans prolongation.",
    "Saisir les notes exactes de chaque année du dernier cycle — un écart avec les relevés fournis invalide le dossier.",
    "Classer vos choix d'universités et de spécialités par ordre de préférence réelle : le comité affecte selon ce classement.",
    "Téléverser les pièces au format demandé (PDF, taille maximale imposée) et conserver l'accusé de dépôt.",
    "Suivre la publication des présélections, puis préparer l'entretien — il porte sur votre projet, pas sur vos notes.",
    "Après acceptation, demander la lettre officielle qui conditionne le rendez-vous consulaire.",
  ],
  universitaire: [
    "Vérifier sur le site de l'établissement que votre diplôme est reconnu et quelle équivalence il ouvre.",
    "Demander l'évaluation préalable du dossier académique si l'université la propose : elle évite un dépôt inutile.",
    "Remplir le formulaire d'admission et régler les frais de dossier s'ils s'appliquent.",
    "Déposer séparément la demande de bourse ou de réduction : l'admission ne la déclenche pas automatiquement.",
    "Obtenir la lettre d'admission conditionnelle, puis confirmer la place par le dépôt de garantie demandé.",
    "Demander le logement sur campus dès la confirmation — les places partent avant la rentrée.",
    "Constituer le dossier consulaire avec la lettre d'admission définitive.",
  ],
  consortium: [
    "Identifier le consortium et l'université coordinatrice : c'est elle qui reçoit le dossier, pas les partenaires.",
    "Vérifier les prérequis propres à chaque parcours du consortium — ils diffèrent d'un campus à l'autre.",
    "Préparer un projet d'études qui explicite la mobilité entre les établissements partenaires.",
    "Déposer une candidature unique couvrant l'ensemble du parcours, avec le classement des campus souhaités.",
    "Passer l'évaluation académique du consortium, puis l'entretien de sélection de la bourse.",
    "Après sélection, traiter les formalités du premier pays d'accueil, puis anticiper celles du second.",
  ],
};

/** Pièces exigées par pratiquement tous les programmes. */
export const BASE_DOCUMENTS: RequiredDocument[] = [
  {
    label: "Relevés de notes de toutes les années du dernier cycle, légalisés",
    service: "legalisation",
  },
  {
    label: "Diplôme ou attestation de réussite, légalisé",
    service: "legalisation",
  },
  {
    label: "Passeport biométrique valide au moins 18 mois",
    service: "passeport",
  },
  {
    label: "Acte de naissance sécurisé de moins de six mois",
    service: "etat-civil",
  },
  {
    label: "Lettre de motivation et projet d'études, une version par programme",
    service: "visa",
  },
  {
    label: "Curriculum vitae au format demandé par le programme",
    service: "visa",
  },
  {
    label: "Deux lettres de recommandation signées et tamponnées",
    service: "legalisation",
  },
  {
    label: "Photos d'identité aux normes du pays d'accueil",
    service: "photo",
  },
];

/** Pièces conditionnelles, ajoutées selon les caractéristiques du programme. */
export function conditionalDocuments(options: {
  languageRequirements: string;
  maxAge: number | null;
  fullyFunded: boolean;
  country: string;
}): RequiredDocument[] {
  const extra: RequiredDocument[] = [];

  if (/IELTS|TOEFL|anglais/i.test(options.languageRequirements)) {
    extra.push({
      label: "Attestation de niveau d'anglais (IELTS, TOEFL ou équivalent reconnu)",
      service: "langue",
    });
  }
  if (/français|francais/i.test(options.languageRequirements)) {
    extra.push({
      label: "Attestation de niveau de français (TCF, DELF ou DALF)",
      service: "langue",
    });
  }
  if (
    /turc|japonais|chinois|coréen|allemand|italien|roumain|polonais/i.test(
      options.languageRequirements,
    )
  ) {
    extra.push({
      label:
        "Justificatif de langue locale, ou inscription à l'année préparatoire proposée",
      service: "langue",
    });
  }
  if (options.maxAge !== null) {
    extra.push({
      label: `Pièce d'identité prouvant que vous aviez moins de ${options.maxAge} ans à la date de clôture`,
      service: "etat-civil",
    });
  }
  if (!options.fullyFunded) {
    extra.push({
      label: "Preuve de ressources ou attestation de prise en charge notariée",
      service: "financier",
    });
  }

  // La traduction assermentée n'est pas une pièce en soi mais une étape
  // obligée dès que le dossier n'est pas instruit en français.
  if (!/français courant|Français uniquement/i.test(options.languageRequirements)) {
    extra.push({
      label: "Traduction assermentée des pièces académiques et d'état civil",
      service: "traduction",
    });
  }

  extra.push({
    label: "Certificat médical et carnet de vaccination international",
    service: "medical",
  });

  return extra;
}

/** Traductions assermentées nécessaires selon la langue d'instruction. */
export function translationNeeds(languageRequirements: string): string {
  if (/anglais|IELTS|TOEFL/i.test(languageRequirements)) {
    return "Traduction assermentée en anglais des relevés, du diplôme et de l'acte de naissance.";
  }
  if (/turc/i.test(languageRequirements)) {
    return "Traduction assermentée en turc ou en anglais, puis apostille selon la demande du consulat.";
  }
  if (/chinois/i.test(languageRequirements)) {
    return "Traduction assermentée en chinois ou en anglais, notariée puis légalisée.";
  }
  if (/arabe/i.test(languageRequirements)) {
    return "Traduction assermentée en arabe des pièces d'état civil et des relevés.";
  }
  return "Aucune traduction si le dossier est instruit en français ; sinon traduction assermentée des pièces académiques.";
}
