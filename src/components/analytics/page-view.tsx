"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Chemins qui rapportent eux-mêmes leur visite, avec un contexte que le
 * layout ne peut pas connaître — le programme consulté, son pays.
 *
 * Le tracker du layout les ignore. Sans cette liste, une fiche programme
 * émettait deux événements (`page_view` depuis le layout, `program_viewed`
 * depuis la page), et le tableau de bord, qui additionne les deux types
 * pour compter les visites, doublait leur fréquentation. Le classement des
 * destinations les plus demandées — la mesure la plus utile du back-office
 * — était donc faux par construction.
 */
const SELF_REPORTING = [/^\/destinations\/[^/]+$/];

/**
 * Signale une page vue à chaque navigation.
 *
 * **Un seul montage par page.** Le composant est posé une fois dans le
 * layout racine ; l'ajouter en plus dans une page compte la visite deux
 * fois.
 *
 * `keepalive` permet à la requête d'aboutir même si l'utilisateur quitte la
 * page dans la foulée, et un échec est silencieux : la mesure ne doit jamais
 * remonter d'erreur à l'écran.
 */
export function PageViewTracker({
  subject,
  country,
}: {
  subject?: string;
  country?: string;
}) {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === pathname) return;

    // Le tracker générique du layout se tait sur les pages qui se déclarent
    // elles-mêmes ; celui de la page, lui, porte un `subject` et passe.
    if (!subject && SELF_REPORTING.some((p) => p.test(pathname))) return;

    last.current = pathname;

    // Les pages de résultats et de téléchargement portent un identifiant dans
    // l'URL : on ne remonte que le gabarit, jamais l'identifiant du profil.
    const path = pathname
      .replace(/\/resultats\/[^/]+/, "/resultats/[id]")
      .replace(/\/telechargement\/[^/]+/, "/telechargement/[id]");

    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: subject ? "program_viewed" : "page_view",
        path,
        subject,
        country,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, subject, country]);

  return null;
}

/**
 * Événement ponctuel du tunnel — début d'évaluation, évaluation terminée.
 *
 * Ces étapes sont ce qui permet de savoir *où* les candidats abandonnent,
 * la question la plus utile pour ce produit. Les types existaient dans le
 * schéma sans que rien ne les émette : le tableau de bord ne montrait que
 * des pages vues.
 */
export function FunnelEvent({
  kind,
  subject,
}: {
  kind: "evaluation_started" | "evaluation_completed";
  subject?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, subject }),
      keepalive: true,
    }).catch(() => {});
  }, [kind, subject]);

  return null;
}
