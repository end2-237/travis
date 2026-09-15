"use client";

import {
  FloatingActions,
  type FloatingAction,
} from "@/components/site/floating-actions";

/**
 * Raccourcis de la page de résultats.
 *
 * Les offres occupant plusieurs écrans, les deux sections qui appellent une
 * action — les démarches et le rapport — se retrouvent hors de portée. Ces
 * raccourcis y ramènent sans faire défiler toute la liste.
 */
export function ResultsFloatingActions({
  hasDossier,
}: {
  hasDossier: boolean;
}) {
  const actions: FloatingAction[] = [
    ...(hasDossier
      ? [
          {
            target: "dossier",
            label: "Les démarches",
            shortLabel: "Démarches",
            icon: "demarches",
          } satisfies FloatingAction,
        ]
      : []),
    {
      target: "rapport",
      label: "Ma feuille de route",
      shortLabel: "Mon PDF",
      icon: "rapport",
      primary: true,
    },
  ];

  return <FloatingActions actions={actions} />;
}
