"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  Clock,
  Handshake,
  MapPin,
  Phone,
  Receipt,
} from "lucide-react";
import {
  SERVICE_LABELS,
  servicesOfKind,
  type ServiceProvider,
} from "@/data/services";
import type { RequiredDocument } from "@/data/procedure";
import { cn } from "@/lib/utils";

/**
 * Checklist documentaire dépliable.
 *
 * Chaque pièce ouvre sur la démarche concrète : qui la délivre, dans quel
 * ordre, avec quoi, en combien de temps et à quel coût. C'est le moment où
 * le candidat a besoin de l'information — pas une page « partenaires »
 * séparée qu'il ne consultera jamais.
 */
export function DocumentChecklist({
  documents,
}: {
  documents: RequiredDocument[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="overflow-hidden rounded-panel border border-line bg-white">
      {documents.map((doc, index) => {
        const providers = servicesOfKind(doc.service);
        const expanded = open === index;

        return (
          <li key={doc.label} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : index)}
              aria-expanded={expanded}
              className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-soft md:px-6"
            >
              <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium leading-[1.5] text-ink">
                  {doc.label}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[10.5px] text-ink-muted">
                  <Building2 className="h-3 w-3" strokeWidth={1.7} />
                  {SERVICE_LABELS[doc.service]}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300",
                  expanded && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>

            {expanded ? (
              <div className="space-y-3 bg-surface-soft px-5 pb-5 pt-1 md:px-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ProviderCard({ provider }: { provider: ServiceProvider }) {
  const isPartner = provider.nature === "partner";
  const pending = provider.status === "a_confirmer";

  return (
    <div
      className={cn(
        "rounded-card border bg-white p-5",
        isPartner ? "border-electric/25" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-[1.35]">
            {provider.name}
          </p>
          <p className="mt-1.5 text-[11.5px] leading-[1.55] text-ink-muted">
            {provider.summary}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium",
            isPartner
              ? "bg-electric/10 text-electric"
              : "bg-surface-sunk text-ink-muted",
          )}
        >
          {isPartner ? (
            <>
              <Handshake className="h-3 w-3" strokeWidth={2} />
              Partenaire
            </>
          ) : (
            "Démarche officielle"
          )}
        </span>
      </div>

      {/* Procédure */}
      <ol className="mt-4 space-y-2.5">
        {provider.steps.map((step, i) => (
          <li key={step.label} className="flex gap-2.5">
            <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-surface-sunk text-[9px] font-semibold text-ink-muted">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] leading-[1.55] text-ink-soft">
                {step.label}
              </span>
              {step.detail ? (
                <span className="mt-0.5 block text-[10.5px] leading-[1.5] text-ink-faint">
                  {step.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {/* À apporter */}
      {provider.bring.length > 0 ? (
        <div className="mt-4 rounded-[12px] bg-surface-soft px-4 py-3">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            À apporter
          </p>
          <ul className="mt-2 space-y-1">
            {provider.bring.map((item) => (
              <li key={item} className="text-[11px] leading-[1.5] text-ink-soft">
                — {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Coordonnées et coûts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3">
        <Meta
          icon={<Clock className="h-3 w-3" strokeWidth={1.7} />}
          label="Délai"
          value={provider.leadTime}
        />
        <Meta
          icon={<Receipt className="h-3 w-3" strokeWidth={1.7} />}
          label={isPartner ? "Frais de service" : "Frais officiels"}
          value={
            (isPartner ? provider.serviceFee : provider.officialFee) ??
            "À confirmer"
          }
        />
        {provider.address ? (
          <Meta
            icon={<MapPin className="h-3 w-3" strokeWidth={1.7} />}
            label="Adresse"
            value={provider.address}
          />
        ) : null}
        {provider.phone ? (
          <Meta
            icon={<Phone className="h-3 w-3" strokeWidth={1.7} />}
            label="Contact"
            value={provider.phone}
          />
        ) : null}
      </dl>

      {provider.warning ? (
        <p className="mt-4 flex gap-2.5 rounded-[12px] border border-gold/40 bg-gold/10 px-4 py-3 text-[11px] leading-[1.55] text-ink-soft">
          <AlertTriangle
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink"
            strokeWidth={1.9}
          />
          {provider.warning}
        </p>
      ) : null}

      {pending ? (
        <p className="mt-4 rounded-[12px] bg-surface-sunk px-4 py-3 text-[10.5px] leading-[1.55] text-ink-muted">
          Coordonnées et tarifs en cours de référencement. En attendant, la
          démarche officielle ci-dessus reste entièrement réalisable par
          vous-même.
        </p>
      ) : null}
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[10px] text-ink-faint">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-[11.5px] leading-[1.4] text-ink">{value}</dd>
    </div>
  );
}
