"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Préférence système « moins d'animations ».
 *
 * Passe par useSyncExternalStore plutôt que par un effet : la valeur est
 * lue au bon moment du rendu, sans setState synchrone ni écart
 * d'hydratation — le serveur suppose l'animation active, le client corrige
 * dès le premier rendu.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
