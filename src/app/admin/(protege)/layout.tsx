import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * Contrôle d'accès réel du back-office.
 *
 * Le middleware ne vérifie que la présence du cookie, faute de `node:crypto`
 * sur l'edge runtime. C'est ici, côté Node, que la signature et l'expiration
 * sont vérifiées. Le groupe de routes (protege) n'apparaît pas dans l'URL : il
 * sert uniquement à exclure /admin/connexion de cette garde.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isSignedIn())) redirect("/admin/connexion");
  return <>{children}</>;
}
