"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Signale une page vue à chaque navigation.
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
