import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { join } from "node:path";
import { buildTimeline } from "@/lib/pdf/checklist";
import { catalogEntry } from "@/data/catalog";
import { countryImage } from "@/data/images";
import { inCountry } from "@/lib/grammar";
import {
  SERVICE_LABELS,
  servicesOfKind,
  type ServiceKind,
  type ServiceProvider,
} from "@/data/services";
import type { RequiredDocument } from "@/data/procedure";
import { pdfText } from "@/lib/pdf/text";
import { formatGpa, formatXaf } from "@/lib/utils";
import type { MatchSnapshot, StudentProfile } from "@/types/database";

/**
 * Logo embarqué dans le rapport.
 *
 * Lu sur le disque du serveur plutôt que par une URL : un PDF qui irait
 * chercher son en-tête sur le réseau perdrait sa marque hors connexion, et
 * ce document est fait pour être consulté justement là où il n'y a pas de
 * réseau. `process.cwd()` pointe la racine de l'application, en
 * développement comme dans l'image autonome.
 */
const LOGO_PATH = join(process.cwd(), "public", "brand", "travis-logo.png");

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
  brandLogo: { height: 15, objectFit: "contain" },
  brandMeta: { fontSize: 8, color: FAINT },
  pageTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.6,
    marginBottom: 7,
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
  cover: {
    width: "100%",
    height: 168,
    borderRadius: 8,
    objectFit: "cover",
    marginTop: 14,
  },
  coverCaption: {
    fontSize: 8,
    color: MUTED,
    marginTop: 5,
    textAlign: "center",
  },
  serviceCard: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    padding: 11,
    marginBottom: 7,
  },
  serviceName: { fontSize: 10, fontFamily: "Helvetica-Bold", letterSpacing: -0.2 },
  badge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    backgroundColor: "#1f6feb",
    borderRadius: 7,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeMuted: {
    fontSize: 7,
    color: MUTED,
    backgroundColor: CANVAS,
    borderRadius: 7,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  step: { flexDirection: "row", marginTop: 4 },
  stepNum: { width: 12, fontSize: 8, color: FAINT, fontFamily: "Helvetica-Bold" },
  stepText: { fontSize: 8.5, lineHeight: 1.45 },
  stepDetail: { fontSize: 7.5, color: MUTED, lineHeight: 1.45, marginTop: 2 },
  metaValue: { fontSize: 8.5, marginTop: 2, lineHeight: 1.35 },
  warn: {
    fontSize: 7.5,
    color: "#7a5b00",
    backgroundColor: "#fdf6e0",
    borderRadius: 6,
    padding: 7,
    marginTop: 7,
    lineHeight: 1.45,
  },
  docTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.2,
    marginTop: 14,
    marginBottom: 2,
  },
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
        {/* Le logo, et non le mot : ce document sort de l'écran — il est
            imprimé, transmis, montré à une famille ou à un conseiller. Il
            doit se reconnaître sans être lu. Le fichier est lu depuis le
            disque, donc embarqué dans le PDF : rien à télécharger à
            l'ouverture, et le rapport reste lisible hors ligne. */}
        <Image style={s.brandLogo} src={LOGO_PATH} />
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

/**
 * Destination illustrée en tête du rapport.
 *
 * Une seule destination demandée : c'est celle-là, sans ambiguïté. Plusieurs :
 * celle où le candidat a le plus d'options, car c'est la piste la plus
 * sérieuse. Aucune : le pays de la meilleure correspondance.
 */
function pickCoverCountry(
  profile: StudentProfile,
  matches: MatchSnapshot["matches"],
): string | null {
  const targets = profile.target_countries ?? [];

  if (targets.length === 1) return targets[0];

  if (targets.length > 1) {
    const counts = new Map<string, number>();
    for (const match of matches) {
      if (targets.includes(match.country)) {
        counts.set(match.country, (counts.get(match.country) ?? 0) + 1);
      }
    }
    if (counts.size > 0) {
      // À égalité, l'ordre de saisie du candidat tranche.
      return [...counts.entries()].sort(
        (a, b) => b[1] - a[1] || targets.indexOf(a[0]) - targets.indexOf(b[0]),
      )[0][0];
    }
    return targets[0];
  }

  return matches[0]?.country ?? null;
}

