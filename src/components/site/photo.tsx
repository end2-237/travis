import Image from "next/image";
import { cn } from "@/lib/utils";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Voile sombre posé sur la photo — « full » pour les bannières pleine
   *  hauteur, « tile » pour les vignettes, « band » pour les bandeaux bas où
   *  le texte est aligné à gauche. */
  scrim?: "none" | "full" | "tile" | "band";
  children?: React.ReactNode;
};

/**
 * Visuel plein cadre. L'aplat `photo-fallback` reste visible si le CDN
 * d'images est injoignable, ce qui évite les trous blancs dans la mise en page.
 */
export function Photo({
  src,
  alt,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  scrim = "none",
  children,
}: PhotoProps) {
  return (
    <div className={cn("photo-fallback relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
      />
      {scrim !== "none" ? (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            scrim === "full" && "scrim",
            scrim === "tile" && "scrim-tile",
            scrim === "band" && "scrim-band",
          )}
        />
      ) : null}
      {children}
    </div>
  );
}
