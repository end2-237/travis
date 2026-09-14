import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Ce que Travis fournit, ce que le rapport à 500 FCFA garantit — et ce qu'il ne garantit pas.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Conditions"
      title="Conditions d'utilisation"
      updatedOn="14 septembre 2026"
    >
      <LegalSection title="Ce que Travis fournit">
        <p>
          Travis compare votre profil académique à un catalogue de bourses et
          d&apos;universités, calcule un score d&apos;admissibilité et produit
          une feuille de route documentaire. C&apos;est un outil
          d&apos;information et d&apos;orientation.
        </p>
      </LegalSection>

      <LegalSection title="Ce que Travis ne garantit pas">
        <p>
          Travis n&apos;est ni une université, ni un consulat, ni un agent
          officiel d&apos;un programme de bourse.{" "}
          <strong className="font-semibold text-ink">
            Aucune admission, aucune bourse et aucun visa ne sont garantis.
          </strong>{" "}
          Les décisions appartiennent exclusivement aux établissements et aux
          autorités concernées.
        </p>
        <p>
          Les montants, minima de moyenne et dates de clôture reflètent les
          sessions publiées au moment où votre rapport est généré. Les
          établissements peuvent modifier leurs critères sans préavis :
          vérifiez toujours l&apos;appel à candidatures officiel avant de
          déposer un dossier.
        </p>
      </LegalSection>

      <LegalSection title="Exactitude de vos déclarations">
        <p>
          Le diagnostic vaut ce que valent vos réponses. Une moyenne surévaluée
          produit un rapport inexploitable. Vous restez responsable de
          l&apos;exactitude des informations que vous saisissez.
        </p>
      </LegalSection>

      <LegalSection title="Paiement et remboursement">
        <p>
          Le rapport coûte 500 FCFA, en un paiement unique, sans abonnement ni
          prélèvement ultérieur. Le contenu étant livré immédiatement après la
          confirmation du paiement, il n&apos;est pas remboursable une fois
          téléchargé.
        </p>
        <p>
          Si le paiement est débité sans que le rapport soit généré, contactez
          le support avec votre référence de transaction : la commande sera
          honorée ou remboursée intégralement.
        </p>
      </LegalSection>

      <LegalSection title="Usage du rapport">
        <p>
          Votre rapport est personnel. Vous pouvez l&apos;imprimer et le
          partager avec votre entourage ou un conseiller, mais pas le revendre
          ni le redistribuer publiquement.
        </p>
      </LegalSection>

      <LegalSection title="Disponibilité du service">
        <p>
          Nous visons une disponibilité continue, sans pouvoir la garantir. Les
          interruptions dues aux opérateurs Mobile Money ou aux hébergeurs
          échappent à notre contrôle.
        </p>
      </LegalSection>

      <LegalSection title="Évolution de ces conditions">
        <p>
          Ces conditions peuvent évoluer. La version en vigueur est celle
          publiée sur cette page à la date de votre commande.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
