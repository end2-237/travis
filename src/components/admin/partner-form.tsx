"use client";

import { useActionState, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { SERVICE_LABELS } from "@/data/services";
import type { PartnerRow } from "@/lib/admin/queries";
import { savePartner, type PartnerFormState } from "@/server/admin-partners";
import { cn } from "@/lib/utils";

const initial: PartnerFormState = { status: "idle" };

const FIELDS = [
  { name: "name", label: "Nom du partenaire", required: true },
  { name: "summary", label: "Ce que le service produit", textarea: true },
  { name: "coverage", label: "Villes couvertes", hint: "Séparées par des virgules" },
  { name: "address", label: "Adresse" },
  { name: "phone", label: "Téléphone" },
  { name: "hours", label: "Horaires" },
  { name: "website", label: "Site web" },
  { name: "lead_time", label: "Délai annoncé" },
  { name: "service_fee", label: "Frais de service" },
  { name: "official_fee", label: "Frais officiels avancés" },
  { name: "warning", label: "Mise en garde", textarea: true },
] as const;

export function PartnerForm({
  partner,
  onDone,
}: {
  partner: PartnerRow | null;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(savePartner, initial);
  // Le back-office connaît un troisième état — suspendu — que le type public
  // des services n'expose pas : un partenaire suspendu n'est jamais rendu.
  const [status, setStatus] = useState<"actif" | "a_confirmer" | "suspendu">(
    partner?.status ?? "a_confirmer",
  );

  const value = (key: string): string => {
    if (!partner) return "";
    const map: Record<string, string | null | undefined> = {
      name: partner.name,
      summary: partner.summary,
      coverage: partner.coverage.join(", "),
      address: partner.address,
      phone: partner.phone,
      hours: partner.hours,
      website: partner.website,
      lead_time: partner.leadTime,
      service_fee: partner.serviceFee,
      official_fee: partner.officialFee,
      warning: partner.warning,
    };
    return map[key] ?? "";
  };

  return (
    <form action={formAction} className="rounded-panel border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[11.5px] font-medium">
            Identifiant
          </span>
          <input
            name="slug"
            defaultValue={partner?.id ?? ""}
            readOnly={Boolean(partner)}
            required
            placeholder="partenaire-traduction-douala"
            className={cn(
              "h-11 w-full rounded-field border border-line px-3.5 font-mono text-[12px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10",
              partner ? "bg-surface-sunk text-ink-muted" : "bg-white",
            )}
          />
          {state.fieldErrors?.slug ? (
            <span className="mt-1 block text-[11px] text-red-600">
              {state.fieldErrors.slug}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11.5px] font-medium">Service</span>
          <div className="relative">
            <select
              name="kind"
              defaultValue={partner?.kind ?? "traduction"}
              className="h-11 w-full appearance-none rounded-field border border-line bg-white px-3.5 pr-9 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
            >
              {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          </div>
        </label>

        {FIELDS.map((field) => (
          <label
            key={field.name}
            className={cn("block", "textarea" in field && field.textarea && "sm:col-span-2")}
          >
            <span className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11.5px] font-medium">{field.label}</span>
              {"hint" in field && field.hint ? (
                <span className="text-[10.5px] text-ink-faint">{field.hint}</span>
              ) : null}
            </span>
            {"textarea" in field && field.textarea ? (
              <textarea
                name={field.name}
                defaultValue={value(field.name)}
                rows={3}
                className="w-full rounded-field border border-line bg-white px-3.5 py-2.5 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
              />
            ) : (
              <input
                name={field.name}
                defaultValue={value(field.name)}
                required={"required" in field && field.required}
                className="h-11 w-full rounded-field border border-line bg-white px-3.5 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
              />
            )}
            {state.fieldErrors?.[field.name] ? (
              <span className="mt-1 block text-[11px] text-red-600">
                {state.fieldErrors[field.name]}
              </span>
            ) : null}
          </label>
        ))}

        <label className="block">
          <span className="mb-1.5 block text-[11.5px] font-medium">
            Commission Travis
          </span>
          <div className="relative">
            <input
              name="commission_pct"
              type="number"
              min={0}
              max={100}
              step="0.5"
              defaultValue={partner?.commissionPct ?? 0}
              className="h-11 w-full rounded-field border border-line bg-white px-3.5 pr-8 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-faint">
              %
            </span>
          </div>
        </label>

        <div>
          <span className="mb-1.5 block text-[11.5px] font-medium">Statut</span>
          <input type="hidden" name="status" value={status} />
          <div className="flex rounded-full bg-surface-sunk p-1">
            {(
              [
                ["a_confirmer", "À confirmer"],
                ["actif", "Actif"],
                ["suspendu", "Suspendu"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                aria-pressed={status === key}
                className={cn(
                  "h-9 flex-1 whitespace-nowrap rounded-full px-3 text-[11.5px] font-medium transition-all",
                  status === key
                    ? "bg-white text-ink shadow-pill"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.message ? (
        <p
          className={cn(
            "mt-5 rounded-field px-3.5 py-2.5 text-[11.5px]",
            state.status === "saved"
              ? "border border-positive/30 bg-positive/10 text-ink-soft"
              : "border border-red-200 bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-2.5 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="h-11 rounded-btn px-4 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
          >
            Fermer
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-[10.5px] leading-[1.55] text-ink-faint">
        Un partenaire passé en « actif » apparaît immédiatement sur les fiches
        de destination, sur la page de résultats et dans les rapports PDF.
      </p>
    </form>
  );
}
