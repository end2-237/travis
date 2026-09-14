"use client";

import { useState } from "react";
import { Handshake, Lock, Pencil, Plus } from "lucide-react";
import { PartnerForm } from "@/components/admin/partner-form";
import { SERVICE_LABELS } from "@/data/services";
import type { PartnerRow } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  actif: "Actif",
  a_confirmer: "À confirmer",
  suspendu: "Suspendu",
};

export function PartnerManager({ partners }: { partners: PartnerRow[] }) {
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [creating, setCreating] = useState(false);

  const commercial = partners.filter((p) => p.nature === "partner");
  const official = partners.filter((p) => p.nature === "institution");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-[11.5px] text-ink-muted">
          <span className="rounded-full bg-surface-sunk px-2.5 py-1">
            {commercial.filter((p) => p.status === "actif").length} actif
            {commercial.filter((p) => p.status === "actif").length > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-surface-sunk px-2.5 py-1">
            {commercial.length} emplacement{commercial.length > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-surface-sunk px-2.5 py-1">
            {official.length} démarche{official.length > 1 ? "s" : ""} officielle
            {official.length > 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-ink px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-ink-soft"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nouveau partenaire
        </button>
      </div>

      {creating ? (
        <div className="mt-4">
          <PartnerForm partner={null} onDone={() => setCreating(false)} />
        </div>
      ) : null}

      {/* Partenaires commerciaux */}
      <section className="mt-6">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          Partenaires commerciaux
        </h2>
        <p className="mt-1 text-[11.5px] text-ink-muted">
          Éditables ici. Un partenaire actif s&apos;affiche sur les fiches, dans
          les résultats et dans les rapports PDF.
        </p>

        <div className="mt-4 space-y-3">
          {commercial.map((partner) => (
            <div key={partner.id}>
              <article
                className={cn(
                  "flex flex-wrap items-start justify-between gap-4 rounded-card border bg-white p-5",
                  partner.status === "actif"
                    ? "border-electric/25"
                    : "border-line",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[13.5px] font-semibold">{partner.name}</h3>
                    <span className="rounded-full bg-surface-sunk px-2 py-0.5 text-[10px] text-ink-muted">
                      {SERVICE_LABELS[partner.kind]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        partner.status === "actif"
                          ? "bg-positive/10 text-positive"
                          : "bg-surface-sunk text-ink-muted",
                      )}
                    >
                      {STATUS_LABEL[partner.status]}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-[70ch] text-[11.5px] leading-[1.55] text-ink-muted">
                    {partner.summary}
                  </p>
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px]">
                    <Meta label="Délai" value={partner.leadTime} />
                    <Meta label="Frais de service" value={partner.serviceFee} />
                    <Meta label="Téléphone" value={partner.phone} />
                    <Meta
                      label="Commission"
                      value={
                        partner.commissionPct > 0
                          ? `${partner.commissionPct} %`
                          : null
                      }
                    />
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditing(editing?.id === partner.id ? null : partner);
                  }}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-btn border border-line px-3.5 text-[12px] font-medium text-ink transition-colors hover:bg-surface-soft"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {editing?.id === partner.id ? "Fermer" : "Modifier"}
                </button>
              </article>

              {editing?.id === partner.id ? (
                <div className="mt-3">
                  <PartnerForm
                    partner={partner}
                    onDone={() => setEditing(null)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Démarches officielles */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
          <Lock className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.9} />
          Démarches officielles
        </h2>
        <p className="mt-1 max-w-[70ch] text-[11.5px] leading-[1.55] text-ink-muted">
          Organismes publics et centres agréés. Ces procédures ne dépendent
          d&apos;aucun contrat : elles vivent dans le code
          (<code className="text-[10.5px]">src/data/services.ts</code>) et ne
          sont pas modifiables depuis le back-office, pour qu&apos;une erreur de
          saisie ne puisse pas envoyer un candidat au mauvais guichet.
        </p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {official.map((service) => (
            <div
              key={service.id}
              className="rounded-card border border-line bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <Handshake
                  className="h-3.5 w-3.5 shrink-0 text-ink-faint"
                  strokeWidth={1.8}
                />
                <h3 className="min-w-0 truncate text-[12.5px] font-medium">
                  {service.name}
                </h3>
              </div>
              <p className="mt-1.5 text-[10.5px] text-ink-muted">
                {SERVICE_LABELS[service.kind]} · {service.steps.length} étapes ·{" "}
                {service.leadTime}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-1.5">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
