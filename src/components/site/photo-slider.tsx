"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

export type Diapo = {
  src: string;
  alt: string;
  /** Légende affichée en bas de la diapositive. Facultative. */
  legende?: string;
};

/**
 * Diaporama photo.
 *
 * Trois choses le distinguent d'un carrousel de bibliothèque :
 *
 * 1. **Il rend toutes les diapositives dans le document.** Sans JavaScript —
 *    connexion coupée en plein chargement, navigateur d'entrée de gamme — la
 *    première reste visible et lisible au lieu d'un cadre vide.
 * 2. **Il s'arrête tout seul.** Au survol, au focus clavier, quand l'onglet
 *    passe en arrière-plan, et définitivement dès que le visiteur touche une
 *    commande : quelqu'un qui regarde une photo n'a pas à courir après.
 * 3. **Il respecte « moins d'animations ».** Le défilement automatique ne
 *    démarre pas ; les flèches et les puces restent, elles.
 *
 * Seules la diapositive visible et la suivante sont chargées en priorité ;
 * les autres attendent leur tour. Sur un forfait compté au mégaoctet, un
 * carrousel qui précharge huit photos est une facture, pas une animation.
 */
export function PhotoSlider({
  diapos,
  intervalMs = 4600,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, 560px",
  priorite = false,
  etiquette,
}: {
  diapos: Diapo[];
  intervalMs?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  /** Charge la première image en priorité — à réserver au-dessus de la ligne de flottaison. */
  priorite?: boolean;
  /** Nom du diaporama, annoncé aux lecteurs d'écran. */
  etiquette: string;
}) {
  const reduit = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const [arrete, setArrete] = useState(false);
  const zone = useRef<HTMLDivElement>(null);

  const total = diapos.length;
  const aller = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total],
  );

  // Défilement automatique. Il ne tourne que s'il a une raison de tourner :
  // plusieurs diapositives, pas de préférence « moins d'animations », pas de
  // survol en cours, et pas de reprise en main par le visiteur.
  useEffect(() => {
    if (total < 2 || reduit || enPause || arrete) return;
    const id = window.setInterval(() => aller(1), intervalMs);
    return () => window.clearInterval(id);
  }, [aller, arrete, enPause, intervalMs, reduit, total]);

  // Un onglet en arrière-plan n'a personne devant lui : inutile de faire
  // tourner un minuteur et de décoder des images pour un écran que nul ne
  // regarde.
  useEffect(() => {
    const onVisibilite = () => setEnPause(document.hidden);
    document.addEventListener("visibilitychange", onVisibilite);
    return () => document.removeEventListener("visibilitychange", onVisibilite);
  }, []);

  const manuel = (delta: number) => {
    setArrete(true);
    aller(delta);
  };

  const onClavier = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      manuel(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      manuel(1);
    }
  };

  if (total === 0) return null;

  const enMarche = total > 1 && !reduit && !arrete;

  return (
    <div
      ref={zone}
      role="group"
      aria-roledescription="diaporama"
      aria-label={etiquette}
      tabIndex={0}
      onKeyDown={onClavier}
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocus={() => setEnPause(true)}
      onBlur={() => setEnPause(false)}
      className={cn(
        "photo-fallback group relative overflow-hidden outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ink",
        className,
      )}
    >
      {diapos.map((diapo, i) => {
        const actif = i === index;
        return (
          <div
            key={diapo.src}
            aria-hidden={!actif}
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-out-soft motion-reduce:transition-none",
              actif ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={diapo.src}
              alt={diapo.alt}
              fill
              sizes={sizes}
              priority={priorite && i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className={cn(
                "object-cover",
                // Léger travelling sur la diapositive visible : l'image
                // respire au lieu de rester figée entre deux fondus.
                actif && "diapo-active",
                imageClassName,
              )}
            />
          </div>
        );
      })}

      {/* Voile bas : il porte la légende et les commandes sans assombrir
          toute la photo. */}
      <div aria-hidden className="scrim-band absolute inset-0" />

      {/*
       * Les légendes sont empilées et fondues avec leur photo, au lieu d'un
       * seul paragraphe dont le texte change.
       *
       * Une seule ligne de texte basculait instantanément alors que l'image
       * met 900 ms à se fondre : pendant près d'une seconde, la légende
       * décrivait la photo suivante. Sur un produit qui promet de ne rien
       * afficher d'inexact, une légende qui ne correspond pas à l'image
       * visible est un défaut, pas un détail d'animation.
       *
       * La hauteur est réservée pour deux lignes : sans elle, les puces et
       * les commandes sauteraient d'une diapositive à l'autre.
       */}
      <div className="pointer-events-none absolute inset-x-3 bottom-[54px] md:inset-x-4 md:bottom-[58px]">
        <div className="relative h-[34px] md:h-[36px]">
          {diapos.map((diapo, i) =>
            diapo.legende ? (
              <p
                key={diapo.src}
                aria-hidden={i !== index}
                className={cn(
                  "absolute inset-0 max-w-[34ch] text-[11px] leading-[1.45] text-white/90 transition-opacity duration-[900ms] ease-out-soft motion-reduce:transition-none md:text-[12px]",
                  i === index ? "opacity-100" : "opacity-0",
                )}
              >
                {diapo.legende}
              </p>
            ) : null,
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-4">
        <div className="min-w-0">
          {/* Puces de position. Cliquables, et assez grandes pour un pouce. */}
          {total > 1 ? (
            <div className="flex items-center gap-1.5">
              {diapos.map((diapo, i) => (
                <button
                  key={diapo.src}
                  type="button"
                  onClick={() => {
                    setArrete(true);
                    setIndex(i);
                  }}
                  aria-label={`Photo ${i + 1} sur ${total}`}
                  aria-current={i === index}
                  className="grid h-6 w-5 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-300",
                      i === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
                    )}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {total > 1 ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setArrete((a) => !a)}
              aria-label={
                enMarche
                  ? "Mettre le diaporama en pause"
                  : "Relancer le diaporama"
              }
              className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/14 text-white backdrop-blur-md transition-colors hover:bg-white/26"
            >
              {enMarche ? (
                <Pause className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <Play className="h-3.5 w-3.5" strokeWidth={2} />
              )}
            </button>
            <button
              type="button"
              onClick={() => manuel(-1)}
              aria-label="Photo précédente"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/14 text-white backdrop-blur-md transition-colors hover:bg-white/26"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => manuel(1)}
              aria-label="Photo suivante"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/14 text-white backdrop-blur-md transition-colors hover:bg-white/26"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Position annoncée sans bruit : une seule mise à jour par
          changement, pas une phrase par image. */}
      <span className="sr-only" aria-live="polite">
        Photo {index + 1} sur {total}
      </span>
    </div>
  );
}