/** Regroupe les pièces exigées par les programmes retenus, par type de service. */
interface DocumentGroup {
  kind: ServiceKind;
  documents: string[];
  providers: ServiceProvider[];
}

function buildDocumentGroups(
  matches: MatchSnapshot["matches"],
): DocumentGroup[] {
  const byKind = new Map<ServiceKind, Set<string>>();

  // Les pièces se recoupent largement d'un programme à l'autre : on les
  // fusionne pour ne pas répéter dix fois la même démarche.
  for (const match of matches.slice(0, 8)) {
    const entry = match.slug ? catalogEntry(match.slug) : null;
    if (!entry) continue;

    for (const doc of entry.required_documents as RequiredDocument[]) {
      const set = byKind.get(doc.service) ?? new Set<string>();
      set.add(doc.label);
      byKind.set(doc.service, set);
    }
  }

  // Ordre de réalisation, pas ordre alphabétique : c'est l'enchaînement qui
  // fait rater les échéances quand on l'ignore.
  const ORDER: ServiceKind[] = [
    "etat-civil",
    "passeport",
    "legalisation",
    "traduction",
    "apostille",
    "langue",
    "medical",
    "photo",
    "financier",
    "visa",
  ];

  return ORDER.filter((kind) => byKind.has(kind)).map((kind) => ({
    kind,
    documents: [...(byKind.get(kind) ?? [])],
    providers: servicesOfKind(kind),
  }));
}

