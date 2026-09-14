"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Input, Select, FieldError, FieldLabel } from "@/components/ui/field";
import {
  BUDGET_BRACKETS,
  COUNTRIES,
  DEGREES,
  FIELDS,
  LANGUAGE_LEVELS,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import {
  parseGpa,
  stepAcademicSchema,
  stepGoalsSchema,
  stepIdentitySchema,
} from "@/lib/validation";
import { catalogEntry } from "@/data/catalog";
import { submitEvaluation, type EvaluationState } from "@/server/evaluation";

const STEPS = [
  { title: "Identité & contact", hint: "Pour recevoir votre rapport" },
  { title: "Parcours académique", hint: "Votre niveau réel" },
  { title: "Objectifs & budget", hint: "Vos contraintes" },
] as const;

const initialState: EvaluationState = { status: "idle" };

export function StepperForm() {
  const params = useSearchParams();
  const [state, formAction, pending] = useActionState(
    submitEvaluation,
    initialState,
  );

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [values, setValues] = useState(() => ({
    full_name: "",
    phone_number: "",
    city: "",
    current_degree: params.get("degree") ?? "",
    field_of_study: params.get("field") ?? "",
    gpa_score: params.get("gpa") ?? "",
    max_budget_xaf: params.get("budget") ?? "",
    language_level: "",
  }));

  // Évaluation ciblée : le programme visé est transmis par la fiche détaillée.
  const focusSlug = params.get("program") ?? "";
  const focus = focusSlug ? catalogEntry(focusSlug) : null;

  const [countries, setCountries] = useState<string[]>(() =>
    focus ? [focus.country] : [],
  );

  // Les erreurs saisies localement prévalent sur celles remontées par l'action.
  const allErrors = useMemo(
    () => ({
      ...(state.status === "error" ? (state.fieldErrors ?? {}) : {}),
      ...errors,
    }),
    [state, errors],
  );

  function set(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function toggleCountry(country: string) {
    setCountries((list) =>
      list.includes(country)
        ? list.filter((c) => c !== country)
        : list.length >= 6
          ? list
          : [...list, country],
    );
  }

  /** Valide l'écran courant avant d'autoriser le passage au suivant. */
  function goNext() {
    const collected: Record<string, string> = {};

    if (step === 0) {
      const result = stepIdentitySchema.safeParse({
        full_name: values.full_name,
        phone_number: values.phone_number,
        city: values.city,
      });
      if (!result.success) {
        for (const issue of result.error.issues) {
          collected[String(issue.path[0])] ??= issue.message;
        }
      }
    }

    if (step === 1) {
      const result = stepAcademicSchema.safeParse({
        current_degree: values.current_degree,
        field_of_study: values.field_of_study,
        gpa_score: parseGpa(values.gpa_score) ?? Number.NaN,
      });
      if (!result.success) {
        for (const issue of result.error.issues) {
          collected[String(issue.path[0])] ??= issue.message;
        }
      }
    }

    if (Object.keys(collected).length > 0) {
      setErrors(collected);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function validateFinal(event: React.FormEvent<HTMLFormElement>) {
    const result = stepGoalsSchema.safeParse({
      target_countries: countries,
      max_budget_xaf: Number(values.max_budget_xaf),
      language_level: values.language_level,
    });
    if (!result.success) {
      event.preventDefault();
      const collected: Record<string, string> = {};
      for (const issue of result.error.issues) {
        collected[String(issue.path[0])] ??= issue.message;
      }
      setErrors(collected);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      {/* Progression */}
      <ol className="flex gap-3 lg:flex-col lg:gap-6">
        {STEPS.map((item, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={item.title} className="flex flex-1 items-start gap-3">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-medium transition-colors",
                  done && "border-transparent bg-ink text-white",
                  active && "border-ink bg-white text-ink",
                  !done && !active && "border-line bg-white text-ink-faint",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="hidden min-w-0 lg:block">
                <span
                  className={cn(
                    "block text-[12.5px] font-medium",
                    active || done ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {item.title}
                </span>
                <span className="block text-[11px] text-ink-faint">
                  {item.hint}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <form
        action={formAction}
        onSubmit={validateFinal}
        className="rounded-panel bg-white p-5 shadow-card md:p-8"
      >
        {/* Champs conservés hors de l'écran courant */}
        <HiddenValues values={values} countries={countries} step={step} />
        {focus ? (
          <input type="hidden" name="focus_program" value={focus.slug} />
        ) : null}

        {focus ? (
          <div className="mb-6 rounded-card border border-line bg-surface-soft p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Évaluation ciblée
            </p>
            <p className="mt-1.5 text-[13px] font-semibold leading-[1.35]">
              {focus.title}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              {focus.institution} · {focus.country} · seuil{" "}
              {focus.min_gpa_20.toFixed(2).replace(".", ",")}/20
            </p>
            <p className="mt-2.5 text-[11px] leading-[1.55] text-ink-faint">
              Vous obtiendrez un verdict critère par critère sur ce programme,
              puis les autres options compatibles avec votre profil.
            </p>
          </div>
        ) : null}

        <p className="text-[11px] text-ink-faint lg:hidden">
          Étape {step + 1} sur {STEPS.length}
        </p>
        <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] md:text-[24px]">
          {STEPS[step].title}
        </h2>

        {step === 0 ? (
          <div className="mt-6 grid gap-4">
            <label className="block">
              <FieldLabel>Nom complet</FieldLabel>
              <Input
                name="full_name"
                value={values.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="ex. Aïcha Nkoulou"
                autoComplete="name"
              />
              <FieldError>{allErrors.full_name}</FieldError>
            </label>

            <label className="block">
              <FieldLabel hint="Le rapport y sera envoyé">
                Numéro WhatsApp
              </FieldLabel>
              <Input
                name="phone_number"
                value={values.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
                placeholder="+237 6 99 00 11 22"
                inputMode="tel"
                autoComplete="tel"
              />
              <FieldError>{allErrors.phone_number}</FieldError>
            </label>

            <label className="block">
              <FieldLabel>Ville de résidence</FieldLabel>
              <Input
                name="city"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="ex. Douala"
                autoComplete="address-level2"
              />
              <FieldError>{allErrors.city}</FieldError>
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-6 grid gap-4">
            <label className="block">
              <FieldLabel>Dernier diplôme obtenu</FieldLabel>
              <Select
                name="current_degree"
                value={values.current_degree}
                onChange={(e) => set("current_degree", e.target.value)}
              >
                <option value="">Sélectionner…</option>
                {DEGREES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <FieldError>{allErrors.current_degree}</FieldError>
            </label>

            <label className="block">
              <FieldLabel>Filière exacte</FieldLabel>
              <Select
                name="field_of_study"
                value={values.field_of_study}
                onChange={(e) => set("field_of_study", e.target.value)}
              >
                <option value="">Sélectionner…</option>
                {FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
              <FieldError>{allErrors.field_of_study}</FieldError>
            </label>

            <label className="block">
              <FieldLabel hint="Précision au centième">
                Moyenne générale sur 20
              </FieldLabel>
              <Input
                name="gpa_score"
                value={values.gpa_score}
                onChange={(e) => set("gpa_score", e.target.value)}
                placeholder="ex. 12,75"
                inputMode="decimal"
              />
              <FieldError>{allErrors.gpa_score}</FieldError>
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 grid gap-5">
            <div>
              <FieldLabel hint={`${countries.length}/6 sélectionnés`}>
                Pays ciblés
              </FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map((country) => {
                  const selected = countries.includes(country);
                  return (
                    <button
                      key={country}
                      type="button"
                      onClick={() => toggleCountry(country)}
                      aria-pressed={selected}
                      className={cn(
                        "h-8 rounded-full border px-3 text-[11.5px] transition-colors",
                        selected
                          ? "border-transparent bg-ink text-white"
                          : "border-line bg-white text-ink-muted hover:text-ink",
                      )}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-ink-faint">
                Laissez vide pour explorer toutes les destinations.
              </p>
              <FieldError>{allErrors.target_countries}</FieldError>
            </div>

            <label className="block">
              <FieldLabel>Budget maximal disponible par an</FieldLabel>
              <Select
                name="max_budget_xaf"
                value={values.max_budget_xaf}
                onChange={(e) => set("max_budget_xaf", e.target.value)}
              >
                <option value="">Sélectionner…</option>
                {BUDGET_BRACKETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
              <FieldError>{allErrors.max_budget_xaf}</FieldError>
            </label>

            <label className="block">
              <FieldLabel>Niveau de langue</FieldLabel>
              <Select
                name="language_level"
                value={values.language_level}
                onChange={(e) => set("language_level", e.target.value)}
              >
                <option value="">Sélectionner…</option>
                {LANGUAGE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
              <FieldError>{allErrors.language_level}</FieldError>
            </label>
          </div>
        ) : null}

        {state.status === "error" && !state.fieldErrors ? (
          <p className="mt-5 rounded-field border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
            {state.message}
          </p>
        ) : null}

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex h-11 items-center gap-1.5 rounded-btn px-3 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-1.5 rounded-btn px-3 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink px-6 text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
            >
              Continuer
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink px-6 text-[13px] font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours…
                </>
              ) : (
                <>
                  Voir mon admissibilité
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

        <p className="mt-5 flex items-center gap-1.5 text-[11px] text-ink-faint">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
          Évaluation gratuite. Aucun paiement requis à cette étape.
        </p>
      </form>
    </div>
  );
}

/**
 * Les écrans masqués ne montent pas leurs champs : on réinjecte les valeurs
 * saisies sous forme de champs cachés pour que la soumission reste complète.
 */
function HiddenValues({
  values,
  countries,
  step,
}: {
  values: Record<string, string>;
  countries: string[];
  step: number;
}) {
  const hiddenByStep: Record<number, string[]> = {
    0: ["current_degree", "field_of_study", "gpa_score", "max_budget_xaf", "language_level"],
    1: ["full_name", "phone_number", "city", "max_budget_xaf", "language_level"],
    2: ["full_name", "phone_number", "city", "current_degree", "field_of_study", "gpa_score"],
  };

  return (
    <>
      {hiddenByStep[step].map((key) => (
        <input key={key} type="hidden" name={key} value={values[key] ?? ""} />
      ))}
      {countries.map((country) => (
        <input
          key={country}
          type="hidden"
          name="target_countries"
          value={country}
        />
      ))}
    </>
  );
}
