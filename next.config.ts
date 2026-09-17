import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    // WebP seulement. L'encodage AVIF est nettement plus coûteux en CPU côté
    // serveur pour un gain de poids modeste sur ces photographies ; sur un
    // conteneur modeste, il retarde le premier affichage des vignettes du
    // catalogue — celles-là même qui constituent le plus grand élément peint.
    formats: ["image/webp"],
    // Les visuels de destination ne changent jamais : les regarder expirer
    // au bout de 60 secondes fait repayer l'optimisation en boucle.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  serverExternalPackages: ["@react-pdf/renderer"],

  /**
   * En-têtes de sécurité.
   *
   * Aucun n'était envoyé : la page pouvait être encadrée par un site tiers
   * (un faux « Travis » qui aurait affiché le vrai formulaire de paiement
   * dans une iframe), et le référent complet partait vers les sites
   * officiels des programmes — dont l'URL d'une page de résultats, qui porte
   * l'identifiant d'un profil.
   *
   * La politique de contenu autorise exactement ce dont le site se sert :
   * les images d'Unsplash et de Supabase, les polices Google, et
   * `'unsafe-inline'` pour les scripts — que Next exige pour son amorçage.
   */
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next injecte son amorçage en ligne ; `strict-dynamic` demanderait
      // une nonce par requête, incompatible avec les pages statiques.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // `frame-ancestors` couvre les navigateurs récents ; celui-ci
          // reste pour les plus anciens, encore courants sur le parc visé.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Le chemin d'une page de résultats porte un identifiant de
          // profil : il ne doit pas suivre un lien sortant.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
