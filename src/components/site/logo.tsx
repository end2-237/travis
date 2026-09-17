import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Identité visuelle de Travis.
 *
 * L'œuvre est celle fournie par la marque, détourée du fond blanc du fichier
 * d'origine et déclinée en quatre fichiers (`public/brand/`). Elle n'est pas
 * redessinée : une reconstitution approchée d'un logo, c'est un autre logo.
 * Le fichier source reste versionné à côté, pour qu'on puisse toujours
 * régénérer les déclinaisons.
 *
 * Deux encres :
 *   « couleur » — le dégradé d'origine, sur fond clair ;
 *   « blanc »   — la même œuvre recolorée, sur fond sombre, où le bleu
 *                 profond de la toque se perdrait.
 */

/** Couleurs relevées sur le logo, reprises dans les jetons Tailwind. */
export const BRAND = {
  deep: "#1b3fa0",
  mid: "#2f7fd4",
  light: "#3aa9e8",
} as const;

type Encre = "couleur" | "blanc";

const HAUTEURS = {
  sm: 22,
  md: 26,
  lg: 34,
} as const;

/**
 * Le bloc complet : marque et nom, tels que dessinés.
 *
 * Le rapport d'aspect vient du fichier ; on ne fixe que la hauteur, pour
 * qu'aucune mise en page ne puisse l'écraser.
 */
export function Logo({
  className,
  encre = "couleur",
  size = "md",
  priority = false,
}: {
  className?: string;
  encre?: Encre;
  size?: keyof typeof HAUTEURS;
  priority?: boolean;
}) {
  const hauteur = HAUTEURS[size];

  return (
    <Image
      src={
        encre === "blanc"
          ? "/brand/travis-logo-blanc.png"
          : "/brand/travis-logo.png"
      }
      alt="Travis"
      width={Math.round(hauteur * 4.53)}
      height={hauteur}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height: hauteur }}
    />
  );
}

/**
 * La marque seule, carrée — pastille de navigation, avatar, puce.
 * Elle reste lisible jusqu'à 16 px : c'est la pointe pleine de la flèche
 * qui survit en dernier.
 */
export function LogoMark({
  className,
  encre = "couleur",
  size = 32,
  priority = false,
}: {
  className?: string;
  encre?: Encre;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={
        encre === "blanc"
          ? "/brand/travis-marque-blanc.png"
          : "/brand/travis-marque.png"
      }
      alt="Travis"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
