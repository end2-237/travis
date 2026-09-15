"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { SERVICE_LABELS } from "@/data/services";
import {
  submitApplication,
  type ApplicationState,
} from "@/server/partner-application";
import { cn } from "@/lib/utils";

const initial: ApplicationState = { status: "idle" };

interface Field {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

const FIELDS: Field[] = [
  { name: "organisation", label: "Organisation", required: true },
  { name: "contact_name", label: "Personne à contacter", required: true },
  { name: "email", label: "Adresse e-mail", type: "email", required: true },
  { name: "phone", label: "Téléphone", type: "tel", required: true },
  { name: "city", label: "Ville d'exercice", required: true },
  { name: "website", label: "Site web", placeholder: "Facultatif" },
];

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(submitApplication, initial);

  if (state.status === "sent") {
    return (
      <div className="rounded-panel border border-positive/30 bg-white p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-positive/10 text-positive">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.9} />
        </span>
        <p className="mt-5 text-[16px] font-semibold tracking-[-0.02em]">
          Candidature reçue
        </p>
        <p className="mx-auto mt-2.5 max-w-[46ch] text-[12.5px] leading-[1.65] text-ink-muted">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-panel bg-white p-6 shadow-card md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1.5 block text-[11.5px] font-medium">
              {field.label}
              {field.required ? null : (
                <span className="ml-1 font-normal text-ink-faint">
                  (facultatif)
                </span>
              )}
            </span>
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              placeholder={field.placeholder}
              className="h-11 w-full rounded-field border border-line bg-white px-3.5 text-[12.5px] outline-none placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
            />
            {state.fieldErrors?.[field.name] ? (
              <span className="mt-1 block text-[11px] text-red-600">
                {state.fieldErrors[field.name]}
              </span>
            ) : null}
          </label>
        ))}

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11.5px] font-medium">
            Service que vous proposez
          </span>
          <select
            name="kind"
            required
            defaultValue=""
            className="h-11 w-full rounded-field border border-line bg-white px-3.5 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          >
            <option value="" disabled>
              Sélectionner…
            </option>
            {Object.entries(SERVICE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.kind ? (
            <span className="mt-1 block text-[11px] text-red-600">
              {state.fieldErrors.kind}
            </span>
          ) : null}
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[11.5px] font-medium">
              Agrément ou habilitation
            </span>
            <span className="text-[10.5px] text-ink-faint">
              Ce que nous vérifierons
            </span>
          </span>
          <textarea
            name="credentials"
            rows={3}
            placeholder="Inscription à la Cour d'appel, agrément ministériel, licence d'exploitation, numéro d'enregistrement…"
            className="w-full rounded-field border border-line bg-white px-3.5 py-2.5 text-[12.5px] leading-[1.6] outline-none placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11.5px] font-medium">
            Ce que vous proposez
          </span>
          <textarea
            name="message"
            rows={4}
            placeholder="Vos tarifs, vos délais, la zone que vous couvrez, votre capacité mensuelle."
            className="w-full rounded-field border border-line bg-white px-3.5 py-2.5 text-[12.5px] leading-[1.6] outline-none placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          />
        </label>
      </div>

      {state.message && state.status === "error" ? (
        <p
          className={cn(
            "mt-5 rounded-field border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11.5px] text-red-700",
          )}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="lift mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-ink text-[13px] font-medium text-white hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={1.9} />
            Déposer ma candidature
          </>
        )}
      </button>

      <p className="mt-4 text-[10.5px] leading-[1.6] text-ink-faint">
        Votre candidature est examinée, pas publiée. Nous vérifions votre
        agrément avant tout référencement : un candidat qui se déplace sur la
        foi de cette page doit trouver un prestataire réel.
      </p>
    </form>
  );
}
