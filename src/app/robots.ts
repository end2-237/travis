import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Directives d'indexation.
 *
 * Générées plutôt que statiques, pour que la ligne `Sitemap:` porte le
 * domaine réellement déployé — un fichier figé dans `public/` ne peut pas
 * la connaître.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Ces trois espaces portent des données personnelles ou n'ont aucun
      // sens hors session.
      disallow: ["/resultats/", "/telechargement/", "/api/", "/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
