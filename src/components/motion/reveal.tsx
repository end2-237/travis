"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Sens d'entrée du bloc. */
  from?: Direction;
  /** Retard avant démarrage, en millisecondes. */
  delay?: number;
  /** Durée de la transition, en millisecondes. */
  duration?: number;
  /** Amplitude du déplacement initial, en pixels. */
  distance?: number;
  /** Rejoue l'animation à chaque entrée dans le viewport. */
  once?: boolean;
  as?: React.ElementType;
}

const AXIS: Record<Direction, (d: number) => { x: string; y: string }> = {
  up: (d) => ({ x: "0px", y: `${d}px` }),
  down: (d) => ({ x: "0px", y: `-${d}px` }),
  left: (d) => ({ x: `${d}px`, y: "0px" }),
  right: (d) => ({ x: `-${d}px`, y: "0px" }),
  none: () => ({ x: "0px", y: "0px" }),
};

/**
 * Révèle son contenu à l'entrée dans le viewport.
 *
 * L'état masqué est porté par une règle CSS conditionnée à `data-js="on"`,
 * drapeau posé par un script en tête de document. Sans JavaScript — script
 * bloqué, robot d'indexation, impression — la règle ne s'applique jamais et
 * le contenu reste lisible. Une page qui existe pour informer ne doit pas
 * pouvoir disparaître à cause d'une animation.
 *
 * La détection passe par IntersectionObserver : aucun calcul par frame
 * pendant le défilement.
 */
export function Reveal({
  children,
  className,
  from = "up",
  delay = 0,
  duration = 700,
  distance = 22,
  once = true,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setEntered(false);
        }
      },
      // Déclenche un peu avant que le bloc n'atteigne le bas de l'écran,
      // pour que l'animation soit déjà engagée quand il devient lisible.
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, reduced]);

  const offset = AXIS[from](distance);

  return (
    <Tag
      ref={ref}
      className={cn("travis-reveal", className)}
      data-shown={reduced || entered ? "true" : "false"}
      style={
        {
          "--reveal-x": offset.x,
          "--reveal-y": offset.y,
          "--reveal-delay": `${delay}ms`,
          "--reveal-duration": `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
