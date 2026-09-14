"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface FloatingAction {
  /** Identifiant de la section visée, sans le dièse. */
  target: string;
  label: string;
  /** Libellé abrégé sur petit écran, où la place manque. */
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Un seul raccourci porte l'accent : celui qui mène à l'action payante. */
  primary?: boolean;
}

/**
 * Raccourcis flottants vers les sections éloignées d'une page longue.
 *
 * Deux règles tiennent l'ensemble :
 *
 * 1. Un raccourci n'existe que tant que sa section est **en dessous**. Il
 *    disparaît quand on l'atteint, et ne revient pas une fois dépassée :
 *    remonter, c'est le rôle du bouton de retour. Sans cette règle, les
 *    pastilles s'accumulent en bas d'écran et recouvrent le contenu — très
 *    visible sur mobile, où la colonne fait toute la largeur.
 * 2. Le retour en haut n'apparaît qu'une fois la première hauteur d'écran
 *    franchie — avant, le haut de page est à portée de molette.
 *
 * Le repérage passe par IntersectionObserver, donc sans calcul par frame
 * pendant le défilement.
 */
export function FloatingActions({ actions }: { actions: FloatingAction[] }) {
  /** Cibles atteintes ou dépassées : leur raccourci n'a plus lieu d'être. */
  const [reached, setReached] = useState<Set<string>>(new Set());
  // Le tableau `actions` est recréé à chaque rendu : on dépend de la liste des
  // cibles, stable tant que les sections ne changent pas.
  const targetKey = actions.map((a) => a.target).join("|");
  const [scrolled, setScrolled] = useState(false);
  const reduced = usePrefersReducedMotion();
  const frame = useRef(0);

  // Sections observées : on masque le raccourci correspondant.
  useEffect(() => {
    const nodes = actions
      .map((a) => document.getElementById(a.target))
      .filter((n): n is HTMLElement => n !== null);

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setReached((current) => {
          const next = new Set(current);
          for (const entry of entries) {
            // Visible, ou déjà passée au-dessus du viewport : dans les deux
            // cas le raccourci a fait son office.
            const above =
              !entry.isIntersecting && entry.boundingClientRect.top < 0;
            if (entry.isIntersecting || above) next.add(entry.target.id);
            else next.delete(entry.target.id);
          }
          return next;
        });
      },
      { rootMargin: "-15% 0px -25% 0px" },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  // Position de défilement, lue dans un rAF plutôt qu'à chaque événement.
  useEffect(() => {
    const update = () => {
      frame.current = 0;
      setScrolled(window.scrollY > window.innerHeight * 0.9);
    };
    const schedule = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  // Aucun drapeau de montage n'est nécessaire : au chargement, la page est en
  // haut, donc l'état rendu par le serveur — retour masqué, raccourcis
  // visibles — est exactement celui du client. Rien à réconcilier.
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end px-4 pb-4 md:px-6 md:pb-6"
      // Respecte la barre système des navigateurs mobiles.
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {/* Retour en haut */}
        <button
          type="button"
          onClick={goTop}
          aria-label="Revenir en haut de la page"
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink shadow-float transition-all duration-300 hover:bg-surface-soft",
            scrolled
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        {/* Raccourcis de section */}
        {actions.map((action) => {
          const hidden = reached.has(action.target);
          return (
            <a
              key={action.target}
              href={`#${action.target}`}
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : 0}
              className={cn(
                "flex h-11 items-center gap-2 rounded-full pl-3.5 pr-4 text-[12.5px] font-medium shadow-float transition-all duration-300",
                action.primary
                  ? "bg-ink text-white hover:bg-ink-soft"
                  : "border border-line bg-white text-ink hover:bg-surface-soft",
                hidden
                  ? "pointer-events-none translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100",
              )}
            >
              <action.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
              <span className="sm:hidden">
                {action.shortLabel ?? action.label}
              </span>
              <span className="hidden sm:inline">{action.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
