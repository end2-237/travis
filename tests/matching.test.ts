import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreScholarship, sortMatches } from "../src/lib/scoring.ts";
import type { Scholarship, ScoredScholarship } from "../src/types/database.ts";

const base: Scholarship = {
  id: "1", slug: "x", title: "X", country: "Turquie", institution: null,
  degree_levels: ["Master"], eligible_fields: ["Informatique"],
  min_gpa_20: 13, max_age: null, funding_coverage: "", deadline_month: "Février",
  language_requirements: "", annual_cost_xaf: 0, fully_funded: true,
  application_url: null, official_website: null, notes: null,
  is_active: true, created_at: "",
} as unknown as Scholarship;

const profil = {
  gpa_score: 14.25, current_degree: "Licence", field_of_study: "Informatique",
  max_budget_xaf: 3_000_000, target_countries: ["Turquie"], language_level: null,
};

test("une bourse intégrale devance une privée plus facile d'accès", () => {
  // Le cas réel qui avait motivé la refonte : un profil à 14,25 voyait une
  // université privée au seuil de 10/20 passer devant une bourse d'État.
  const bourseIntegrale = scoreScholarship(base, profil);
  const priveeFacile = scoreScholarship(
    { ...base, min_gpa_20: 10, annual_cost_xaf: 2_500_000, fully_funded: false },
    profil,
  );

  assert.ok(
    bourseIntegrale.fit_score > priveeFacile.fit_score,
    `la bourse intégrale (${bourseIntegrale.fit_score}) doit devancer la privée (${priveeFacile.fit_score})`,
  );
});

test("le reste à charge hors budget pénalise sans exclure", () => {
  const dansLeBudget = scoreScholarship(
    { ...base, fully_funded: false, annual_cost_xaf: 1_000_000 }, profil);
  const horsBudget = scoreScholarship(
    { ...base, fully_funded: false, annual_cost_xaf: 9_000_000 }, profil);

  assert.ok(dansLeBudget.fit_score > horsBudget.fit_score);
  assert.equal(horsBudget.within_budget, false);
  assert.ok(horsBudget.fit_score > 0, "un programme hors budget reste proposé, signalé comme tel");
});

test("une destination demandée prime sur une autre", () => {
  const demandee = scoreScholarship(base, profil);
  const ailleurs = scoreScholarship({ ...base, country: "Inde" }, profil);
  assert.ok(demandee.fit_score > ailleurs.fit_score);
  assert.equal(ailleurs.country_targeted, false);
});

test("le score reste dans 0–100 aux extrêmes", () => {
  const parfait = scoreScholarship({ ...base, min_gpa_20: 0 }, profil);
  const limite = scoreScholarship(
    { ...base, min_gpa_20: 14.25, fully_funded: false, annual_cost_xaf: 9_000_000, country: "Inde" },
    profil,
  );
  assert.ok(parfait.fit_score <= 100 && parfait.fit_score >= 0);
  assert.ok(limite.fit_score <= 100 && limite.fit_score >= 0);
});

test("la marge de moyenne ne renverse jamais le financement", () => {
  // Marge maximale sur une payante contre marge nulle sur une intégrale.
  const payanteLarge = scoreScholarship(
    { ...base, min_gpa_20: 0, fully_funded: false, annual_cost_xaf: 1_000_000 }, profil);
  const integraleJuste = scoreScholarship({ ...base, min_gpa_20: 14.25 }, profil);

  assert.ok(
    integraleJuste.fit_score >= payanteLarge.fit_score,
    `intégrale au seuil (${integraleJuste.fit_score}) ne doit pas passer derrière payante confortable (${payanteLarge.fit_score})`,
  );
});

test("le tri place les destinations demandées puis les bourses intégrales", () => {
  const liste = [
    { ...base, slug: "privee-ciblee", country: "Turquie", fully_funded: false, min_gpa_20: 10, annual_cost_xaf: 1_000_000 },
    { ...base, slug: "integrale-ailleurs", country: "Inde" },
    { ...base, slug: "integrale-ciblee", country: "Turquie" },
    { ...base, slug: "privee-ailleurs", country: "Inde", fully_funded: false, min_gpa_20: 10, annual_cost_xaf: 1_000_000 },
  ].map((s) => scoreScholarship(s, profil)) as ScoredScholarship[];

  const ordre = sortMatches(liste).map((m) => m.slug);

  assert.deepEqual(ordre, [
    "integrale-ciblee",   // destination demandée + intégrale
    "privee-ciblee",      // destination demandée
    "integrale-ailleurs", // intégrale
    "privee-ailleurs",
  ]);
});
