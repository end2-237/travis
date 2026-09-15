"use server";

import { z } from "zod";
import { SERVICE_LABELS } from "@/data/services";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const schema = z.object({
  organisation: z.string().trim().min(2, "Nom de l'organisation requis").max(255),
  contact_name: z.string().trim().min(2, "Nom du contact requis").max(255),
  email: z.email("Adresse e-mail invalide").max(255),
  phone: z
    .string()
    .trim()
    .min(8, "Numéro trop court")
    .max(30)
    .regex(/^(?:\+|00)?[1-9]\d{0,3}[\s.-]?\d{6,12}$/, "Numéro invalide"),
  kind: z.enum(Object.keys(SERVICE_LABELS) as [string, ...string[]], {
    message: "Sélectionnez un service",
  }),
  city: z.string().trim().min(2, "Ville requise").max(160),
  website: z.string().trim().max(400).optional(),
  credentials: z.string().trim().max(1000).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type ApplicationState = {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Dépôt d'une candidature partenaire.
 *
 * La candidature n'est jamais publiée telle quelle : elle est enregistrée
 * pour examen. Un référencement automatique exposerait des coordonnées non
 * vérifiées à des candidats qui s'y déplaceraient.
 */
export async function submitApplication(
  _prev: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return {
      status: "error",
      message: "Certaines informations sont incomplètes.",
      fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Le dépôt de candidature nécessite une base configurée. Écrivez-nous directement en attendant.",
    };
  }

  const data = parsed.data;
  const blank = (v?: string) => (v && v.length > 0 ? v : null);

  const { error } = await getSupabaseAdmin()
    .from("partner_applications")
    .insert({
      organisation: data.organisation,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      kind: data.kind,
      city: data.city,
      website: blank(data.website),
      credentials: blank(data.credentials),
      message: blank(data.message),
    });

  if (error) {
    console.error("[partenaire] candidature refusée", error.message);
    return {
      status: "error",
      message: "Enregistrement impossible pour le moment. Réessayez dans un instant.",
    };
  }

  return {
    status: "sent",
    message:
      "Candidature reçue. Nous revenons vers vous sous cinq jours ouvrés, après vérification de votre agrément.",
  };
}
