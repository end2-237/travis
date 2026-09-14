import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back-office",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Ce layout enveloppe TOUT /admin, page de connexion comprise : il ne doit
 * donc porter aucun contrôle d'accès, sans quoi la connexion se redirigerait
 * vers elle-même. La garde vit dans le groupe (protege).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
