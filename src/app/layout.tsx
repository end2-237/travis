import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
    "Évaluez gratuitement votre admissibilité sur 380 bourses et universités, puis débloquez votre feuille de route stratégique en PDF pour 500 FCFA via Mobile Money.",
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
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
