import { NB_PROGRAMMES } from "@/data/stats";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { PageViewTracker } from "@/components/analytics/page-view";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Travis — Trouvez votre bourse, bâtissez votre avenir",
    template: "%s · Travis",
  },
  description:
    `Évaluez gratuitement votre admissibilité sur ${NB_PROGRAMMES} bourses et universités, consultez la procédure complète de chacune, puis emportez votre feuille de route en PDF pour 500 FCFA.`,
  keywords: [
    "bourses d'études",
    "orientation internationale",
    "admissibilité",
    "Cameroun",
    "Mobile Money",
    "études à l'étranger",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Travis",
    title: "Travis — Trouvez votre bourse, bâtissez votre avenir",
    description:
      "Moteur d'admissibilité académique et d'orientation internationale. Évaluation gratuite, feuille de route à 500 FCFA.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/*
          Marque le document comme piloté par JavaScript, avant tout rendu
          peint. Les blocs animés ne se masquent que sous ce drapeau : si le
          script ne s'exécute pas, la page reste entièrement lisible.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.js="on"`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      </body>
    </html>
  );
}
