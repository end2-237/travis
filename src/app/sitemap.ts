import type { MetadataRoute } from "next";
import { CATALOG } from "@/data/catalog";
import { siteUrl } from "@/lib/site";

/**
 * Plan du site.
 *
 * Les 50 fiches programmes sont le principal levier d'acquisition gratuite :
 * un candidat qui cherche « bourse Turquie Cameroun » doit tomber dessus.
 * Sans plan, elles n'étaient reliées qu'au catalogue et à l'accueil, et
 * rien n'indiquait aux moteurs leur fraîcheur ni leur importance relative.
 *
 * Les pages de résultats et de téléchargement en sont absentes : elles
 * portent un identifiant personnel et sont déjà interdites d'indexation.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();

  const fixes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/evaluation`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/destinations`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/partenaires`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/devenir-partenaire`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const programmes: MetadataRoute.Sitemap = CATALOG.map((entry) => ({
    url: `${base}/destinations/${entry.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...fixes, ...programmes];
}
