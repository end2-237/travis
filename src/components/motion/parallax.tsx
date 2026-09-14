"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Décale son contenu à contre-sens du défilement, pour donner de la
 * profondeur aux visuels pleine largeur.
 *
 * La position est recalculée dans un rAF plutôt qu'à chaque événement de
 * scroll, et l'élément n'est observé que lorsqu'il est à l'écran : hors
 * viewport, aucun calcul n'a lieu.
 */
export function Parallax({
  children,
  className,
  /** Amplitude du décalage, en pixels sur toute la traversée de l'écran. */
  amount = 60,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const host = outer.current;
    const target = inner.current;
    if (!host || !target) return;

    let visible = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = host.getBoundingClientRect();
      const viewport = window.innerHeight;
      // -1 quand le bloc entre par le bas, +1 quand il sort par le haut.
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      target.style.transform = `translate3d(0, ${(progress * amount).toFixed(2)}px, 0)`;
    };

    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      },
      { threshold: 0 },
    );

    observer.observe(host);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [amount, reduced]);

  return (
    <div ref={outer} className={cn("overflow-hidden", className)}>
      <div
        ref={inner}
        className="h-full w-full will-change-transform"
        // Marge verticale : le décalage ne doit jamais découvrir le fond.
        style={{ paddingBlock: `${amount}px`, marginBlock: `-${amount}px` }}
      >
        {children}
      </div>
    </div>
  );
}
