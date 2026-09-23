import { cn } from "@/lib/utils";

/** Familles de motifs disponibles — voir le bloc « Afritude » de `globals.css`. */
export type MotifNom =
  | "semis"
  | "dedale"
  | "adinkra"
  | "adinkra-clair"
  | "kuba"
  | "bogolan";

/** Dégradés de disparition, pour qu'une tuile ne s'arrête jamais net. */
export type MotifFondu = "aucun" | "bas" | "haut" | "radial" | "bords";

const MASQUES: Record<MotifFondu, string | undefined> = {
  aucun: undefined,
  bas: "linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)",
  haut: "linear-gradient(to top, #000 0%, #000 45%, transparent 100%)",
  radial: "radial-gradient(70% 70% at 50% 40%, #000 0%, transparent 100%)",
  bords:
    "radial-gradient(120% 120% at 50% 50%, #000 40%, transparent 100%)",
};

/**
 * Couche décorative de motif.
 *
 * Elle est posée derrière le contenu, jamais dessus : le texte garde son
 * contraste mesuré, et un motif un peu trop appuyé ne peut pas rendre un
 * prix ou une échéance illisibles. Elle est `aria-hidden` et ne capte pas le
 * pointeur — pour un lecteur d'écran comme pour la souris, elle n'existe pas.
 *
 * Le parent doit être positionné (`relative`).
 */
export function Motif({
  nom,
  opacite = 0.12,
  fondu = "aucun",
  className,
}: {
  nom: MotifNom;
  /** 0 à 1. Au-delà de 0,2 sur un fond clair, le motif commence à se lire. */
  opacite?: number;
  fondu?: MotifFondu;
  className?: string;
}) {
  const masque = MASQUES[fondu];

  return (
    <div
      aria-hidden
      className={cn("motif", `motif-${nom}`, className)}
      style={{
        opacity: opacite,
        ...(masque
          ? { maskImage: masque, WebkitMaskImage: masque }
          : {}),
      }}
    />
  );
}

/**
 * Filet tissé kente, en séparation de sections.
 *
 * Il remplace la ligne grise de 1 px par quelque chose qui vient d'ailleurs
 * que d'un kit de design occidental, pour le même encombrement vertical.
 */
export function BandeKente({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bande-kente w-full", className)} />;
}
