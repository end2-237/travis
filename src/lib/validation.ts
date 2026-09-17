import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { COUNTRIES, DEGREES, FIELDS, LANGUAGE_LEVELS } from "@/lib/taxonomy";

/**
 * Numéro Mobile Money d'Afrique centrale et de l'Ouest.
 *
 * La validation délègue à `normalizePhone`, qui accepte les formats
 * réellement saisis — « 699001122 », « +237 6 99 00 11 22 », « 00237… » —
 * et renvoie la forme canonique. Le schéma **transforme** : tout ce qui est
 * en aval, base de données comme agrégateur de paiement, reçoit un numéro
 * déjà normalisé, jamais la frappe brute.
 *
 * L'expression régulière précédente n'autorisait qu'un seul séparateur :
 * elle refusait le format que son propre message donnait en exemple, à la
 * première étape du tunnel.
 */
const phoneSchema = z
  .string()
  .trim()
  .min(8, "Numéro trop court")
  .max(25, "Numéro trop long")
  .transform((value, ctx) => {
    const parsed = normalizePhone(value);
    if (!parsed) {
      ctx.addIssue({
        code: "custom",
        message:
          "Numéro Mobile Money invalide. Exemples acceptés : 699 00 11 22, +237 6 99 00 11 22, 00237699001122.",
      });
      return z.NEVER;
    }
    return parsed.e164;
  })

export const stepIdentitySchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Indiquez votre nom complet")
    .max(120, "Nom trop long"),
  phone_number: phoneSchema,
  city: z.string().trim().min(2, "Indiquez votre ville").max(80),
});

export const stepAcademicSchema = z.object({
  current_degree: z.enum(DEGREES, {
    message: "Sélectionnez votre dernier diplôme",
  }),
  field_of_study: z.enum(FIELDS, { message: "Sélectionnez votre filière" }),
  gpa_score: z
    .number({ message: "Saisissez votre moyenne" })
    .min(0, "La moyenne ne peut pas être négative")
    .max(20, "La moyenne est notée sur 20"),
});

export const stepGoalsSchema = z.object({
  target_countries: z
    .array(z.enum(COUNTRIES))
    .max(6, "Six destinations au maximum"),
  max_budget_xaf: z
    .number({ message: "Sélectionnez une enveloppe budgétaire" })
    .min(0, "Budget invalide")
    .max(100_000_000, "Budget invalide"),
  language_level: z.enum(LANGUAGE_LEVELS, {
    message: "Sélectionnez votre niveau de langue",
  }),
});

export const evaluationSchema = stepIdentitySchema
  .extend(stepAcademicSchema.shape)
  .extend(stepGoalsSchema.shape)
  .extend({
    /** Type d'offre choisi sur la carte d'accueil. */
    visee: z
      .enum(["bourse", "universite"])
      .optional()
      .catch(undefined),
    /** Slug du programme quand l'évaluation cible une seule opportunité. */
    focus_program: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  });

export type EvaluationInput = z.infer<typeof evaluationSchema>;
export type StepIdentityInput = z.infer<typeof stepIdentitySchema>;
export type StepAcademicInput = z.infer<typeof stepAcademicSchema>;
export type StepGoalsInput = z.infer<typeof stepGoalsSchema>;

export const checkoutSchema = z.object({
  profile_id: z.uuid("Profil introuvable"),
  phone_number: phoneSchema,
  operator: z.enum(["MTN", "ORANGE"], {
    message: "Choisissez un opérateur Mobile Money",
  }),
});

/** Convertit « 12,75 » ou « 12.75 » en 12.75. */
export function parseGpa(raw: string): number | null {
  const normalized = raw.replace(",", ".").trim();
  if (normalized === "") return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}
