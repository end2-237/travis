/**
 * Numéros Mobile Money d'Afrique centrale et de l'Ouest.
 *
 * Un candidat saisit son numéro comme il l'écrit : « 699 00 11 22 »,
 * « +237 6 99 00 11 22 », « 00237699001122 ». Les trois désignent la même
 * ligne, et les trois doivent passer. L'ancienne expression régulière
 * n'acceptait qu'un seul séparateur — elle refusait donc le format que le
 * message d'erreur donnait lui-même en exemple, à la première étape du
 * tunnel.
 *
 * On normalise une fois, à l'entrée, et tout le reste de l'application
 * travaille sur la forme canonique : indicatif + numéro national, sans
 * espace. C'est aussi ce qu'attendent les agrégateurs Mobile Money.
 */

/** Indicatifs de la zone couverte, du plus long au plus court. */
const COUNTRY_CODES = [
  "237", // Cameroun
  "236", // Centrafrique
  "235", // Tchad
  "241", // Gabon
  "242", // Congo
  "240", // Guinée équatoriale
  "225", // Côte d'Ivoire
  "221", // Sénégal
  "226", // Burkina Faso
  "223", // Mali
  "229", // Bénin
  "228", // Togo
  "227", // Niger
  "224", // Guinée
  "233", // Ghana
  "234", // Nigeria
] as const;

/** Indicatif appliqué à un numéro national sans préfixe. */
const DEFAULT_COUNTRY_CODE = "237";

/**
 * Longueur du numéro national au Cameroun : 9 chiffres depuis la réforme de
 * 2015 (6xxxxxxxx pour le mobile, 2xxxxxxxx pour le fixe).
 */
const CMR_NATIONAL_LENGTH = 9;

export interface NormalizedPhone {
  /** Forme canonique lisible : « +237699001122 ». */
  e164: string;
  /** Sans le plus — la forme attendue par les agrégateurs Mobile Money. */
  msisdn: string;
  /** Indicatif pays isolé, sans le plus. */
  countryCode: string;
}

/**
 * Ramène une saisie libre à la forme canonique.
 * Retourne `null` si le numéro ne peut pas être un numéro joignable.
 */
export function normalizePhone(raw: string): NormalizedPhone | null {
  if (typeof raw !== "string") return null;

  // On garde les chiffres et un éventuel plus de tête : espaces, points,
  // tirets, parenthèses et lettres ne portent aucune information.
  const trimmed = raw.trim();
  const hadPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");

  if (digits.length === 0) return null;

  // « 00237… » est la forme internationale composée depuis un poste fixe.
  const hadInternationalPrefix = hadPlus || digits.startsWith("00");
  if (!hadPlus && digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Numéro national camerounais : 9 chiffres commençant par 6 (mobile) ou
  // 2 (fixe). On ne l'infère que dans ce cas précis — préfixer d'office
  // n'importe quelle suite de chiffres fabriquerait des numéros faux.
  if (
    !hadInternationalPrefix &&
    digits.length === CMR_NATIONAL_LENGTH &&
    /^[62]/.test(digits)
  ) {
    digits = DEFAULT_COUNTRY_CODE + digits;
  }

  const countryCode = COUNTRY_CODES.find((code) => digits.startsWith(code));

  if (!countryCode) {
    // Sans indicatif reconnu ET sans préfixe international explicite, il
    // s'agit presque toujours d'un numéro local mal recopié — « 69900112 »,
    // un mobile camerounais amputé d'un chiffre. L'accepter comme numéro
    // international fabriquerait une ligne qui n'existe pas, et le candidat
    // ne l'apprendrait qu'au moment du débit.
    if (!hadInternationalPrefix) return null;

    // Aucun indicatif pays ne commence par zéro (E.164).
    if (digits.startsWith("0")) return null;
    if (digits.length < 8 || digits.length > 15) return null;

    return {
      e164: `+${digits}`,
      msisdn: digits,
      countryCode: digits.slice(0, 3),
    };
  }

  const national = digits.slice(countryCode.length);
  if (national.length < 6 || national.length > 12) return null;

  // Un numéro camerounais mal recopié se repère : ni 6 ni 2 en tête, ou une
  // longueur qui ne correspond à rien. Autant le dire tout de suite, plutôt
  // que de laisser l'opérateur refuser le débit trois écrans plus loin.
  if (countryCode === DEFAULT_COUNTRY_CODE) {
    if (national.length !== CMR_NATIONAL_LENGTH) return null;
    if (!/^[62]/.test(national)) return null;
  }

  return {
    e164: `+${countryCode}${national}`,
    msisdn: `${countryCode}${national}`,
    countryCode,
  };
}

/** Vrai si la saisie désigne un numéro joignable. */
export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

/**
 * Mise en forme lisible d'un numéro canonique, pour l'affichage.
 * « +237699001122 » → « +237 6 99 00 11 22 »
 */
export function formatPhone(raw: string): string {
  const parsed = normalizePhone(raw);
  if (!parsed) return raw;

  const national = parsed.msisdn.slice(parsed.countryCode.length);
  if (parsed.countryCode !== DEFAULT_COUNTRY_CODE) {
    return `+${parsed.countryCode} ${national}`;
  }

  // 6 99 00 11 22 — le découpage usuel au Cameroun.
  const groups = [national.slice(0, 1), ...(national.slice(1).match(/.{1,2}/g) ?? [])];
  return `+${parsed.countryCode} ${groups.join(" ")}`;
}
