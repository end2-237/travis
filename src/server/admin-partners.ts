"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSignedIn } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const partnerSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Identifiant trop court")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement"),
  kind: z.enum([
    "etat-civil",
    "legalisation",
    "traduction",
    "apostille",
    "langue",
    "passeport",
    "medical",
    "photo",
    "financier",
    "visa",
  ]),
  name: z.string().trim().min(2, "Nom requis").max(255),
  summary: z.string().trim().max(600).optional(),
  status: z.enum(["actif", "a_confirmer", "suspendu"]),
  coverage: z.string().trim().max(400).optional(),
  lead_time: z.string().trim().max(120).optional(),
  service_fee: z.string().trim().max(120).optional(),
  official_fee: z.string().trim().max(120).optional(),
  address: z.string().trim().max(400).optional(),
  hours: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(60).optional(),
  website: z.string().trim().max(400).optional(),
  warning: z.string().trim().max(600).optional(),
  commission_pct: z.coerce.number().min(0).max(100),
});

export type PartnerFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Enregistre un partenaire.
 *
 * Une Server Action est un point d'entrée HTTP à part entière : la session est
 * revérifiée ici, sans quoi n'importe qui pourrait l'appeler directement sans
 * jamais passer par le layout du back-office.
 */
export async function savePartner(
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  if (!(await isSignedIn())) {
    return { status: "error", message: "Session expirée. Reconnectez-vous." };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Supabase n'est pas configuré : l'édition des partenaires nécessite une base.",
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = partnerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return {
      status: "error",
      message: "Certains champs sont invalides.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const blank = (v?: string) => (v && v.length > 0 ? v : null);

  // Un partenaire « actif » sans coordonnées ni tarif serait affiché aux
  // candidats sans rien leur apprendre : on refuse plutôt que de publier un
  // contact vide.
  if (data.status === "actif" && !blank(data.phone) && !blank(data.address)) {
    return {
      status: "error",
      message:
        "Un partenaire actif doit porter au moins une adresse ou un téléphone — sinon il est inexploitable pour le candidat.",
      fieldErrors: { phone: "Adresse ou téléphone requis pour activer" },
    };
  }

  const { error } = await getSupabaseAdmin()
    .from("partners")
    .upsert(
      {
        slug: data.slug,
        kind: data.kind,
        name: data.name,
        summary: blank(data.summary),
        status: data.status,
        coverage: data.coverage
          ? data.coverage.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        lead_time: blank(data.lead_time),
        service_fee: blank(data.service_fee),
        official_fee: blank(data.official_fee),
        address: blank(data.address),
        hours: blank(data.hours),
        phone: blank(data.phone),
        website: blank(data.website),
        warning: blank(data.warning),
        commission_pct: data.commission_pct,
      },
      { onConflict: "slug" },
    );

  if (error) {
    return { status: "error", message: `Enregistrement refusé : ${error.message}` };
  }

  revalidatePath("/admin/partenaires");
  return { status: "saved", message: `« ${data.name} » enregistré.` };
}
