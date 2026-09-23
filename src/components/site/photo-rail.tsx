import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Bandeau de photos défilant en continu.
 *
 * Même principe que le bandeau de texte : la liste est rendue deux fois et
 * la piste translatée de -50 %, donc la boucle se referme sur elle-même sans
 * mesurer quoi que ce soit en JavaScript. Le composant est rendu sur le
 * serveur et n'embarque aucun script — l'animation vit entièrement sur le
 * compositeur, et s'arrête au survol comme sous « moins d'animations ».
 */
export function PhotoRail({
  photos,
  className,
  durationSeconds = 46,
  hauteur = "h-[116px] md:h-[150px]",
  largeur = "w-[168px] md:w-[216px]",
}: {
  photos: { src: string; alt: string }[];
  className?: string;
  durationSeconds?: number;
  hauteur?: string;
  largeur?: string;
}) {
  if (photos.length === 0) return null;

  return (
    <div
      className={cn("marquee overflow-hidden", className)}
      role="img"
      aria-label={`Photos : ${photos.map((p) => p.alt).join(" ; ")}`}
    >
      <div
        className="marquee-track"
        style={
          { "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties
        }
      >
        {[0, 1].map((copie) => (
          <ul key={copie} aria-hidden className="flex shrink-0 items-center">
            {photos.map((photo) => (
              <li
                key={`${copie}-${photo.src}`}
                className={cn(
                  "photo-fallback relative mx-1.5 shrink-0 overflow-hidden rounded-[14px]",
                  hauteur,
                  largeur,
                )}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="216px"
                  loading="lazy"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
