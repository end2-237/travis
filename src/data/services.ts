/**
 * Services nécessaires à la constitution du dossier d'immigration.
 *
 * Deux natures cohabitent, et la distinction est volontairement visible dans
 * l'interface :
 *
 * - `institution` : organisme public ou centre agréé. La procédure décrite est
 *   celle publiée par l'administration ; elle ne dépend d'aucun accord
 *   commercial et reste valable partout dans la zone CEMAC.
 *
 * - `partner` : partenaire commercial de Travis. Les coordonnées, tarifs et
 *   conditions sont ceux du contrat. Tant que `status` vaut "a_confirmer",
 *   l'interface affiche la nature du service sans inventer d'adresse ni de
 *   prix : un candidat ne doit jamais se déplacer sur la foi d'une donnée
 *   qui n'a pas été vérifiée.
 *
 * Pour référencer un partenaire : renseignez les champs de contact et de
 * tarif, puis passez `status` à "actif". Rien d'autre à modifier.
 */

export type ServiceKind =
  | "etat-civil"
  | "legalisation"
  | "traduction"
  | "apostille"
  | "langue"
  | "passeport"
  | "medical"
  | "photo"
  | "financier"
  | "visa";

export type ServiceStatus = "actif" | "a_confirmer";

export interface ServiceStep {
  label: string;
  detail?: string;
}

export interface ServiceProvider {
  id: string;
  kind: ServiceKind;
  nature: "institution" | "partner";
  status: ServiceStatus;
  name: string;
  /** Ce que le service produit, en une phrase. */
  summary: string;
  /** Zone couverte — villes ou pays. */
  coverage: string[];
  /** Procédure exacte, dans l'ordre. */
  steps: ServiceStep[];
  /** À apporter le jour du dépôt. */
  bring: string[];
  /** Délai observé entre le dépôt et la remise. */
  leadTime: string;
  /** Frais officiels perçus par l'administration. */
  officialFee: string | null;
  /** Frais de service du partenaire, en sus des frais officiels. */
  serviceFee: string | null;
  address: string | null;
  hours: string | null;
  phone: string | null;
  website: string | null;
  /** Piège fréquent, à lire avant de se déplacer. */
  warning: string | null;
}

export const SERVICE_LABELS: Record<ServiceKind, string> = {
  "etat-civil": "État civil",
  legalisation: "Légalisation",
  traduction: "Traduction assermentée",
  apostille: "Apostille",
  langue: "Certification de langue",
  passeport: "Passeport",
  medical: "Santé et vaccinations",
  photo: "Photos biométriques",
  financier: "Justificatifs financiers",
  visa: "Accompagnement consulaire",
};

