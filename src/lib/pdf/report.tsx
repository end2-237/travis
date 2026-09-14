import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { buildTimeline, DOCUMENT_CHECKLIST } from "@/lib/pdf/checklist";
import { pdfText } from "@/lib/pdf/text";
import { formatGpa, formatXaf } from "@/lib/utils";
import type { MatchSnapshot, StudentProfile } from "@/types/database";

const INK = "#101010";
const MUTED = "#6f6f6f";
const FAINT = "#9a9a9a";
const LINE = "#e4e4e0";
const CANVAS = "#f7f7f5";

const s = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 54,
    paddingHorizontal: 46,
    fontSize: 9.5,
    color: INK,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingBottom: 10,
    marginBottom: 22,
  },
  brand: { fontSize: 12, fontFamily: "Helvetica-Bold", letterSpacing: -0.3 },
  brandMeta: { fontSize: 8, color: FAINT },
  pageTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  lede: { fontSize: 9.5, color: MUTED, marginBottom: 18, maxWidth: 420 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.2,
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardSoft: { backgroundColor: CANVAS, borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  statGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  stat: {
    flex: 1,
    backgroundColor: CANVAS,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  statValue: { fontSize: 18, fontFamily: "Helvetica-Bold", letterSpacing: -0.6 },
  statLabel: { fontSize: 7.5, color: MUTED, marginTop: 3 },
  label: { fontSize: 7.5, color: FAINT, textTransform: "uppercase", letterSpacing: 0.4 },
  value: { fontSize: 10, marginTop: 2 },
  rank: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    backgroundColor: INK,
    borderRadius: 9,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  matchTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: -0.2 },
  matchMeta: { fontSize: 8, color: MUTED, marginTop: 2 },
  link: {
    fontSize: 8,
    color: "#1f6feb",
    marginTop: 8,
  },
  pill: {
    fontSize: 7.5,
    color: MUTED,
    backgroundColor: CANVAS,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginRight: 4,
    marginTop: 5,
  },
  bullet: { flexDirection: "row", marginTop: 4 },
  bulletDot: { width: 10, color: FAINT },
  bulletText: { flex: 1, fontSize: 9 },
  footer: {
    position: "absolute",
    left: 46,
    right: 46,
    bottom: 28,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: FAINT },
  thRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingBottom: 6,
    marginBottom: 4,
  },
  th: { fontSize: 7.5, color: FAINT, textTransform: "uppercase", letterSpacing: 0.4 },
  tdRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0ec",
    paddingVertical: 7,
  },
  td: { fontSize: 8.5 },
});

