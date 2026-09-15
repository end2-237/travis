import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Fragment de phrase, avec sa mise en forme propre.
 * Le découpage en mots a lieu ici : un composant qui recevrait du JSX libre
 * devrait parcourir l'arbre React pour y trouver du texte, ce qui casse dès
 * qu'on y glisse un lien ou une abréviation.
 */
export interface WordSegment {
  text: string;
  className?: string;
}

/** Aplatit les fragments en mots, chacun gardant la classe de son fragment. */
function toWords(segments: WordSegment[]): WordSegment[] {
  return segments.flatMap((segment) =>
    segment.text
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({ text, className: segment.className })),
  );
}

/**
 * Phrase qui s'allume mot à mot au fil du défilement.
 *
 * Aucun JavaScript : chaque mot porte son rang dans `--w`, et la feuille de
 * style décale ses bornes sur la chronologie `view()`. Là où le navigateur ne
 * connaît pas cette chronologie, la règle entière est ignorée et le texte
 * s'affiche d'un bloc, pleinement lisible.
 */
export function ScrollWords({
  segments,
  className,
  as: Tag = "p",
}: {
  segments: WordSegment[];
  className?: string;
  as?: React.ElementType;
}) {
  const words = toWords(segments);

  return (
    // `--wn` porte le nombre de mots : la feuille de style s'en sert pour
    // répartir le décalage, au lieu d'un pas fixe qui s'étirerait sans fin
    // sur une phrase longue.
    <Tag
      className={cn("scroll-words", className)}
      style={{ "--wn": words.length } as React.CSSProperties}
    >
      {words.map((word, i) => (
        <span
          key={`${i}-${word.text}`}
          className={word.className}
          style={{ "--w": i } as React.CSSProperties}
        >
          {word.text}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Titre dont chaque mot se relève derrière un masque.
 *
 * `on="load"` pour un titre déjà à l'écran au chargement — il n'y a rien à
 * attendre. `on="scroll"` en dessous de la ligne de flottaison : la montée
 * suit alors la traversée du viewport, sinon l'animation serait terminée
 * depuis longtemps quand le lecteur y arrive.
 *
 * L'état masqué dépend de `data-js="on"` : sans JavaScript, sans animation,
 * le titre est simplement là.
 */
export function WordRise({
  lines,
  className,
  delay = 0,
  on = "load",
  as: Tag = "h2",
}: {
  /** Une entrée par ligne ; le retour est forcé entre elles. */
  lines: string[];
  className?: string;
  /** Retard initial, en millisecondes (variante « load » seulement). */
  delay?: number;
  on?: "load" | "scroll";
  as?: React.ElementType;
}) {
  let index = 0;

  return (
    <Tag
      className={cn("word-rise", on === "scroll" && "word-rise-scroll", className)}
      style={{ "--rise-delay": `${delay}ms` } as React.CSSProperties}
    >
      {lines.map((line, lineIndex) => {
        const words = line.split(/\s+/).filter(Boolean);
        return (
          <Fragment key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {words.map((word, wordIndex) => {
              const w = index++;
              return (
                <Fragment key={`${lineIndex}-${wordIndex}`}>
                  <span style={{ "--w": w } as React.CSSProperties}>
                    <span>{word}</span>
                  </span>
                  {wordIndex < words.length - 1 ? " " : null}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </Tag>
  );
}
