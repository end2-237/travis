import { z } from "zod";
import { COUNTRIES, DEGREES, FIELDS, LANGUAGE_LEVELS } from "@/lib/taxonomy";

/**
 * Numéro WhatsApp d'Afrique centrale/de l'Ouest.
 * Accepte « +237 6XX XX XX XX », « 00237... » ou le format national.
 */
const phoneSchema = z
  .string()
  .trim()
  .min(8, "Numéro trop court")
  .max(20, "Numéro trop long")
  .regex(
    /^(?:\+|00)?[1-9]\d{0,3}[\s.-]?\d{6,12}$/,
    "Numéro WhatsApp invalide (ex. +237 6 99 00 11 22)",
  );

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
