/**
 * Écran d'attente de la page de résultats.
 *
 * Cette page interroge la base et fait tourner le moteur de matching avant
 * de rendre quoi que ce soit : sur une connexion lente, le candidat restait
 * devant un écran vide juste après avoir cliqué « Voir mes résultats ». Une
 * trame qui reprend la forme de la page à venir dit que quelque chose
 * arrive, et où.
 *
 * **Volontairement limité à cette route.** Un `loading.tsx` à la racine
 * enveloppe toutes les pages dans une frontière Suspense : sans JavaScript,
 * la bascule du squelette vers le contenu n'a jamais lieu, et le contenu
 * réel reste en `display: none`. Le site entier ne montrait plus que des
 * rectangles gris à un robot d'indexation ou à un navigateur sans script.
 *
 * Ici le compromis est acceptable : la page suit la soumission d'un
 * formulaire — donc JavaScript est déjà en marche — et elle porte
 * `noindex`.
 */
export default function Loading() {
  return (
    <div className="shell py-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement en cours…</span>

      <div className="h-6 w-32 animate-pulse rounded-full bg-surface-sunk" />
      <div className="mt-6 h-10 w-[min(28ch,100%)] animate-pulse rounded-lg bg-surface-sunk" />
      <div className="mt-3 h-4 w-[min(52ch,100%)] animate-pulse rounded-lg bg-surface-sunk" />

      <div className="mt-10 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="h-[168px] animate-pulse rounded-panel bg-surface-sunk" />
        <div className="h-[168px] animate-pulse rounded-panel bg-surface-sunk" />
        <div className="h-[168px] animate-pulse rounded-panel bg-surface-sunk" />
        <div className="h-[168px] animate-pulse rounded-panel bg-surface-sunk" />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[220px] animate-pulse rounded-panel bg-surface-sunk"
          />
        ))}
      </div>
    </div>
  );
}
