import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Download, FileText, MessageCircle } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";
import { getOrder, getReportDownloadUrl } from "@/server/orders";
import { formatXaf } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Votre feuille de route",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) notFound();

  const paid = order.payment_status === "SUCCESS";
  const downloadUrl = paid ? await getReportDownloadUrl(order) : null;

  return (
    <main>
      <PageHeader />

      <section className="shell pt-12 md:pt-16">
        <div className="mx-auto max-w-[620px]">
          <span className="eyebrow">
            {paid ? "Paiement confirmé" : "Paiement en attente"}
          </span>

          <h1 className="section-title mt-5">
            {paid
              ? "Votre feuille de route est prête"
              : "Nous attendons la confirmation de votre opérateur"}
          </h1>

          <p className="mt-3 text-[12.5px] leading-[1.6] text-ink-muted">
            {paid
              ? "Le rapport reprend votre audit d'admissibilité, les programmes retenus, le calendrier des démarches et la checklist documentaire."
              : "Validez la demande reçue sur votre téléphone. Cette page se met à jour dès que l'opérateur nous notifie le règlement."}
          </p>

          <div className="mt-8 rounded-panel bg-white p-6 shadow-card">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-sunk text-ink">
                {paid ? (
                  <FileText className="h-5 w-5" strokeWidth={1.7} />
                ) : (
                  <Clock className="h-5 w-5" strokeWidth={1.7} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.02em]">
                  Feuille de route stratégique
                </p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Commande {order.id.slice(0, 8)} ·{" "}
                  {formatXaf(Number(order.amount))} ·{" "}
                  {paid ? "réglée" : "en attente"}
                </p>
              </div>
            </div>

            {paid && downloadUrl ? (
              <a
                href={downloadUrl}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-ink text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                Télécharger le rapport PDF
              </a>
            ) : (
              <div className="mt-6 rounded-card border border-line bg-surface-soft p-4">
                <p className="text-[11.5px] leading-[1.6] text-ink-muted">
                  Une fois la transaction validée, le rapport est généré
                  automatiquement et un lien vous est envoyé sur WhatsApp.
                  Rechargez cette page dans quelques instants.
                </p>
              </div>
            )}

            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.7} />
              Un lien de téléchargement est aussi envoyé sur votre WhatsApp.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block text-[12px] text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
