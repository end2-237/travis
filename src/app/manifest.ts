import { NB_PROGRAMMES } from "@/data/stats";
import type { MetadataRoute } from "next";

/**
 * Manifeste d'application.
 *
 * Le public consulte le site au téléphone, souvent sur des forfaits
 * limités : pouvoir l'ajouter à l'écran d'accueil évite de repasser par le
 * navigateur et par une recherche à chaque fois.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Travis — bourses et orientation internationale",
    short_name: "Travis",
    description:
      `Évaluez gratuitement votre admissibilité sur ${NB_PROGRAMMES} bourses et universités, puis emportez votre feuille de route.`,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f2",
    theme_color: "#f4f4f2",
    lang: "fr",
    icons: [
      { src: "/brand/icone-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/brand/icone-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
