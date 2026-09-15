# Travis

Moteur SaaS d'admissibilité académique et d'orientation internationale.
L'étudiant évalue gratuitement son profil, consulte **l'intégralité** des
programmes compatibles — noms, montants, échéances, procédure et liens
officiels — puis emporte sa feuille de route en PDF pour **500 FCFA** via
Mobile Money / Orange Money.

> **Ce qui est payant, et ce qui ne l'est pas.** L'information est gratuite :
> rien n'est masqué derrière le paiement. Les 500 FCFA achètent la mise en
> forme — un document imprimable, transmissible et consultable hors ligne,
> avec un calendrier construit à rebours des clôtures réelles du candidat.
> Ce choix est l'inverse du modèle « teaser » du SRS initial, et il est
> délibéré : on ne fait pas payer pour voir, on fait payer pour emporter.

---

## Stack

| Couche | Choix |
| --- | --- |
| Framework | Next.js 16 — App Router, Server Actions, TypeScript |
| Styles | Tailwind CSS v4 (tokens CSS-first), primitives type Shadcn |
| Base de données | Supabase / PostgreSQL avec Row Level Security |
| Génération PDF | `@react-pdf/renderer` (rendu serveur, sans navigateur headless) |
| Paiement | Monetbil ou PayUnit, via webhook signé |
| Livraison | Supabase Storage + URL signée, notification WhatsApp Cloud API |
| Déploiement | Image Docker construite par GitHub Actions, publiée sur GHCR |

> Le SRS proposait Puppeteer ou `@react-pdf/renderer` pour le PDF.
> `@react-pdf/renderer` a été retenu : pas de Chromium dans l'image (~400 Mo
> économisés), pas de `--no-sandbox`, et un rendu déterministe.

---

## Démarrage

```bash
npm install
cp .env.example .env.local   # optionnel : voir « Mode démonstration »
npm run dev
```

L'application écoute sur <http://localhost:3000>.

### Mode démonstration

Sans variables Supabase, l'application **fonctionne quand même** : catalogue
local réduit (18 programmes), profils en mémoire et paiement simulé. Le
parcours complet — évaluation, score, tunnel de paiement, PDF — est donc
démontrable sans aucune infrastructure. Dès que `NEXT_PUBLIC_SUPABASE_URL` et
`SUPABASE_SERVICE_ROLE_KEY` sont présentes, tout bascule sur PostgreSQL.

---

## Base de données

```bash
# Via la CLI Supabase
supabase db push                                       # migrations
psql "$DATABASE_URL" -f supabase/seed.sql              # 50 programmes
psql "$DATABASE_URL" -f supabase/seed-partners.sql     # emplacements partenaires
```

- `supabase/migrations/20260101000000_init.sql` — `scholarships`,
  `student_profiles`, `orders`, index, RLS et bucket `reports`.
- `supabase/migrations/20260201000000_catalog_details.sql` — `slug` et
  `official_website`, pour les fiches détaillées.
- `supabase/seed.sql` — **fichier généré**, ne pas éditer à la main.

### Le catalogue

`src/data/programs.ts` est la source de vérité du contenu : 50 programmes,
chacun avec son site officiel vérifié, ce que la bourse couvre, ce qu'elle
laisse à charge, et son mode de sélection. `src/data/countries.ts` porte les
faits partagés par destination (visa, logement, coût de la vie, rentrées),
énoncés une fois pour rester cohérents d'une fiche à l'autre.

```bash
npm run seed:generate   # régénère supabase/seed.sql depuis le catalogue
```

La base et le mode démonstration servent donc exactement le même contenu.

### Row Level Security

- `scholarships` : lecture publique des lignes actives.
- `student_profiles` et `orders` : **aucune politique** — donc aucun accès avec
  une clé `anon` ou `authenticated`. Toutes les écritures passent par les
  Server Actions et les webhooks, qui utilisent la clé `service_role`
  (laquelle contourne RLS). La clé de service ne doit jamais atteindre le
  navigateur : elle n'est lue que dans `src/lib/supabase/admin.ts`, protégé par
  `server-only`.

---

## Parcours utilisateur

