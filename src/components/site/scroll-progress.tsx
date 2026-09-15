/**
 * Fil de progression de lecture, en haut de l'écran.
 *
 * La largeur est pilotée par `animation-timeline: scroll()`, donc par le
 * compositeur : ni écouteur de défilement, ni mesure par frame. Sur les pages
 * longues — accueil, annuaire des démarches — il répond à la seule question
 * que se pose un lecteur qui fait défiler depuis une minute : combien reste-t-il ?
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]"
    >
      <div className="scroll-progress h-full w-full bg-ink" />
    </div>
  );
}