/** Fiche d'un organisme ou partenaire, telle qu'imprimée dans le rapport. */
function ServiceBlock({ provider }: { provider: ServiceProvider }) {
  const isPartner = provider.nature === "partner";
  const pending = provider.status === "a_confirmer";

  return (
    <View style={s.serviceCard} wrap={false}>
      <View style={s.row}>
        <Text style={[s.serviceName, { flex: 1, paddingRight: 8 }]}>
          {pdfText(provider.name)}
        </Text>
        <Text style={isPartner ? s.badge : s.badgeMuted}>
          {isPartner ? "Partenaire" : "Demarche officielle"}
        </Text>
      </View>

      <Text style={{ fontSize: 8, color: MUTED, marginTop: 3 }}>
        {pdfText(provider.summary)}
      </Text>

      {provider.steps.map((step, index) => (
        <View key={step.label} style={s.step}>
          <Text style={s.stepNum}>{index + 1}.</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.stepText}>{pdfText(step.label)}</Text>
            {step.detail ? (
              <Text style={s.stepDetail}>{pdfText(step.detail)}</Text>
            ) : null}
          </View>
        </View>
      ))}

      {provider.bring.length > 0 ? (
        <View style={{ marginTop: 7 }}>
          <Text style={s.label}>A apporter</Text>
          {provider.bring.map((item) => (
            <Text key={item} style={{ fontSize: 8, color: MUTED, marginTop: 1 }}>
              — {pdfText(item)}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={[s.row, { marginTop: 9 }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={s.label}>Delai</Text>
          <Text style={s.metaValue}>{pdfText(provider.leadTime)}</Text>
        </View>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={s.label}>
            {isPartner ? "Frais de service" : "Frais officiels"}
          </Text>
          <Text style={s.metaValue}>
            {pdfText(
              (isPartner ? provider.serviceFee : provider.officialFee) ??
                "A confirmer",
            )}
          </Text>
        </View>
        <View style={{ flex: 1.3 }}>
          <Text style={s.label}>Ou</Text>
          <Text style={s.metaValue}>
            {pdfText(
              provider.address ??
                (provider.coverage.join(", ") || "Voir ci-dessus"),
            )}
          </Text>
        </View>
      </View>

      {provider.phone ? (
        <Text style={{ fontSize: 8, color: MUTED, marginTop: 4 }}>
          Contact : {pdfText(provider.phone)}
        </Text>
      ) : null}

      {provider.warning ? (
        <Text style={s.warn}>{pdfText(provider.warning)}</Text>
      ) : null}

      {pending ? (
        <Text style={{ fontSize: 7.5, color: FAINT, marginTop: 6, lineHeight: 1.45 }}>
          Coordonnees et tarifs en cours de referencement. La demarche
          officielle ci-dessus reste realisable par vous-meme.
        </Text>
      ) : null}
    </View>
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
  const documentGroups = buildDocumentGroups(matches);
  const coverCountry = pickCoverCountry(profile, matches);

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

        {coverCountry ? (
          <>
            <Image style={s.cover} src={countryImage(coverCountry, 900)} />
            <Text style={s.coverCaption}>
              {profile.target_countries.length === 1
                ? `Votre destination : ${pdfText(coverCountry)}`
                : `${pdfText(coverCountry)} — ${pdfText(inCountry(coverCountry))}, la destination ou vous avez le plus d'options`}
            </Text>
          </>
        ) : null}

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

      {/* Pages 5+ — Constitution du dossier, pièce par pièce */}
      <Shell page="Constitution du dossier" profileName={name}>
        <Text style={s.pageTitle}>Constituer votre dossier</Text>
        <Text style={s.lede}>
          Chaque pièce exigée, l&apos;organisme qui la délivre, la procédure
          exacte, ce qu&apos;il faut apporter, le délai et le coût. L&apos;ordre
          compte : la légalisation conditionne la traduction, qui conditionne
          l&apos;apostille.
        </Text>

        <View style={s.cardSoft}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
            Ne prenez pas les étapes dans le désordre
          </Text>
          <Text style={{ fontSize: 8.5, color: MUTED, marginTop: 3 }}>
            Faire traduire une pièce avant de l&apos;avoir fait légaliser oblige
            à tout refaire : le traducteur assermenté traduit aussi les cachets.
            C&apos;est l&apos;erreur qui coûte le plus de sessions.
          </Text>
        </View>

        {documentGroups.map((group) => (
          <View key={group.kind} wrap={false}>
            <Text style={s.docTitle}>{SERVICE_LABELS[group.kind]}</Text>
            {group.documents.map((doc) => (
              <Text key={doc} style={{ fontSize: 8.5, color: MUTED }}>
                — {pdfText(doc)}
              </Text>
            ))}
            {group.providers.map((provider) => (
              <ServiceBlock key={provider.id} provider={provider} />
            ))}
          </View>
        ))}
      </Shell>

      {/* Avertissement final */}
      <Shell page="Avertissement" profileName={name}>
        <Text style={s.pageTitle}>Ce que ce rapport engage</Text>

        <Text style={s.sectionTitle}>Sur les programmes</Text>
        <Text style={{ fontSize: 8.5, color: MUTED, lineHeight: 1.55 }}>
          Les montants, minima et dates de cloture refletent les sessions
          publiees au moment de la generation de ce rapport. Verifiez toujours
          l&apos;appel a candidatures officiel avant tout depot : les
          etablissements modifient leurs criteres sans preavis. Travis
          n&apos;est ni une universite, ni un consulat, ni un agent officiel
          d&apos;un programme de bourse : aucune admission, aucune bourse et
          aucun visa ne sont garantis.
        </Text>

        <Text style={s.sectionTitle}>Sur les démarches administratives</Text>
        <Text style={{ fontSize: 8.5, color: MUTED, lineHeight: 1.55 }}>
          Les procédures décrites sont celles publiées par les administrations
          compétentes. Les tarifs officiels et les délais varient d&apos;un
          guichet à l&apos;autre et dans le temps : renseignez-vous sur place
          avant de vous déplacer avec de l&apos;argent.
        </Text>

        <Text style={s.sectionTitle}>Sur les partenaires</Text>
        <Text style={{ fontSize: 8.5, color: MUTED, lineHeight: 1.55 }}>
          Les partenaires référencés interviennent sous leur propre
          responsabilité. Leurs frais de service s&apos;ajoutent aux frais
          officiels et ne sont jamais obligatoires : chaque démarche décrite
          dans ce rapport peut être accomplie par vous-même. Ne réglez aucune
          somme sans reçu.
        </Text>

        <Text style={s.sectionTitle}>Ce qui reste à votre charge</Text>
        <Bullet>
          Vérifier l&apos;exactitude des informations que vous avez déclarées :
          une moyenne surévaluée produit un diagnostic inexploitable.
        </Bullet>
        <Bullet>
          Confirmer chaque date auprès de la source officielle avant de vous
          engager financièrement.
        </Bullet>
        <Bullet>
          Conserver l&apos;original de chaque pièce : ne confiez jamais un
          document unique sans reçu nominatif.
        </Bullet>
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