| Étape | Route | Ce qui se passe |
| --- | --- | --- |
| 1 | `/evaluation` | Formulaire en 3 écrans : identité & contact, parcours académique, objectifs & budget. Validation Zod à chaque écran. |
| 2 | Server Action | Profil persisté, puis moteur de matching (moyenne ≥ minimum, niveau visé, filière éligible) et scoring 0–100. |
| 3 | `/resultats/[profileId]` | **Tout est visible** : chaque programme retenu est nommé, chiffré, daté et relié à son site officiel. |
| 3 bis | `/destinations/[slug]` | Fiche complète du programme : couverture, budget réel, logement, procédure, pièces, visa, lien officiel. |
| 4 | `/api/checkout` | Ouverture du tunnel Mobile Money à 500 FCFA, création de la commande `PENDING`. |
| 5 | `/api/webhooks/payment` | Signature vérifiée → commande `SUCCESS` → PDF généré et stocké → lien WhatsApp envoyé. |
| 6 | `/telechargement/[orderId]` | Téléchargement par URL signée valable une heure. |

### Moteur de matching

`src/lib/matching.ts` applique la requête d'admissibilité du SRS :

```ts
supabase
  .from("scholarships")
  .select("*")
  .lte("min_gpa_20", userGpa)
  .overlaps("degree_levels", targetDegrees)
  .contains("eligible_fields", [userField]);
```

`targetDegrees` est déduit du dernier diplôme obtenu : un titulaire de Licence
vise un Master tout en restant éligible aux programmes de Licence. Le score de
compatibilité combine marge de moyenne (45 pts), budget (30), pays visé (15) et
financement intégral (10).

### Pages partenaires

- `/partenaires` — vitrine pour les candidats : l'annuaire des services, filtrable
  par type et par nature (voie officielle ou partenaire), dans l'ordre de
  réalisation du dossier.
- `/devenir-partenaire` — acquisition : ce que Travis apporte, ce qu'il attend,
  le modèle de commission, et le formulaire de candidature.

Une candidature n'est **jamais publiée automatiquement** : elle est enregistrée
dans `partner_applications` pour examen. Un référencement libre exposerait des
coordonnées non vérifiées à des candidats qui s'y déplaceraient.

### Matière visuelle

Le rendu « hi-fi » est obtenu **sans WebGL**, et c'est un choix mesuré : ajouter
Three.js coûterait 281 ko gzip sur une page d'accueil qui en pèse 502 au total,
sur un public souvent en 3G et sur forfait. Tout tient en CSS, donc sur le
compositeur, hors du thread principal :

| Effet | Mécanique | Coût JS |
| --- | --- | --- |
| Grain argentique | `feTurbulence` SVG inline en overlay | 0 |
| Dégradé vivant | 3 halos radiaux animés via `@property` | 0 |
| Ressort | `linear()` échantillonnant une courbe amortie | 0 |
| Bandeau défilant | contenu dupliqué, translation -50 % | 0 |
| Séquence numérotée | `position: sticky` | 0 |
| Fil de progression | `animation-timeline: scroll(root)` | 0 |
| Phrase qui s'allume mot à mot | `animation-timeline: view()` + `--w` par mot | 0 |
| Titre dont les mots se relèvent | masque `overflow: hidden` + `translateY` décalé | 0 |
| Balayage de lumière | `::after` translaté au survol | 0 |

Le défilement sert de chronologie au navigateur, qui échantillonne sur le
compositeur : aucun écouteur de `scroll`, aucun calcul par frame. Mesuré à
390 px après cette passe : **513 ko au total, dont 275 ko de JavaScript** —
soit exactement le même JavaScript qu'avant, tout le mouvement ajouté étant
du CSS et des composants serveur.

Deux garde-fous tiennent la lisibilité :

- chaque effet non pris en charge est enfermé dans un `@supports`, et l'état
  par défaut est l'état **lisible** — jamais l'état masqué ;
- le plancher d'opacité des mots non encore « lus » est à 0,24 et non à zéro :
  quelqu'un qui arrive par une ancre au milieu de la page peut lire la phrase.

`prefers-reduced-motion` neutralise l'ensemble, et `@media print` aussi.

### Visuels

Trois tables, une règle commune : **aucune image n'est posée sans avoir été
ouverte et regardée.**

| Table | Ce qu'elle associe |
| --- | --- |
| `src/data/images.ts` | un pays → sa photo (pas de rotation arbitraire : le Colisée sur une fiche marocaine décrédibilise le catalogue) |
| `src/data/service-images.ts` | un type de démarche → sa photo d'en-tête |
| `src/lib/content.ts` (`IMG`) | les visuels de l'accueil, chacun avec son texte alternatif |

Deux conséquences pratiques :

- **Le texte alternatif décrit la photo, jamais un lieu.** « Un passeport posé
  sur une carte du monde », pas « le bureau des passeports de Douala ». Une
  photo d'illustration qui se fait passer pour une façade envoie un candidat
  chercher un bâtiment qui n'existe pas.