export const SERVICES: ServiceProvider[] = [
  // ------------------------------------------------------------------
  // Organismes publics — procédures vérifiables, sans accord commercial
  // ------------------------------------------------------------------
  {
    id: "etat-civil-centre",
    kind: "etat-civil",
    nature: "institution",
    status: "actif",
    name: "Centre d'état civil de la commune de naissance",
    summary:
      "Délivre l'acte de naissance sécurisé, pièce de base de tout dossier consulaire.",
    coverage: ["Cameroun", "CEMAC", "CEDEAO"],
    steps: [
      {
        label: "Se présenter au centre d'état civil du lieu de naissance",
        detail:
          "Ce n'est pas la commune de résidence : seule la commune où la naissance a été déclarée peut délivrer l'acte.",
      },
      {
        label: "Demander une copie intégrale, pas un extrait",
        detail:
          "Les consulats refusent l'extrait simple. Précisez « copie intégrale sécurisée » au guichet.",
      },
      {
        label: "Demander une version plurilingue si la destination l'exige",
        detail:
          "Elle évite une traduction assermentée sur cette pièce, et fait économiser un délai de 5 à 10 jours.",
      },
      { label: "Régler les frais et conserver le reçu" },
      { label: "Retirer l'acte et vérifier l'orthographe des noms sur place" },
    ],
    bring: [
      "Pièce d'identité en cours de validité",
      "Ancien acte de naissance ou numéro d'acte si vous l'avez",
      "Livret de famille des parents si disponible",
    ],
    leadTime: "1 à 10 jours ouvrés selon la commune",
    officialFee: "Tarif communal affiché au guichet",
    serviceFee: null,
    address: null,
    hours: "Horaires administratifs, généralement 7h30 – 15h30",
    phone: null,
    website: null,
    warning:
      "Un acte de plus de six mois est refusé par la plupart des consulats. Ne l'obtenez pas trop tôt dans la procédure.",
  },
  {
    id: "legalisation-prefecture",
    kind: "legalisation",
    nature: "institution",
    status: "actif",
    name: "Préfecture ou mairie du lieu de résidence",
    summary:
      "Certifie conforme à l'original vos relevés de notes, diplômes et actes d'état civil.",
    coverage: ["Cameroun", "CEMAC"],
    steps: [
      {
        label: "Faire établir les copies au préalable",
        detail:
          "L'administration certifie des copies que vous apportez : elle ne les produit pas.",
      },
      {
        label: "Présenter l'original ET la copie au même guichet",
        detail:
          "Sans l'original sous les yeux de l'agent, la certification est refusée.",
      },
      {
        label: "Faire légaliser chaque année d'études séparément",
        detail:
          "Un relevé par année du dernier cycle. Prévoyez deux jeux complets : un pour le dossier, un pour le consulat.",
      },
      { label: "Acquitter le timbre fiscal exigé sur chaque pièce" },
      {
        label: "Vérifier que le cachet est lisible et daté",
        detail: "Un cachet pâle ou non daté fait rejeter la pièce à l'arrivée.",
      },
    ],
    bring: [
      "Originaux de chaque pièce à certifier",
      "Copies nettes, non rognées, du même format que l'original",
      "Timbres fiscaux au tarif en vigueur",
      "Pièce d'identité",
    ],
    leadTime: "Le jour même à 72 heures selon l'affluence",
    officialFee: "Timbre fiscal par pièce, tarif affiché",
    serviceFee: null,
    address: null,
    hours: "Horaires administratifs, guichets souvent fermés l'après-midi",
    phone: null,
    website: null,
    warning:
      "Commencez par là. La légalisation conditionne la traduction, qui conditionne l'apostille : les trois s'enchaînent et ne se rattrapent pas.",
  },
  {
    id: "traduction-cour-appel",
    kind: "traduction",
    nature: "institution",
    status: "actif",
    name: "Traducteur assermenté près la Cour d'appel",
    summary:
      "Seul habilité à produire une traduction opposable à une administration étrangère.",
    coverage: ["Cameroun", "CEMAC"],
    steps: [
      {
        label: "Consulter la liste officielle des traducteurs assermentés",
        detail:
          "Elle est tenue au greffe de la Cour d'appel. Une traduction faite hors de cette liste n'a aucune valeur consulaire.",
      },
      {
        label: "Faire légaliser les pièces AVANT de les faire traduire",
        detail:
          "Le traducteur traduit aussi les cachets. Traduire avant la légalisation oblige à tout refaire.",
      },
      {
        label: "Fournir l'orthographe exacte des noms propres",
        detail:
          "Telle qu'elle figure sur le passeport, sans quoi le dossier sera rejeté pour incohérence d'identité.",
      },
      { label: "Demander un devis écrit avant le dépôt" },
      {
        label: "Récupérer la traduction avec le cachet et la signature du traducteur",
        detail: "Vérifiez que chaque page est paraphée.",
      },
    ],
    bring: [
      "Pièces déjà légalisées",
      "Copie du passeport pour l'orthographe des noms",
      "Liste des pièces à traduire, écrite",
    ],
    leadTime: "5 à 10 jours ouvrés par lot",
    officialFee: "Tarif à la page, fixé librement par le traducteur",
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning:
      "Un traducteur non inscrit sur la liste de la Cour d'appel produit un document sans valeur, même s'il est cachetté. Vérifiez l'inscription avant de payer.",
  },
  {
    id: "apostille-justice",
    kind: "apostille",
    nature: "institution",
    status: "actif",
    name: "Service des apostilles du ministère de la Justice",
    summary:
      "Authentifie la signature du fonctionnaire ou du traducteur, pour les pays signataires de la Convention de La Haye.",
    coverage: ["Pays signataires de la Convention de La Haye"],
    steps: [
      {
        label: "Vérifier d'abord si la destination exige l'apostille",
        detail:
          "Les pays hors Convention demandent une légalisation consulaire classique, qui est une autre démarche.",
      },
      { label: "Présenter les pièces déjà légalisées et traduites" },
      { label: "Déposer la demande et régler les frais" },
      {
        label: "Retirer les pièces apostillées",
        detail: "L'apostille est un feuillet agrafé, ne le détachez jamais.",
      },
    ],
    bring: [
      "Pièces légalisées et traduites",
      "Formulaire de demande rempli",
      "Pièce d'identité",
    ],
    leadTime: "1 à 3 semaines",
    officialFee: "Frais par document, tarif officiel",
    serviceFee: null,
    address: null,
    hours: "Horaires administratifs",
    phone: null,
    website: null,
    warning:
      "L'apostille arrive en dernier. La faire avant la traduction oblige à recommencer toute la chaîne.",
  },
  {
    id: "langue-centre-agree",
    kind: "langue",
    nature: "institution",
    status: "actif",
    name: "Centre d'examen agréé (British Council, Institut français, centres TOEFL)",
    summary:
      "Délivre l'attestation de niveau exigée par l'université ou le consulat.",
    coverage: ["Douala", "Yaoundé", "capitales régionales CEMAC"],
    steps: [
      {
        label: "Identifier le test exigé par votre programme",
        detail:
          "IELTS ou TOEFL pour l'anglais, TCF ou DELF pour le français, TOPIK pour le coréen, YÖS pour la Turquie. Un test accepté ailleurs peut être refusé ici.",
      },
      {
        label: "Réserver la session trois mois à l'avance",
        detail:
          "Les places partent vite et le résultat met 2 à 4 semaines à être délivré.",
      },
      { label: "Régler les frais d'inscription en ligne ou au centre" },
      {
        label: "Se présenter avec le passeport utilisé à l'inscription",
        detail:
          "Toute autre pièce d'identité est refusée à l'entrée de la salle.",
      },
      {
        label: "Demander l'envoi direct du score à l'université",
        detail:
          "Beaucoup de programmes n'acceptent pas une copie transmise par le candidat.",
      },
    ],
    bring: [
      "Passeport en cours de validité",
      "Confirmation d'inscription imprimée",
      "Justificatif de paiement",
    ],
    leadTime: "2 à 4 semaines entre l'examen et le résultat",
    officialFee: "Frais d'examen fixés par l'organisme certificateur",
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning:
      "Un score de langue a une durée de validité, souvent deux ans. Passer le test trop tôt dans le parcours peut le rendre caduc au dépôt.",
  },
  {
    id: "passeport-dgsn",
    kind: "passeport",
    nature: "institution",
    status: "actif",
    name: "Délégation générale à la Sûreté nationale",
    summary: "Délivre et renouvelle le passeport biométrique.",
    coverage: ["Cameroun"],
    steps: [
      { label: "Effectuer la pré-inscription en ligne et régler les frais" },
      {
        label: "Se présenter pour la prise d'empreintes et de photo",
        detail: "La convocation précise le centre ; on ne choisit pas.",
      },
      { label: "Suivre l'état de la demande avec le récépissé" },
      { label: "Retirer le passeport en personne" },
    ],
    bring: [
      "Acte de naissance sécurisé",
      "Certificat de nationalité",
      "Ancien passeport si renouvellement",
      "Récépissé de paiement",
    ],
    leadTime: "2 à 8 semaines selon la période",
    officialFee: "Tarif officiel affiché",
    serviceFee: null,
    address: null,
    hours: "Horaires administratifs",
    phone: null,
    website: null,
    warning:
      "La plupart des consulats exigent 18 mois de validité restante au moment du dépôt. Renouvelez dès maintenant si vous êtes en dessous.",
  },
  {
    id: "medical-centre-vaccination",
    kind: "medical",
    nature: "institution",
    status: "actif",
    name: "Centre de vaccination international agréé",
    summary:
      "Délivre le carnet de vaccination international et le certificat médical exigés au visa.",
    coverage: ["Douala", "Yaoundé", "capitales régionales"],
    steps: [
      {
        label: "Vérifier les vaccins exigés par la destination",
        detail:
          "Fièvre jaune presque partout ; certains pays ajoutent un dépistage de la tuberculose ou une radiographie pulmonaire.",
      },
      {
        label: "Se faire vacciner au moins dix jours avant le départ",
        detail:
          "Le certificat de fièvre jaune n'entre en vigueur que dix jours après l'injection.",
      },
      { label: "Faire établir le carnet international au nom exact du passeport" },
      {
        label: "Passer la visite médicale si la destination l'impose",
        detail:
          "Afrique du Sud, Émirats et Canada exigent un examen dans un centre désigné par le consulat, pas chez un médecin de votre choix.",
      },
    ],
    bring: ["Passeport", "Carnet de vaccination antérieur si vous en avez un"],
    leadTime: "Le jour même pour la vaccination, 1 à 3 semaines pour un bilan complet",
    officialFee: "Tarif du centre agréé",
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning:
      "Un bilan effectué hors du réseau désigné par le consulat est systématiquement rejeté. Demandez la liste avant de payer.",
  },
  {
    id: "financier-banque",
    kind: "financier",
    nature: "institution",
    status: "actif",
    name: "Banque domiciliataire et notaire",
    summary:
      "Produit la preuve de ressources et l'attestation de prise en charge exigées au visa.",
    coverage: ["Cameroun", "CEMAC"],
    steps: [
      {
        label: "Demander un relevé bancaire des trois à six derniers mois",
        detail:
          "Avec cachet et signature de la banque. Une impression personnelle n'a aucune valeur.",
      },
      {
        label: "Faire établir l'attestation de prise en charge chez un notaire",
        detail:
          "Si un tiers finance vos études, son engagement doit être notarié et accompagné de ses propres justificatifs de revenus.",
      },
      {
        label: "Vérifier le montant minimal exigé par le consulat",
        detail:
          "Il varie fortement : quelques centaines d'euros pour le Maghreb, plusieurs millions de FCFA pour le Canada.",
      },
      {
        label: "Ouvrir le compte bloqué si la destination l'impose",
        detail:
          "L'Allemagne exige un Sperrkonto ; le compte doit être approvisionné avant le rendez-vous consulaire.",
      },
    ],
    bring: [
      "Pièce d'identité",
      "Justificatifs de revenus du garant",
      "Lettre d'admission de l'établissement",
    ],
    leadTime: "1 à 3 semaines",
    officialFee: "Frais bancaires et honoraires notariés",
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning:
      "Un versement massif juste avant le dépôt éveille les soupçons du consulat. Alimentez le compte progressivement, plusieurs mois à l'avance.",
  },
  {
    id: "photo-biometrique",
    kind: "photo",
    nature: "institution",
    status: "actif",
    name: "Photographe agréé pour photos biométriques",
    summary:
      "Produit des photos conformes aux normes du pays de destination.",
    coverage: ["Toutes villes"],
    steps: [
      {
        label: "Vérifier le format exigé par le consulat",
        detail:
          "Les normes diffèrent : 35 × 45 mm pour Schengen, 51 × 51 mm pour les États-Unis, fond blanc ou gris selon les pays.",
      },
      { label: "Faire réaliser les photos dans le mois précédant le dépôt" },
      { label: "Commander au moins huit tirages" },
    ],
    bring: ["Tenue sobre, sans couvre-chef ni lunettes teintées"],
    leadTime: "Immédiat",
    officialFee: "Tarif du photographe",
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning:
      "Une photo au mauvais format fait rejeter le dossier au guichet, après des semaines d'attente. Vérifiez la norme avant, pas après.",
  },

  // ------------------------------------------------------------------
  // Partenaires commerciaux Travis
  //
  // Coordonnées et tarifs à renseigner depuis le contrat, puis passer
  // `status` à "actif". Tant que ce n'est pas fait, l'interface annonce le
  // service sans afficher d'adresse ni de prix inventés.
  // ------------------------------------------------------------------
  {
    id: "partenaire-traduction",
    kind: "traduction",
    nature: "partner",
    status: "a_confirmer",
    name: "Partenaire traduction assermentée",
    summary:
      "Prise en charge du lot complet de traductions, avec retrait et livraison, sans déplacement au greffe.",
    coverage: [],
    steps: [
      { label: "Transmettre les pièces légalisées, sur place ou par voie numérique" },
      { label: "Valider le devis et le délai annoncés" },
      { label: "Récupérer le lot traduit, paraphé et cacheté" },
    ],
    bring: ["Pièces légalisées", "Copie du passeport pour l'orthographe des noms"],
    leadTime: "À confirmer au contrat",
    officialFee: null,
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning: null,
  },
  {
    id: "partenaire-legalisation",
    kind: "legalisation",
    nature: "partner",
    status: "a_confirmer",
    name: "Partenaire certification et légalisation",
    summary:
      "Dépôt et retrait des pièces auprès de l'administration, pour les candidats hors de la ville du guichet.",
    coverage: [],
    steps: [
      { label: "Confier les originaux et le mandat de représentation" },
      { label: "Suivre l'avancement du dossier" },
      { label: "Récupérer les pièces certifiées" },
    ],
    bring: ["Originaux", "Procuration signée", "Copie de la pièce d'identité"],
    leadTime: "À confirmer au contrat",
    officialFee: null,
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning: null,
  },
  {
    id: "partenaire-immigration",
    kind: "visa",
    nature: "partner",
    status: "a_confirmer",
    name: "Partenaire accompagnement consulaire",
    summary:
      "Relecture du dossier visa, préparation à l'entretien et suivi jusqu'à la décision.",
    coverage: [],
    steps: [
      { label: "Audit du dossier avant dépôt" },
      { label: "Préparation à l'entretien consulaire" },
      { label: "Suivi de la décision et gestion d'un éventuel recours" },
    ],
    bring: ["Dossier complet", "Lettre d'admission", "Justificatifs financiers"],
    leadTime: "À confirmer au contrat",
    officialFee: null,
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning: null,
  },
  {
    id: "partenaire-langue",
    kind: "langue",
    nature: "partner",
    status: "a_confirmer",
    name: "Partenaire préparation linguistique",
    summary:
      "Préparation intensive à l'IELTS, au TOEFL ou au TCF, avec inscription à la session comprise.",
    coverage: [],
    steps: [
      { label: "Test de positionnement" },
      { label: "Cycle de préparation" },
      { label: "Inscription à la session d'examen" },
    ],
    bring: ["Pièce d'identité"],
    leadTime: "À confirmer au contrat",
    officialFee: null,
    serviceFee: null,
    address: null,
    hours: null,
    phone: null,
    website: null,
    warning: null,
  },
];

/** Services d'une catégorie donnée, partenaires actifs en tête. */
export function servicesOfKind(kind: ServiceKind): ServiceProvider[] {
  return SERVICES.filter((s) => s.kind === kind).sort((a, b) => {
    if (a.status !== b.status) return a.status === "actif" ? -1 : 1;
    return a.nature === "institution" ? -1 : 1;
  });
}

export function serviceById(id: string): ServiceProvider | null {
  return SERVICES.find((s) => s.id === id) ?? null;
}

export const ACTIVE_PARTNERS = SERVICES.filter(
  (s) => s.nature === "partner" && s.status === "actif",
);
