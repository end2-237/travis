import { cn } from "@/lib/utils";

/**
 * Bandeau défilant en boucle.
 *
 * Le contenu est rendu deux fois et la piste translatée de -50 % : la boucle
 * se referme exactement sur elle-même, sans mesurer la largeur en JavaScript.
 * L'animation tourne sur le compositeur, donc sans coût sur le thread
 * principal, et se met en pause au survol pour rester lisible.
 */
export function Marquee({
  items,
  className,
  durationSeconds = 38,
  separator = "·",
}: {
  items: string[];
  className?: string;
  durationSeconds?: number;
  separator?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn("marquee overflow-hidden", className)}
      // Le doublon est décoratif : une seule liste est annoncée.
      aria-label={items.join(", ")}
      role="img"
    >
      <div
        className="marquee-track"
        style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden className="flex shrink-0 items-center">
            {items.map((item) => (
              <li
                key={`${copy}-${item}`}
                className="flex shrink-0 items-center gap-6 whitespace-nowrap px-6"
              >
                <span>{item}</span>
                <span className="text-ink-faint">{separator}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