- **Deviner un identifiant Unsplash ne suffit pas.** Sur 60 identifiants
  essayés pendant le référencement des démarches, la plupart résolvaient bien
  — mais vers deux pandas, un skateur et une enceinte connectée. Chaque
  identifiant retenu a été téléchargé et affiché avant d'entrer dans le code.

### Services et partenaires

`src/data/services.ts` décrit chaque service nécessaire au dossier
d'immigration : état civil, légalisation, traduction assermentée, apostille,
certification de langue, passeport, santé, photos, justificatifs financiers et
accompagnement consulaire. Chaque entrée porte sa procédure pas à pas, ce
qu'il faut apporter, le délai, les frais et le piège fréquent.

Deux natures cohabitent, et la distinction est visible dans l'interface :

- `institution` — organisme public ou centre agréé. La procédure décrite est
  celle publiée par l'administration, valable sans accord commercial.
- `partner` — partenaire commercial Travis. Tant que `status` vaut
  `a_confirmer`, l'interface annonce le service **sans afficher d'adresse ni
  de tarif** : un candidat ne doit jamais se déplacer sur la foi d'une donnée
  non vérifiée.

Pour référencer un partenaire : renseigner les champs de contact et de tarif
dans `src/data/services.ts`, puis passer `status` à `"actif"`. Rien d'autre à
modifier — la fiche de destination, la page de résultats et le PDF s'alimentent
de la même source.

Chaque pièce du dossier est rattachée à un service via
`src/data/procedure.ts`, ce qui permet d'afficher le bon interlocuteur en
regard du bon document, au moment où le candidat en a besoin.

### Évaluation ciblée

Depuis la fiche d'un programme, `/evaluation?program=<slug>` produit un verdict
critère par critère sur cette seule opportunité — moyenne, niveau, filière,
budget, langue — **y compris lorsque le candidat n'est pas éligible** : c'est
précisément là qu'il a besoin de savoir ce qui bloque et ce qu'il peut y faire.
Les autres options compatibles suivent.

### Priorité aux destinations demandées

Les pays cochés passent devant, dans leur propre bloc. Le score de
compatibilité ne départage qu'à l'intérieur de chaque groupe : un candidat qui
a demandé la Turquie ne doit pas trouver l'Inde en tête parce qu'il y a une
meilleure marge de moyenne. Le score global ne retient que les destinations
visées quand il y en a.

### Back-office

`/admin` — vue d'ensemble, partenaires, destinations, finances.

| Vue | Ce qu'elle montre |
| --- | --- |
| Vue d'ensemble | CA, visites, évaluations, conversion, demande par destination |
| Partenaires | Édition des partenaires commerciaux ; les démarches officielles restent en lecture seule |
| Destinations | Demande confrontée à l'offre du catalogue, et fiches les plus consultées |
| Finances | CA sur 30 / 90 jours, moyenne journalière, transactions, taux d'échec |

**Accès.** Cookie signé HMAC, session de 8 heures, httpOnly. Deux variables
sont requises, sans quoi `/admin` affiche une page d'installation et reste
fermé :

```bash
ADMIN_PASSWORD=<un mot de passe long>
ADMIN_SESSION_SECRET=$(openssl rand -hex 32)
```

Le middleware ne vérifie que la présence du cookie — `node:crypto` n'existe pas
sur l'edge runtime. La signature et l'expiration sont vérifiées dans
`src/app/admin/(protege)/layout.tsx`, côté Node, et de nouveau dans chaque
Server Action : une action est un point d'entrée HTTP à part entière, appelable
sans passer par la page.

> Limite assumée : un seul compte, partagé, sans traçabilité par personne. Pour
> plusieurs administrateurs aux droits distincts, il faudra passer à Supabase
> Auth et une table de rôles.

**Audience.** `analytics_events` enregistre un événement par page vue.
Volontairement sans cookie ni identifiant stable : `visitor_hash` est une
empreinte journalière non réversible (sel + date + IP + agent), suffisante pour
ne pas compter dix fois la même visite, inutilisable pour suivre quelqu'un d'un
jour sur l'autre. Ni l'IP ni l'agent ne sont stockés, et le référent n'est
conservé que par domaine.

**Graphiques.** SVG écrit à la main (`src/components/admin/charts.tsx`), sans
librairie. Palette validée pour la vision des couleurs — `#2a78d6` / `#eb6834`,
ΔE CVD 24,7. Une série n'a pas de légende, deux séries en ont toujours une.

### Mouvement

