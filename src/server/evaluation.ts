"use server";

import { redirect } from "next/navigation";
import { evaluationSchema } from "@/lib/validation";
import { persistProfile } from "@/server/profiles";

export type EvaluationState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * Soumission du formulaire d'évaluation : validation, persistance du profil,
 * matching, puis redirection vers la page de résultats (teaser gratuit).
 */
export async function submitEvaluation(
  _prev: EvaluationState,
  formData: FormData,
): Promise<EvaluationState> {
  const raw = {
    full_name: String(formData.get("full_name") ?? ""),
    phone_number: String(formData.get("phone_number") ?? ""),
    city: String(formData.get("city") ?? ""),
    current_degree: String(formData.get("current_degree") ?? ""),
    field_of_study: String(formData.get("field_of_study") ?? ""),
    gpa_score: Number(
      String(formData.get("gpa_score") ?? "").replace(",", "."),
    ),
    target_countries: formData.getAll("target_countries").map(String),
    max_budget_xaf: Number(formData.get("max_budget_xaf") ?? Number.NaN),
    language_level: String(formData.get("language_level") ?? ""),
    focus_program: String(formData.get("focus_program") ?? ""),
  };

  const parsed = evaluationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return {
      status: "error",
      message: "Certaines informations sont incomplètes.",
      fieldErrors,
    };
  }

  let profileId: string;
  try {
    profileId = await persistProfile(parsed.data);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer votre profil pour le moment.",
    };
  }

  redirect(`/resultats/${profileId}`);
}
