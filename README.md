# Travis

Moteur SaaS d'admissibilité académique et d'orientation internationale.
L'étudiant évalue gratuitement son profil, puis débloque une feuille de route
stratégique complète en PDF pour **500 FCFA** via Mobile Money / Orange Money.

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
supabase db push                                  # migrations
psql "$DATABASE_URL" -f supabase/seed.sql         # 50 bourses majeures
```

- `supabase/migrations/20260101000000_init.sql` — `scholarships`,
  `student_profiles`, `orders`, index, RLS et bucket `reports`.
- `supabase/seed.sql` — 50 programmes récurrents, idempotent.

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
| 3 | `/resultats/[profileId]` | Teaser **gratuit** : score global, volumes et régions. Les noms des programmes restent masqués. |
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

### Rapport PDF

5 à 8 pages selon le nombre de correspondances :

1. Synthèse du profil et audit d'admissibilité
2. – 3. Programmes recommandés, chiffrés et classés
4. Calendrier des démarches mois par mois, calculé à rebours des clôtures réelles
5. Checklist documentaire (légalisation, traduction assermentée) et référents

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