function Shell({
  children,
  page,
  profileName,
}: {
  children: React.ReactNode;
  page: string;
  profileName: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.brandRow}>
        <Text style={s.brand}>Travis</Text>
        <Text style={s.brandMeta}>
          Feuille de route stratégique · {profileName}
        </Text>
      </View>
      {children}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>{page}</Text>
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

export function ReportDocument({
  profile,
  snapshot,
}: {
  profile: StudentProfile;
  snapshot: MatchSnapshot;
}) {
  const name = pdfText(profile.full_name) || "Candidat";
  const matches = snapshot.matches;
  const top = matches.slice(0, 8);
  const timeline = buildTimeline(
    matches.map((m) => m.deadline_month ?? "").filter(Boolean),
  );
  const generatedOn = new Date(snapshot.generated_at).toLocaleDateString(
    "fr-FR",
    { day: "2-digit", month: "long", year: "numeric" },
  );

  return (
    <Document
      title={`Feuille de route Travis — ${name}`}
      author="Travis"
      language="fr"
    >
      {/* Page 1 — Synthèse du profil & audit d'admissibilité */}
      <Shell page="Synthèse & audit d'admissibilité" profileName={name}>
        <Text style={s.pageTitle}>Audit d&apos;admissibilité</Text>
        <Text style={s.lede}>
          Rapport établi le {generatedOn} à partir de votre moyenne réelle,
          de votre filière et de votre enveloppe budgétaire, confrontées au
          catalogue Travis.
        </Text>

        <View style={s.statGrid}>
          <View style={s.stat}>
            <Text style={s.statValue}>{snapshot.score} %</Text>
            <Text style={s.statLabel}>Score d&apos;admissibilité globale</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{snapshot.teaser.total}</Text>
            <Text style={s.statLabel}>Programmes compatibles</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{snapshot.teaser.fully_funded}</Text>
            <Text style={s.statLabel}>Financements intégraux</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Profil académique</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Nom complet</Text>
              <Text style={s.value}>{name}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Dernier diplôme</Text>
              <Text style={s.value}>{pdfText(profile.current_degree)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Moyenne</Text>
              <Text style={s.value}>{formatGpa(Number(profile.gpa_score))}</Text>
            </View>
          </View>
          <View style={[s.row, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Filière</Text>
              <Text style={s.value}>{pdfText(profile.field_of_study)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Budget annuel</Text>
              <Text style={s.value}>
                {profile.max_budget_xaf === null
                  ? "Non renseigné"
                  : formatXaf(Number(profile.max_budget_xaf))}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Langue</Text>
              <Text style={s.value}>{pdfText(profile.language_level) || "—"}</Text>
            </View>
          </View>
          {profile.target_countries.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              <Text style={s.label}>Destinations visées</Text>
              <Text style={s.value}>{pdfText(profile.target_countries.join(", "))}</Text>
            </View>
          ) : null}
        </View>

        <Text style={s.sectionTitle}>Lecture du diagnostic</Text>
        <View style={s.cardSoft}>
          <Text>{pdfText(snapshot.teaser.headline)}</Text>
          {snapshot.teaser.regions.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {snapshot.teaser.regions.map((r) => (
                <Text key={r.region} style={s.pill}>
                  {pdfText(r.region)} · {r.count} programme{r.count > 1 ? "s" : ""}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <Text style={s.sectionTitle}>Ce que ce score signifie</Text>
        <Bullet>
          Il combine votre marge de moyenne sur les minima exigés, la
          compatibilité budgétaire et le nombre d&apos;options ouvertes.
        </Bullet>
        <Bullet>
          Un score supérieur à 70 % indique que vous pouvez viser plusieurs
          programmes financés sans repositionnement majeur.
        </Bullet>
        <Bullet>
          En dessous de 45 %, privilégiez les passerelles et les universités à
          frais réduits listées pages suivantes.
        </Bullet>
      </Shell>

      {/* Pages 2-3 — Recommandations chiffrées */}
      <Shell page="Recommandations chiffrées" profileName={name}>
        <Text style={s.pageTitle}>Programmes recommandés</Text>
        <Text style={s.lede}>
          Classés par compatibilité décroissante avec votre profil. Le taux
          intègre la moyenne, le budget et vos destinations visées. Chaque
          fiche renvoie à l&apos;appel à candidatures officiel : vérifiez-y les
          dates avant tout dépôt.
        </Text>

        {top.length === 0 ? (
          <View style={s.cardSoft}>
            <Text>
              Aucun programme du catalogue ne correspond strictement à vos
              critères actuels. La page suivante détaille les passerelles
              permettant de relever votre profil en une session.
            </Text>
          </View>
        ) : null}

        {top.slice(0, 4).map((match, index) => (
          <MatchCard key={match.id} match={match} rank={index + 1} />
        ))}
      </Shell>

      {top.length > 4 ? (
        <Shell page="Recommandations chiffrées (suite)" profileName={name}>
          <Text style={s.pageTitle}>Options complémentaires</Text>
          <Text style={s.lede}>
            À conserver comme filet de sécurité : ces programmes restent
            compatibles avec votre dossier si les premiers choix échouent.
          </Text>
          {top.slice(4).map((match, index) => (
            <MatchCard key={match.id} match={match} rank={index + 5} />
          ))}
        </Shell>
      ) : null}

      {/* Page 4 — Calendrier chronologique */}
      <Shell page="Calendrier des démarches" profileName={name}>
        <Text style={s.pageTitle}>Calendrier mois par mois</Text>
        <Text style={s.lede}>
          Construit à rebours de la clôture la plus proche parmi vos programmes
          compatibles. Chaque étape conditionne la suivante.
        </Text>

        {timeline.map((step, index) => (
          <View key={`${step.month}-${index}`} style={s.card}>
            <View style={s.row}>
              <Text style={s.matchTitle}>{step.title}</Text>
              <Text style={s.rank}>{step.month}</Text>
            </View>
            {step.actions.map((action) => (
              <Bullet key={action}>{action}</Bullet>
            ))}
          </View>
        ))}
      </Shell>

      {/* Page 5 — Checklist documentaire */}
      <Shell page="Checklist documentaire" profileName={name}>
        <Text style={s.pageTitle}>Pièces à constituer</Text>
        <Text style={s.lede}>
          Légalisation, traduction assermentée et référents certifiés. Les
          délais indiqués sont ceux observés en Afrique centrale.
        </Text>

        <View style={s.thRow}>
          <Text style={[s.th, { flex: 1.1 }]}>Document</Text>
          <Text style={[s.th, { flex: 1.9 }]}>Détail & délai</Text>
          <Text style={[s.th, { flex: 1.2 }]}>Où l&apos;obtenir</Text>
        </View>

        {DOCUMENT_CHECKLIST.map((item) => (
          <View key={item.document} style={s.tdRow} wrap={false}>
            <Text style={[s.td, { flex: 1.1, fontFamily: "Helvetica-Bold" }]}>
              {item.document}
            </Text>
            <Text style={[s.td, { flex: 1.9, color: MUTED }]}>{item.detail}</Text>
            <Text style={[s.td, { flex: 1.2, color: MUTED }]}>
              {item.referent}
            </Text>
          </View>
        ))}

        <Text style={s.sectionTitle}>Avertissement</Text>
        <Text style={{ fontSize: 8.5, color: MUTED }}>
          Les montants, minima et dates de clôture reflètent les sessions
          publiées au moment de la génération de ce rapport. Vérifiez toujours
          l&apos;appel à candidatures officiel avant tout dépôt : les
          établissements peuvent modifier leurs critères sans préavis.
        </Text>
      </Shell>
    </Document>
  );
}

function MatchCard({
  match,
  rank,
}: {
  match: MatchSnapshot["matches"][number];
  rank: number;
}) {
  return (
    <View style={s.card} wrap={false}>
      <View style={s.row}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={s.matchTitle}>
            {rank}. {pdfText(match.title)}
          </Text>
          <Text style={s.matchMeta}>
            {pdfText(match.institution ?? "Établissement partenaire")} ·{" "}
            {pdfText(match.country)}
          </Text>
        </View>
        <Text style={s.rank}>{match.fit_score} %</Text>
      </View>

      <View style={[s.row, { marginTop: 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Minimum requis</Text>
          <Text style={s.value}>{formatGpa(Number(match.min_gpa_20))}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Votre marge</Text>
          <Text style={s.value}>
            {match.gpa_margin >= 0 ? "+" : ""}
            {match.gpa_margin.toFixed(2).replace(".", ",")} pts
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Reste à charge</Text>
          <Text style={s.value}>
            {Number(match.annual_cost_xaf) === 0
              ? "0 FCFA"
              : `${formatXaf(Number(match.annual_cost_xaf))} / an`}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Clôture</Text>
          <Text style={s.value}>{pdfText(match.deadline_month) || "À confirmer"}</Text>
        </View>
      </View>

      {match.official_website ?? match.application_url ? (
        <Text style={s.link}>
          Appel officiel :{" "}
          {(match.official_website ?? match.application_url ?? "").replace(
            /^https?:\/\//,
            "",
          )}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {match.funding_coverage ? (
          <Text style={s.pill}>{pdfText(match.funding_coverage)}</Text>
        ) : null}
        {match.language_requirements ? (
          <Text style={s.pill}>{pdfText(match.language_requirements)}</Text>
        ) : null}
        {match.max_age ? <Text style={s.pill}>Âge max. {match.max_age} ans</Text> : null}
        <Text style={s.pill}>
          {match.within_budget ? "Dans votre budget" : "Au-dessus du budget"}
        </Text>
      </View>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>—</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

/** Rend le rapport en PDF binaire, prêt à être stocké ou servi. */
export async function renderReport(
  profile: StudentProfile,
  snapshot: MatchSnapshot,
): Promise<Buffer> {
  return renderToBuffer(
    <ReportDocument profile={profile} snapshot={snapshot} />,
  );
}
