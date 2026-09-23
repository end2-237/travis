import type { ProgramKind } from "../procedure.ts";

/**
 * Description d'un programme du catalogue.
 *
 * Le type vit dans son propre fichier parce que le catalogue est désormais
 * réparti par région : sans cela, chaque fichier régional importerait le
 * fichier agrégateur, qui les importe tous — une dépendance circulaire.
 */
export interface ProgramSpec {
  slug: string;
  kind: ProgramKind;
  title: string;
  country: string;
  institution: string;
  degree_levels: string[];
  eligible_fields: string[];
  /**
   * Seuil de moyenne, exprimé sur 20.
   *
   * **C'est une lecture de Travis, pas un chiffre publié.** Presque aucun
   * programme n'annonce de seuil sur 20 : les uns demandent un GPA sur 4,
   * d'autres une mention, d'autres encore « de bons résultats ». Cette
   * colonne traduit ces exigences sur l'échelle camerounaise pour que le
   * moteur puisse comparer, et elle est signalée comme une estimation
   * partout où elle s'affiche.
   *
   * La conséquence pratique : être au-dessus du seuil ne garantit rien, et
   * être juste en dessous ne ferme pas la porte. C'est un repère, pas un
   * verdict — le verdict, lui, vient du site officiel.
   */
  min_gpa_20: number;
  max_age: number | null;
  funding_coverage: string;
  deadline_month: string;
  language_requirements: string;
  annual_cost_xaf: number;
  fully_funded: boolean;
  official_website: string;
  /** Allocation mensuelle versée au boursier, si le programme en prévoit une. */
  monthly_allowance: string | null;
  tuition_note: string;
  covers: string[];
  not_covered: string[];
  selection: string;
  summary: string;
  /**
   * Visuel du programme.
   *
   * Facultatif : `catalog.ts` impose de toute façon l'image du pays, pour
   * qu'aucune fiche ne puisse afficher le Colisée sur un programme marocain.
   * Le champ ne subsiste que pour les cinquante fiches fondatrices.
   */
  image?: string;
}