Pas de librairie d'animation : `src/components/motion/` fournit `Reveal`
(IntersectionObserver), `Parallax` (rAF, actif seulement à l'écran),
`CountUp`, et `ScrollWords` / `WordRise` — deux composants **serveur** qui ne
font que découper une phrase en mots numérotés, la feuille de style faisant
le reste. L'état masqué des blocs révélés est porté par une règle CSS
conditionnée à `data-js="on"` — sans JavaScript, à l'impression, ou pour un
robot d'indexation, **le contenu reste visible**. Une page qui existe pour
informer ne doit pas pouvoir disparaître à cause d'une animation.
`prefers-reduced-motion` neutralise l'ensemble.

### Rapport PDF

11 à 13 pages selon le nombre de correspondances :

1. Synthèse du profil et audit d'admissibilité
2. – 3. Programmes recommandés, chiffrés et classés, avec l'appel officiel
4. Calendrier des démarches mois par mois, calculé à rebours des clôtures réelles
5. – 12. Constitution du dossier, pièce par pièce : l'organisme qui la délivre,
   la procédure exacte, ce qu'il faut apporter, le délai, les frais officiels
   et, le cas échéant, le partenaire Travis et ses frais de service
13. Avertissements — sur les programmes, sur les démarches, sur les partenaires

Le rapport s'ouvre sur le titre, la synthèse du profil, puis **l'image de la
destination visée** : celle cochée quand il n'y en a qu'une, sinon celle où le
candidat a le plus d'options, et à défaut le pays de la meilleure
correspondance.

L'instantané du matching est figé sur la commande (`orders.match_snapshot`) :
le rapport reste reproductible même si le catalogue évolue après le paiement.

---

## Paiement

`PAYMENT_PROVIDER` vaut `monetbil`, `payunit`, ou reste vide (mode démonstration).

Les deux adaptateurs vérifient l'authenticité de la notification avant toute
écriture — signature MD5 pour Monetbil, secret partagé comparé en temps
constant pour PayUnit. Une notification non signée est rejetée en 401.

> **À vérifier avant la mise en production :** confrontez le format exact de
> la notification (noms de champs, calcul de signature) à la documentation en
> vigueur de votre agrégateur. Les adaptateurs suivent les schémas publiés,
> mais ces API évoluent.

Le traitement est idempotent : un webhook rejoué ne régénère pas le rapport et
ne facture rien deux fois.

---

## Déploiement

Le build tourne **sur GitHub**, pas sur le VPS.

- `.github/workflows/ci.yml` — lint, typecheck, build et test de démarrage à
  chaque push et pull request sur `main`.
- `.github/workflows/docker.yml` — image multi-stage construite et publiée sur
  `ghcr.io/end2-237/travis`, avec cache de couches GitHub.

Sur le serveur, il n'y a plus qu'à tirer l'image :

```bash
docker compose pull && docker compose up -d
```

### Variables à déclarer dans le dépôt

Les variables `NEXT_PUBLIC_*` sont inlinées dans le bundle client : elles
doivent être présentes **au build**, donc déclarées côté GitHub.

| Type | Nom |
| --- | --- |
| Variables (`vars`) | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` |
| Secrets | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Les secrets serveur (`SUPABASE_SERVICE_ROLE_KEY`, clés agrégateur, jeton
WhatsApp) ne sont **pas** nécessaires au build : ils se déclarent uniquement
sur le VPS, dans le `.env` lu par `docker-compose.yml`.

---

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (sortie `standalone`) |
| `npm start` | Sert le build — en local, préférez `node .next/standalone/server.js` |
| `npm run typecheck` | `tsc --noEmit` |
| `npx eslint .` | Lint |

---

## Arborescence

```
src/
├── app/
│   ├── page.tsx                       landing (design de référence)
│   ├── evaluation/                    formulaire en 3 écrans
│   ├── resultats/[profileId]/         teaser gratuit, noms masqués
│   ├── telechargement/[orderId]/      livraison du rapport
│   └── api/
│       ├── checkout/                  ouverture du paiement 500 FCFA
│       ├── webhooks/payment/          notification signée de l'agrégateur
│       └── orders/[orderId]/pdf/      rendu du rapport à la volée
├── components/{site,evaluation,checkout,ui}/
├── lib/
│   ├── matching.ts                    moteur d'admissibilité et scoring
│   ├── payments/                      Monetbil, PayUnit, mode démonstration
│   ├── pdf/                           document, checklist, calendrier
│   └── supabase/                      clients navigateur et service_role
├── server/                            Server Actions et accès aux données
└── types/database.ts
```
