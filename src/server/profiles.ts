import "server-only";

import { runMatching } from "@/lib/matching";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { EvaluationInput } from "@/lib/validation";
import { readSession, rememberSession } from "@/server/session-store";
import type { MatchSnapshot, StudentProfile } from "@/types/database";

export async function persistProfile(input: EvaluationInput): Promise<string> {
  const snapshot = await runMatching({
    gpa_score: input.gpa_score,
    current_degree: input.current_degree,
    field_of_study: input.field_of_study,
    max_budget_xaf: input.max_budget_xaf,
    target_countries: input.target_countries,
  });

  if (!isSupabaseConfigured()) {
    // Mode démonstration : le profil vit en mémoire le temps de la session.
    return rememberSession({ profile: toProfile("demo", input), snapshot });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("student_profiles")
    .insert({
      full_name: input.full_name,
      phone_number: input.phone_number,
      city: input.city,
      current_degree: input.current_degree,
      field_of_study: input.field_of_study,
      gpa_score: input.gpa_score,
      max_budget_xaf: input.max_budget_xaf,
      target_countries: input.target_countries,
      language_level: input.language_level,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Enregistrement du profil impossible : ${error?.message ?? "réponse vide"}`,
    );
  }

  return data.id as string;
}

function toProfile(id: string, input: EvaluationInput): StudentProfile {
  return {
    id,
    full_name: input.full_name,
    phone_number: input.phone_number,
    city: input.city,
    current_degree: input.current_degree,
    field_of_study: input.field_of_study,
    gpa_score: input.gpa_score,
    max_budget_xaf: input.max_budget_xaf,
    target_countries: input.target_countries,
    language_level: input.language_level,
    created_at: new Date().toISOString(),
  };
}

/** Profil + matching, pour la page de résultats et la génération du PDF. */
export async function loadEvaluation(
  profileId: string,
): Promise<{ profile: StudentProfile; snapshot: MatchSnapshot } | null> {
  if (!isSupabaseConfigured()) {
    return readSession(profileId);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("student_profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) return null;

  const profile = data as StudentProfile;
  const snapshot = await runMatching({
    gpa_score: Number(profile.gpa_score),
    current_degree: profile.current_degree,
    field_of_study: profile.field_of_study,
    max_budget_xaf:
      profile.max_budget_xaf === null ? null : Number(profile.max_budget_xaf),
    target_countries: profile.target_countries ?? [],
  });

  return { profile, snapshot };
}
