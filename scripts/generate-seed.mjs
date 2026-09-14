/**
 * Génère supabase/seed.sql depuis src/data/programs.ts.
 * Le catalogue TypeScript est la source de vérité : la base et le mode
 * démonstration servent ainsi exactement le même contenu.
 *
 *   node scripts/generate-seed.mjs
 */
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Node 22 dépouille les annotations de type à la volée : on importe le
// catalogue tel quel plutôt que d'en parser le littéral.
const { PROGRAMS: programs } = await import(
  pathToFileURL("src/data/programs.ts").href
);

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const arr = (items) => `ARRAY[${items.map(q).join(",")}]::text[]`;
const nullable = (v) => (v === null || v === undefined ? "NULL" : v);

const rows = programs.map(
  (p) =>
    `  (${q(p.slug)}, ${q(p.title)}, ${q(p.country)}, ${q(p.institution)}, ` +
    `${arr(p.degree_levels)}, ${arr(p.eligible_fields)}, ${p.min_gpa_20.toFixed(2)}, ` +
    `${nullable(p.max_age)}, ${q(p.funding_coverage)}, ${q(p.deadline_month)}, ` +
    `${q(p.language_requirements)}, ${p.annual_cost_xaf}, ${p.fully_funded}, ` +
    `${q(p.official_website)}, ${q(p.official_website)}, ${q(p.summary)})`,
);

const sql = `-- =====================================================================
-- Travis — Seed du catalogue (${programs.length} programmes)
--
-- FICHIER GÉNÉRÉ — ne pas éditer à la main.
-- Source : src/data/programs.ts · Régénérer : node scripts/generate-seed.mjs
--
-- Idempotent : relançable sans dupliquer de ligne (clé = slug).
-- =====================================================================

insert into public.scholarships
  (slug, title, country, institution, degree_levels, eligible_fields,
   min_gpa_20, max_age, funding_coverage, deadline_month,
   language_requirements, annual_cost_xaf, fully_funded,
   application_url, official_website, notes)
values
${rows.join(",\n")}
on conflict (slug) do update set
  title                 = excluded.title,
  country               = excluded.country,
  institution           = excluded.institution,
  degree_levels         = excluded.degree_levels,
  eligible_fields       = excluded.eligible_fields,
  min_gpa_20            = excluded.min_gpa_20,
  max_age               = excluded.max_age,
  funding_coverage      = excluded.funding_coverage,
  deadline_month        = excluded.deadline_month,
  language_requirements = excluded.language_requirements,
  annual_cost_xaf       = excluded.annual_cost_xaf,
  fully_funded          = excluded.fully_funded,
  application_url       = excluded.application_url,
  official_website      = excluded.official_website,
  notes                 = excluded.notes;
`;

writeFileSync("supabase/seed.sql", sql);
console.log(`✓ supabase/seed.sql régénéré — ${programs.length} programmes`);
