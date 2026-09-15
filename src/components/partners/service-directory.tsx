"use client";

import { useMemo, useState } from "react";
import { Building2, Handshake, MapPin, Search } from "lucide-react";
import { ProviderCard } from "@/components/destination/document-checklist";
import { Reveal } from "@/components/motion/reveal";
import {
  SERVICE_LABELS,
  type ServiceKind,
  type ServiceProvider,
} from "@/data/services";
import { cn } from "@/lib/utils";

type Nature = "tous" | "institution" | "partner";

/** Ordre de réalisation : l'annuaire suit la chronologie du dossier. */
const ORDER: ServiceKind[] = [
  "etat-civil",
  "passeport",
  "legalisation",
  "traduction",
  "apostille",
  "langue",
  "medical",
  "photo",
  "financier",
  "visa",
];

export function ServiceDirectory({ services }: { services: ServiceProvider[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ServiceKind | "">("");
  const [nature, setNature] = useState<Nature>("tous");

  const kinds = useMemo(
    () => ORDER.filter((k) => services.some((s) => s.kind === k)),
    [services],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return services
      .filter((s) => {
        if (kind && s.kind !== kind) return false;
        if (nature !== "tous" && s.nature !== nature) return false;
        if (!needle) return true;
        return (
          s.name.toLowerCase().includes(needle) ||
          s.summary.toLowerCase().includes(needle) ||
          s.coverage.some((c) => c.toLowerCase().includes(needle))
        );
      })
      .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  }, [services, query, kind, nature]);

  const grouped = useMemo(() => {
    const map = new Map<ServiceKind, ServiceProvider[]>();
    for (const service of results) {
      map.set(service.kind, [...(map.get(service.kind) ?? []), service]);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 border-b border-line bg-canvas/92 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6">
        <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={1.7}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un service, une ville…"
              aria-label="Rechercher dans l'annuaire"
              className="h-11 w-full rounded-field border border-line bg-white pl-10 pr-3 text-[12.5px] outline-none placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
            />
          </div>

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ServiceKind | "")}
            aria-label="Filtrer par type de service"
            className="h-11 rounded-field border border-line bg-white px-3.5 text-[12.5px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          >
            <option value="">Tous les services</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {SERVICE_LABELS[k]}
              </option>
            ))}
          </select>

          <div className="flex rounded-full bg-surface-sunk p-1">
            {(
              [
                ["tous", "Tous"],
                ["institution", "Officiel"],
                ["partner", "Partenaire"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setNature(value)}
                aria-pressed={nature === value}
                className={cn(
                  "h-9 flex-1 whitespace-nowrap rounded-full px-3.5 text-[11.5px] font-medium transition-all",
                  nature === value
                    ? "bg-white text-ink shadow-pill"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11.5px] text-ink-muted">
          {results.length} service{results.length > 1 ? "s" : ""}
          {results.length !== services.length
            ? " correspondant à vos filtres"
            : " référencés"}
        </p>
      </div>

      {grouped.length === 0 ? (
        <p className="py-20 text-center text-[13px] text-ink-muted">
          Aucun service ne correspond à cette combinaison de filtres.
        </p>
      ) : (
        <div className="mt-8 space-y-12">
          {grouped.map(([serviceKind, items]) => (
            <section key={serviceKind}>
              <Reveal>
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 border-b border-line pb-3.5">
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-sunk text-[10px] font-semibold text-ink-muted">
                      {String(ORDER.indexOf(serviceKind) + 1).padStart(2, "0")}
                    </span>
                    {SERVICE_LABELS[serviceKind]}
                  </h3>
                  <p className="flex items-center gap-3 text-[11px] text-ink-muted">
                    {items.some((i) => i.nature === "institution") ? (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" strokeWidth={1.8} />
                        Voie officielle
                      </span>
                    ) : null}
                    {items.some((i) => i.nature === "partner") ? (
                      <span className="inline-flex items-center gap-1 text-electric">
                        <Handshake className="h-3 w-3" strokeWidth={1.8} />
                        Partenaire
                      </span>
                    ) : null}
                  </p>
                </div>
              </Reveal>

              <div className="grid gap-3 lg:grid-cols-2">
                {items.map((service, index) => (
                  <Reveal key={service.id} delay={Math.min(index, 3) * 60}>
                    <ProviderCard provider={service} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 flex items-start gap-2.5 rounded-card border border-line bg-white px-5 py-4 text-[11.5px] leading-[1.6] text-ink-muted">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
        <span>
          Les tarifs et délais officiels varient d&apos;un guichet à
          l&apos;autre et dans le temps. Renseignez-vous sur place avant de vous
          déplacer avec de l&apos;argent, et ne réglez jamais rien sans reçu.
        </span>
      </p>
    </>
  );
}
