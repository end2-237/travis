import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/site/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Travis collecte, pourquoi, combien de temps, et comment les faire supprimer.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Confidentialité"
      title="Politique de confidentialité"
      updatedOn="14 septembre 2026"
    >
      <LegalSection title="Ce que nous collectons">
        <p>
          L&apos;évaluation enregistre uniquement ce qui sert au matching :
          votre nom, votre numéro WhatsApp, votre ville, votre dernier diplôme,
          votre filière, votre moyenne sur 20, votre budget annuel, vos pays
          ciblés et votre niveau de langue.
        </p>
        <p>
          Nous ne demandons ni pièce d&apos;identité, ni relevé bancaire, ni
          adresse e-mail. Aucune donnée n&apos;est achetée à un tiers.
        </p>
      </LegalSection>

      <LegalSection title="Pourquoi nous les collectons">
        <p>
          Votre moyenne, votre filière et votre budget alimentent le moteur
          d&apos;admissibilité. Votre numéro WhatsApp sert à vous livrer le
          rapport une fois le paiement confirmé. Votre nom apparaît sur le PDF.
        </p>
        <p>
          Ces informations ne servent à rien d&apos;autre. Nous ne les vendons
          pas, ne les louons pas et ne les transmettons à aucun courtier en
          orientation.
        </p>
      </LegalSection>

      <LegalSection title="Paiement">
        <p>
          Le règlement de 500 FCFA est traité par un agrégateur Mobile Money.
          Nous ne voyons ni ne stockons votre code PIN, et nous conservons
          uniquement la référence de transaction et son statut — jamais les
          identifiants de votre compte Mobile Money.
        </p>
      </LegalSection>

      <LegalSection title="Où vivent vos données">
        <p>
          Les profils et les commandes sont stockés dans une base PostgreSQL
          hébergée chez Supabase, protégée par Row Level Security. Les rapports
          PDF sont déposés dans un bucket privé et ne sont accessibles que par
          un lien signé, valable une heure.
        </p>
      </LegalSection>

      <LegalSection title="Combien de temps">
        <p>
          Les profils sans commande payée sont supprimés au bout de 12 mois. Les
          commandes payées et leur rapport sont conservés 36 mois, le temps que
          vous puissiez y revenir pendant votre cycle de candidature.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous pouvez demander à consulter, corriger ou supprimer vos données à
          tout moment, en écrivant au numéro WhatsApp de contact avec le numéro
          utilisé lors de l&apos;évaluation. Nous répondons sous 30 jours.
        </p>
      </LegalSection>

      <LegalSection title="Mesure d'audience">
        <p>
          Le site ne dépose aucun cookie publicitaire et ne suit pas votre
          navigation sur d&apos;autres sites.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
