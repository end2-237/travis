/**
 * Les polices Helvetica embarquées par le moteur PDF n'exposent que le jeu
 * WinAnsi : tout glyphe hors de ce jeu s'imprime en caractère parasite.
 * Le catalogue contient des noms turcs, polonais ou hongrois — on translittère
 * ces caractères vers leur équivalent latin le plus proche avant rendu.
 */
const SUBSTITUTIONS: Record<string, string> = {
  "ı": "i", "İ": "I",
  "ğ": "g", "Ğ": "G",
  "ş": "s", "Ş": "S",
  "ę": "e", "Ę": "E",
  "ą": "a", "Ą": "A",
  "ć": "c", "Ć": "C",
  "ł": "l", "Ł": "L",
  "ń": "n", "Ń": "N",
  "ś": "s", "Ś": "S",
  "ź": "z", "Ź": "Z",
  "ż": "z", "Ż": "Z",
  "ő": "ö", "Ő": "Ö",
  "ű": "ü", "Ű": "Ü",
  "ř": "r", "Ř": "R",
  "č": "c", "Č": "C",
  "š": "s", "Š": "S",
  "ž": "z", "Ž": "Z",
  "ě": "e", "Ě": "E",
  "ū": "u", "Ū": "U",
  "ā": "a", "Ā": "A",
  "ī": "i", "Ī": "I",
  " ": " ", // espace fine insécable
  " ": " ",
  "‑": "-", // trait d'union insécable
};

const PATTERN = new RegExp(`[${Object.keys(SUBSTITUTIONS).join("")}]`, "g");

export function pdfText(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(PATTERN, (char) => SUBSTITUTIONS[char] ?? char);
}
