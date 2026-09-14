import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 1500000 -> « 1 500 000 FCFA ».
 * Intl `fr-FR` sépare les milliers par une espace fine insécable (U+202F),
 * absente des polices Helvetica embarquées par le moteur PDF. On la
 * normalise en espace simple pour que l'écran et le rapport concordent.
 */
export function formatXaf(amount: number): string {
  const grouped = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/[\u202f\u00a0]/g, " ");

  return `${grouped} FCFA`;
}

/** 12.5 -> « 12,50 /20 » */
export function formatGpa(score: number): string {
  return `${score.toFixed(2).replace(".", ",")} /20`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
