"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";

/**
 * Fait défiler un nombre jusqu'à sa valeur cible quand il entre à l'écran.
 * Le texte final est rendu dès le départ pour les lecteurs d'écran et les
 * moteurs d'indexation : seule la représentation visuelle est animée.
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1400,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // Sortie cubique : rapide au début, posée à l'arrivée.
          const eased = 1 - Math.pow(1 - t, 3);
          setProgress(value * eased);
          if (t < 1) requestAnimationFrame(tick);
          else setProgress(null);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, reduced]);

  const shown = (progress ?? value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.replace(/[  ]/g, " ")}
      {suffix}
    </span>
  );
}
