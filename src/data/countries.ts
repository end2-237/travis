/**
 * Profils pays — faits partagés par tous les programmes d'une même destination
 * (visa, logement, coût de la vie, rentrées). Énoncés une seule fois pour
 * rester cohérents d'une fiche à l'autre.
 *
 * Les montants sont des ordres de grandeur en FCFA, convertis au taux moyen
 * observé sur l'année. Ils servent à dimensionner un budget, pas à engager.
 */

export interface CountryProfile {
  /** Coût de la vie mensuel hors logement, en FCFA. */
  livingCostXaf: number;
  /** Logement étudiant mensuel, en FCFA. */
  housingCostXaf: number;
  /** Nature du logement généralement accessible. */
  housing: string;
  /** Démarche consulaire depuis l'Afrique centrale. */
  visa: string;
  /** Délai d'obtention du visa, une fois l'admission reçue. */
  visaLeadTime: string;
  /** Mois de rentrée universitaire. */
  intake: string[];
  /** Droit au travail étudiant. */
  work: string;
  /** Monnaie locale. */
  currency: string;
}

export const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  Turquie: {
    livingCostXaf: 160_000,
    housingCostXaf: 75_000,
    housing:
      "Résidences d'État KYK réservées aux boursiers, chambre partagée à 2 ou 4. Les non-boursiers louent en colocation privée.",
    visa: "Visa étudiant déposé au consulat de Turquie, après réception de la lettre d'acceptation (Kabul Mektubu).",
    visaLeadTime: "3 à 6 semaines",
    intake: ["Septembre"],
    work: "Travail autorisé après la première année, temps partiel.",
    currency: "Livre turque (TRY)",
  },
  Japon: {
    livingCostXaf: 420_000,
    housingCostXaf: 190_000,
    housing:
      "Résidence universitaire prioritaire pour les boursiers MEXT la première année, puis logement privé avec garant.",
    visa: "Certificat d'éligibilité (COE) délivré par l'université, puis visa au consulat du Japon.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Avril", "Octobre"],
    work: "28 h par semaine maximum avec autorisation hors-statut.",
    currency: "Yen (JPY)",
  },
  Italie: {
    livingCostXaf: 390_000,
    housingCostXaf: 230_000,
    housing:
      "Résidences DSU attribuées sur critères de revenus, sinon colocation privée — tendue à Rome et Milan.",
    visa: "Visa type D via Universitaly, pré-inscription obligatoire avant le dépôt consulaire.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Septembre", "Février"],
    work: "20 h par semaine autorisées.",
    currency: "Euro (EUR)",
  },
  Maroc: {
    livingCostXaf: 145_000,
    housingCostXaf: 60_000,
    housing:
      "Cités universitaires de l'ONOUSC pour les boursiers AMCI, chambre double. Locations privées abordables hors centre-ville.",
    visa: "Exemption de visa pour plusieurs nationalités CEMAC ; carte de séjour étudiant à demander sur place.",
    visaLeadTime: "2 à 4 semaines",
    intake: ["Septembre"],
    work: "Non autorisé pendant les études.",
    currency: "Dirham (MAD)",
  },
  Allemagne: {
    livingCostXaf: 430_000,
    housingCostXaf: 250_000,
    housing:
      "Studentenwerk sur liste d'attente longue, souvent 6 mois. Prévoir une solution de repli les premières semaines.",
    visa: "Visa étudiant avec compte bloqué (Sperrkonto) obligatoire, sauf boursier officiel.",
    visaLeadTime: "8 à 12 semaines",
    intake: ["Octobre", "Avril"],
    work: "120 jours pleins ou 240 demi-journées par an.",
    currency: "Euro (EUR)",
  },
  France: {
    livingCostXaf: 420_000,
    housingCostXaf: 260_000,
    housing:
      "Résidences CROUS prioritaires pour les boursiers du gouvernement français, sinon marché privé avec garant.",
    visa: "Procédure Études en France (Campus France) obligatoire avant le dépôt consulaire.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre"],
    work: "964 h par an, soit environ 60 % d'un temps plein.",
    currency: "Euro (EUR)",
  },
  Chine: {
    livingCostXaf: 230_000,
    housingCostXaf: 90_000,
    housing:
      "Campus fermé avec résidence incluse pour les boursiers CSC, chambre double standard.",
    visa: "Visa X1 sur présentation du JW201 et de la lettre d'admission.",
    visaLeadTime: "4 à 6 semaines",
    intake: ["Septembre"],
    work: "Autorisé uniquement avec accord de l'université et des autorités.",
    currency: "Yuan (CNY)",
  },
  "Corée du Sud": {
    livingCostXaf: 390_000,
    housingCostXaf: 170_000,
    housing:
      "Dortoir universitaire garanti la première année aux boursiers GKS, puis studios en ville.",
    visa: "Visa D-2 après délivrance du Certificate of Admission.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Mars", "Septembre"],
    work: "20 h par semaine après six mois de présence.",
    currency: "Won (KRW)",
  },
  Hongrie: {
    livingCostXaf: 250_000,
    housingCostXaf: 120_000,
    housing:
      "Résidence universitaire incluse dans la bourse Stipendium, ou allocation logement mensuelle si places épuisées.",
    visa: "Permis de séjour à but d'études, déposé au consulat de Hongrie compétent.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre"],
    work: "30 h par semaine autorisées.",
    currency: "Forint (HUF)",
  },
  Roumanie: {
    livingCostXaf: 210_000,
    housingCostXaf: 95_000,
    housing:
      "Campus universitaire d'État, chambre à 2 ou 3, incluse pour les boursiers du gouvernement.",
    visa: "Visa D/SD sur présentation de la lettre d'acceptation du ministère de l'Éducation.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Octobre"],
    work: "Autorisé à temps partiel.",
    currency: "Leu (RON)",
  },
  Pologne: {
    livingCostXaf: 260_000,
    housingCostXaf: 130_000,
    housing:
      "Dom studencki (résidence universitaire) à tarif encadré, demande à déposer avec l'inscription.",
    visa: "Visa national D, dossier consulaire complet exigé dès la pré-admission.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Octobre"],
    work: "Libre pour les étudiants à temps plein.",
    currency: "Zloty (PLN)",
  },
  Rwanda: {
    livingCostXaf: 130_000,
    housingCostXaf: 65_000,
    housing:
      "Campus résidentiel intégré, hébergement et restauration inclus dans les programmes Mastercard Foundation.",
    visa: "Entrée sans visa préalable pour les ressortissants africains, permis étudiant régularisé sur place.",
    visaLeadTime: "1 à 3 semaines",
    intake: ["Septembre", "Janvier"],
    work: "Stages et emplois campus encouragés.",
    currency: "Franc rwandais (RWF)",
  },
  Ghana: {
    livingCostXaf: 140_000,
    housingCostXaf: 70_000,
    housing: "Résidence sur campus incluse dans les bourses intégrales.",
    visa: "Visa étudiant CEDEAO simplifié, dépôt à l'ambassade du Ghana.",
    visaLeadTime: "2 à 4 semaines",
    intake: ["Août"],
    work: "Stages encadrés intégrés au cursus.",
    currency: "Cedi (GHS)",
  },
  Kenya: {
    livingCostXaf: 150_000,
    housingCostXaf: 75_000,
    housing:
      "Halls of residence universitaires, places limitées ; marché locatif accessible autour des campus.",
    visa: "Student pass demandé par l'université auprès du Department of Immigration.",
    visaLeadTime: "3 à 6 semaines",
    intake: ["Septembre", "Janvier"],
    work: "Autorisé avec le student pass.",
    currency: "Shilling kényan (KES)",
  },
  "Afrique du Sud": {
    livingCostXaf: 230_000,
    housingCostXaf: 120_000,
    housing:
      "Résidences universitaires sécurisées, attribution sur dossier ; le privé est plus cher à Johannesburg.",
    visa: "Study visa avec certificat médical, radiographie et couverture santé sud-africaine obligatoires.",
    visaLeadTime: "8 à 12 semaines",
    intake: ["Février", "Juillet"],
    work: "20 h par semaine autorisées.",
    currency: "Rand (ZAR)",
  },
  Canada: {
    livingCostXaf: 520_000,
    housingCostXaf: 330_000,
    housing:
      "Résidences universitaires limitées aux primo-arrivants, puis colocation — marché très tendu.",
    visa: "Permis d'études fédéral + CAQ pour le Québec, preuve de fonds obligatoire.",
    visaLeadTime: "10 à 16 semaines",
    intake: ["Septembre", "Janvier"],
    work: "24 h par semaine hors campus pendant les sessions.",
    currency: "Dollar canadien (CAD)",
  },
  "Royaume-Uni": {
    livingCostXaf: 620_000,
    housingCostXaf: 380_000,
    housing:
      "Halls universitaires la première année, puis colocation privée ; Londres double la facture.",
    visa: "Student route visa avec CAS de l'université et surcharge santé IHS.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Septembre", "Janvier"],
    work: "20 h par semaine pendant les périodes de cours.",
    currency: "Livre sterling (GBP)",
  },
  Belgique: {
    livingCostXaf: 400_000,
    housingCostXaf: 240_000,
    housing: "Kots étudiants et résidences universitaires, à réserver dès l'admission.",
    visa: "Visa D avec attestation de prise en charge (annexe 32) ou preuve de bourse.",
    visaLeadTime: "8 à 12 semaines",
    intake: ["Septembre"],
    work: "20 h par semaine autorisées.",
    currency: "Euro (EUR)",
  },
  "Pays-Bas": {
    livingCostXaf: 470_000,
    housingCostXaf: 300_000,
    housing:
      "Logement étudiant très tendu : commencer la recherche dès la pré-admission, avant même le visa.",
    visa: "Procédure MVV/VVR portée par l'université, pas de dépôt individuel.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Février"],
    work: "16 h par semaine avec permis de travail.",
    currency: "Euro (EUR)",
  },
  Suède: {
    livingCostXaf: 540_000,
    housingCostXaf: 300_000,
    housing:
      "Logement garanti par certaines universités aux boursiers ; sinon files d'attente municipales longues.",
    visa: "Permis de séjour étudiant demandé en ligne auprès du Migrationsverket.",
    visaLeadTime: "8 à 14 semaines",
    intake: ["Août", "Janvier"],
    work: "Pas de plafond horaire légal.",
    currency: "Couronne suédoise (SEK)",
  },
  Chypre: {
    livingCostXaf: 260_000,
    housingCostXaf: 140_000,
    housing: "Dortoirs universitaires privés sur campus, formule pension incluse fréquente.",
    visa: "Permis d'entrée délivré par le ministère de l'Intérieur avant le départ.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Février"],
    work: "20 h par semaine après six mois.",
    currency: "Euro (EUR)",
  },
  Inde: {
    livingCostXaf: 130_000,
    housingCostXaf: 70_000,
    housing: "Hostels sur campus, pension complète courante et peu coûteuse.",
    visa: "Visa étudiant sur présentation de la lettre d'admission et du justificatif de fonds.",
    visaLeadTime: "3 à 6 semaines",
    intake: ["Juillet", "Janvier"],
    work: "Non autorisé hors stages du cursus.",
    currency: "Roupie (INR)",
  },
  Malaisie: {
    livingCostXaf: 210_000,
    housingCostXaf: 110_000,
    housing: "Résidences sur campus modernes, colocations abordables à Kuala Lumpur.",
    visa: "Student pass via EMGS, démarche portée par l'université.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Février"],
    work: "20 h par semaine pendant les vacances.",
    currency: "Ringgit (MYR)",
  },
  Égypte: {
    livingCostXaf: 120_000,
    housingCostXaf: 55_000,
    housing: "Cités universitaires du Caire et d'Alexandrie, hébergement inclus pour les boursiers.",
    visa: "Visa étudiant délivré après acceptation par le ministère de l'Enseignement supérieur.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Septembre"],
    work: "Non autorisé.",
    currency: "Livre égyptienne (EGP)",
  },
  Tunisie: {
    livingCostXaf: 130_000,
    housingCostXaf: 55_000,
    housing: "Foyers universitaires publics, tarif très encadré pour les étudiants étrangers.",
    visa: "Visa étudiant puis carte de séjour, dossier via l'ambassade de Tunisie.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Septembre"],
    work: "Non autorisé pendant les études.",
    currency: "Dinar tunisien (TND)",
  },
  Sénégal: {
    livingCostXaf: 120_000,
    housingCostXaf: 60_000,
    housing: "Campus social de l'UCAD, places limitées ; locations abordables à Dakar en colocation.",
    visa: "Libre circulation CEDEAO, carte d'étudiant étranger à régulariser sur place.",
    visaLeadTime: "1 à 2 semaines",
    intake: ["Octobre"],
    work: "Autorisé.",
    currency: "Franc CFA (XOF)",
  },
  "Burkina Faso": {
    livingCostXaf: 110_000,
    housingCostXaf: 50_000,
    housing: "Résidence 2iE sur campus, restauration incluse dans les formules pension.",
    visa: "Libre circulation CEDEAO pour les ressortissants concernés.",
    visaLeadTime: "1 à 2 semaines",
    intake: ["Octobre"],
    work: "Autorisé.",
    currency: "Franc CFA (XOF)",
  },
  "Émirats Arabes Unis": {
    livingCostXaf: 480_000,
    housingCostXaf: 290_000,
    housing: "Résidences sur campus à Abu Dhabi et Dubaï, standing élevé et tarifs en conséquence.",
    visa: "Résidence étudiante parrainée par l'université, examen médical obligatoire.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Septembre", "Janvier"],
    work: "Autorisé avec accord du sponsor universitaire.",
    currency: "Dirham (AED)",
  },
  "Multi-pays": {
    livingCostXaf: 380_000,
    housingCostXaf: 220_000,
    housing:
      "Variable selon le pays d'affectation du consortium — vérifier la fiche du campus retenu.",
    visa: "Procédure propre au pays d'accueil désigné après sélection.",
    visaLeadTime: "6 à 12 semaines",
    intake: ["Septembre"],
    work: "Selon la réglementation du pays d'accueil.",
    currency: "Variable",
  },
  Tchéquie: {
    livingCostXaf: 230_000,
    housingCostXaf: 130_000,
    housing:
      "Résidences universitaires publiques très abordables, attribuées en priorité aux boursiers d'État. Le privé reste accessible à Brno et Ostrava, nettement moins à Prague.",
    visa: "Visa long séjour étudiant déposé à l'ambassade de Tchéquie, après la lettre d'admission. Preuve de ressources et assurance santé exigées au dépôt.",
    visaLeadTime: "8 à 12 semaines",
    intake: ["Septembre"],
    work: "Travail autorisé sans permis distinct pour les étudiants inscrits à temps plein.",
    currency: "Couronne tchèque (CZK)",
  },
  Suisse: {
    livingCostXaf: 750_000,
    housingCostXaf: 450_000,
    housing:
      "Logement rare et cher. Les résidences universitaires ont des listes d'attente longues ; la colocation est la norme.",
    visa: "Visa D étudiant déposé à l'ambassade de Suisse, avec preuve de moyens financiers pour toute l'année.",
    visaLeadTime: "8 à 12 semaines",
    intake: ["Septembre", "Février"],
    work: "15 heures par semaine maximum, et seulement après six mois de séjour.",
    currency: "Franc suisse (CHF)",
  },
  Autriche: {
    livingCostXaf: 420_000,
    housingCostXaf: 230_000,
    housing:
      "Résidences étudiantes gérées par des fondations, à réserver très tôt. Vienne est la ville la plus tendue.",
    visa: "Visa D puis titre de séjour étudiant. Le dossier exige un justificatif de ressources mensuelles et une assurance.",
    visaLeadTime: "10 à 14 semaines",
    intake: ["Octobre", "Mars"],
    work: "20 heures par semaine autorisées pour les étudiants non européens.",
    currency: "Euro (EUR)",
  },
  Irlande: {
    livingCostXaf: 520_000,
    housingCostXaf: 350_000,
    housing:
      "Crise du logement réelle à Dublin : commencez la recherche avant même l'obtention du visa, et regardez Cork, Galway ou Limerick.",
    visa: "Visa étudiant irlandais déposé en ligne, puis enregistrement à l'immigration à l'arrivée. Preuve de 10 000 € de ressources exigée.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Janvier"],
    work: "20 heures par semaine pendant les cours, 40 pendant les vacances.",
    currency: "Euro (EUR)",
  },
  Espagne: {
    livingCostXaf: 330_000,
    housingCostXaf: 200_000,
    housing:
      "Colocation généralisée dans les villes universitaires. Les résidences privées sont chères, les publiques peu nombreuses.",
    visa: "Visa étudiant déposé au consulat d'Espagne, avec certificat médical et casier judiciaire pour les séjours de plus de six mois.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Février"],
    work: "30 heures par semaine autorisées depuis la réforme du règlement des étrangers.",
    currency: "Euro (EUR)",
  },
  Lettonie: {
    livingCostXaf: 230_000,
    housingCostXaf: 120_000,
    housing:
      "Résidences universitaires bon marché à Riga, chambres partagées. Le privé reste abordable comparé à l'Europe de l'Ouest.",
    visa: "Visa D puis permis de séjour temporaire, déposé auprès de la représentation lettone compétente.",
    visaLeadTime: "8 à 12 semaines",
    intake: ["Septembre", "Février"],
    work: "20 heures par semaine autorisées pendant les études.",
    currency: "Euro (EUR)",
  },
  Russie: {
    livingCostXaf: 200_000,
    housingCostXaf: 70_000,
    housing:
      "Résidence universitaire quasi systématique pour les boursiers du quota, chambre partagée à 2 ou 3.",
    visa: "Visa étudiant délivré sur invitation officielle du ministère, puis enregistrement obligatoire dans les sept jours suivant l'arrivée.",
    visaLeadTime: "4 à 8 semaines après réception de l'invitation",
    intake: ["Septembre"],
    work: "Travail autorisé avec un permis distinct, en pratique difficile à obtenir la première année.",
    currency: "Rouble (RUB)",
  },
  Singapour: {
    livingCostXaf: 520_000,
    housingCostXaf: 330_000,
    housing:
      "Résidences de campus pour les doctorants, sinon colocation en HDB. Le marché est cher mais bien organisé.",
    visa: "Student's Pass demandé par l'université via le portail SOLAR, avant l'arrivée.",
    visaLeadTime: "4 à 6 semaines",
    intake: ["Août", "Janvier"],
    work: "16 heures par semaine pendant les cours, pour les étudiants des établissements agréés.",
    currency: "Dollar de Singapour (SGD)",
  },
  Brunei: {
    livingCostXaf: 220_000,
    housingCostXaf: 0,
    housing:
      "Logement universitaire fourni aux boursiers du gouvernement, repas compris dans la plupart des cas.",
    visa: "Visa étudiant obtenu par l'université après l'octroi de la bourse.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Août"],
    work: "Travail non autorisé pour les boursiers du gouvernement.",
    currency: "Dollar de Brunei (BND)",
  },
  Taïwan: {
    livingCostXaf: 260_000,
    housingCostXaf: 90_000,
    housing:
      "Dortoirs universitaires largement disponibles et peu coûteux, souvent réservés aux boursiers internationaux.",
    visa: "Visa résident déposé au bureau de représentation de Taipei compétent, puis carte de résidence à l'arrivée.",
    visaLeadTime: "4 à 8 semaines",
    intake: ["Septembre", "Février"],
    work: "16 heures par semaine avec un permis de travail, sauf clause contraire de la bourse.",
    currency: "Dollar de Taïwan (TWD)",
  },
  "Hong Kong": {
    livingCostXaf: 450_000,
    housingCostXaf: 400_000,
    housing:
      "Le poste le plus lourd du budget. Les logements de campus sont limités et attribués par ancienneté ; le marché privé est l'un des plus chers au monde.",
    visa: "Visa étudiant parrainé par l'université, déposé auprès du département de l'immigration.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Janvier"],
    work: "Stages et travail sur le campus autorisés sous conditions, 20 heures par semaine.",
    currency: "Dollar de Hong Kong (HKD)",
  },
  Indonésie: {
    livingCostXaf: 170_000,
    housingCostXaf: 70_000,
    housing:
      "Logement étudiant local (kos) très abordable, souvent à proximité immédiate du campus.",
    visa: "Visa étudiant délivré sur lettre de parrainage de l'université et approbation du ministère.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre"],
    work: "Travail non autorisé avec un visa étudiant.",
    currency: "Roupie indonésienne (IDR)",
  },
  "Arabie saoudite": {
    livingCostXaf: 300_000,
    housingCostXaf: 0,
    housing:
      "Logement fourni sur le campus pour les boursiers, meublé et desservi par des navettes.",
    visa: "Visa d'études parrainé par l'université, avec examen médical préalable obligatoire.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Septembre", "Janvier"],
    work: "Travail limité au campus, sous condition d'accord de l'université.",
    currency: "Riyal saoudien (SAR)",
  },
  Qatar: {
    livingCostXaf: 400_000,
    housingCostXaf: 0,
    housing:
      "Logement en résidence fourni aux boursiers complets dans la cité de l'éducation de Doha.",
    visa: "Visa de résidence étudiante parrainé par l'université, avec examen médical à l'arrivée.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Août", "Janvier"],
    work: "Travail sur le campus autorisé avec l'accord du parrain.",
    currency: "Riyal qatari (QAR)",
  },
  Brésil: {
    livingCostXaf: 260_000,
    housingCostXaf: 120_000,
    housing:
      "Résidences universitaires publiques réservées en priorité aux étudiants à faibles revenus ; sinon colocation (república).",
    visa: "Visa temporaire IV pour études, déposé au consulat du Brésil avec la lettre d'acceptation PEC-G.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Mars", "Août"],
    work: "Travail interdit aux étudiants du programme PEC-G, qui doivent prouver leurs ressources.",
    currency: "Real brésilien (BRL)",
  },
  Australie: {
    livingCostXaf: 620_000,
    housingCostXaf: 400_000,
    housing:
      "Colocation ou résidence privée. Sydney et Melbourne sont nettement plus chères qu'Adélaïde ou Brisbane.",
    visa: "Visa étudiant sous-classe 500, avec assurance santé OSHC obligatoire pour toute la durée du séjour.",
    visaLeadTime: "6 à 12 semaines",
    intake: ["Février", "Juillet"],
    work: "48 heures par quinzaine pendant les cours, sans limite pendant les vacances.",
    currency: "Dollar australien (AUD)",
  },
  "Nouvelle-Zélande": {
    livingCostXaf: 540_000,
    housingCostXaf: 340_000,
    housing:
      "Résidences universitaires la première année, puis colocation (flatting), qui est la norme locale.",
    visa: "Visa étudiant délivré en ligne, avec assurance santé et preuve de ressources exigées.",
    visaLeadTime: "6 à 10 semaines",
    intake: ["Février", "Juillet"],
    work: "20 heures par semaine pendant les cours, temps plein pendant les vacances.",
    currency: "Dollar néo-zélandais (NZD)",
  },
};

export const DEFAULT_COUNTRY_PROFILE: CountryProfile = {
  livingCostXaf: 300_000,
  housingCostXaf: 160_000,
  housing: "Logement étudiant à confirmer auprès de l'établissement.",
  visa: "Procédure consulaire à confirmer auprès de la représentation diplomatique compétente.",
  visaLeadTime: "6 à 10 semaines",
  intake: ["Septembre"],
  work: "Réglementation à vérifier localement.",
  currency: "Variable",
};

export function countryProfile(country: string): CountryProfile {
  return COUNTRY_PROFILES[country] ?? DEFAULT_COUNTRY_PROFILE;
}
