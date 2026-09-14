"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Graphiques du back-office.
 *
 * SVG écrit à la main plutôt qu'une librairie : les formes sont simples, et
 * cela évite d'embarquer 60 ko de JavaScript dans une page consultée par une
 * seule personne. Les spécifications de marque — barre ≤ 24 px à bout arrondi,
 * ligne 2 px, aire à 10 %, grille en filet — sont appliquées telles quelles.
 */

const SERIES_1 = "#2a78d6";
const SERIES_2 = "#eb6834";

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)} k`;
  return value.toLocaleString("fr-FR").replace(/[  ]/g, " ");
}

/**
 * Mode de formatage, transmis par un nom et non par une fonction : une
 * fonction ne franchit pas la frontière entre composant serveur et composant
 * client, et le rendu échouerait à l'exécution.
 */
export type ValueFormat = "compact" | "xaf";

const FORMATTERS: Record<ValueFormat, (v: number) => string> = {
  compact: formatCompact,
  xaf: (v) =>
    v >= 1000
      ? `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1)} k`
      : String(Math.round(v)),
};

/* ------------------------------------------------------------------ */
/* Aire — une seule série, donc pas de légende : le titre la nomme.     */
/* ------------------------------------------------------------------ */

export function AreaChart({
  points,
  label,
  format = "compact",
  height = 180,
}: {
  points: { date: string; value: number }[];
  label: string;
  format?: ValueFormat;
  height?: number;
}) {
  const valueFormat = FORMATTERS[format];
  // React 19 produit des identifiants du type « «r0» », dont les guillemets
  // sont invalides dans une référence url(#…) : on ne garde que l'alphanumérique.
  const gradientId = `grad-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const PAD = { top: 12, right: 8, bottom: 22, left: 44 };

  const max = niceCeil(Math.max(...points.map((p) => p.value), 1));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`;

  const ticks = [0, max / 2, max];
  const active = hover !== null ? points[hover] : null;

  return (
    <figure className="relative m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`${label} sur ${points.length} jours`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_1} stopOpacity="0.16" />
            <stop offset="100%" stopColor={SERIES_1} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grille en filet, récessive */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#e8e8e4"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 3.5}
              textAnchor="end"
              className="fill-ink-faint text-[9px]"
            >
              {valueFormat(t)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={SERIES_1}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Repère de survol */}
        {hover !== null ? (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="#b4b4b4"
              strokeWidth="1"
            />
            <circle
              cx={x(hover)}
              cy={y(points[hover].value)}
              r="4.5"
              fill={SERIES_1}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </>
        ) : null}

        {/* Cibles de survol, plus larges que les marques */}
        {points.map((p, i) => (
          <rect
            key={p.date}
            x={x(i) - innerW / points.length / 2}
            y={PAD.top}
            width={innerW / points.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {/* Bornes temporelles uniquement : un label par jour serait illisible */}
        <text x={PAD.left} y={H - 6} className="fill-ink-faint text-[9px]">
          {shortDate(points[0]?.date)}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          className="fill-ink-faint text-[9px]"
        >
          {shortDate(points[points.length - 1]?.date)}
        </text>
      </svg>

      {active ? (
        <div
          className="pointer-events-none absolute top-0 rounded-[10px] border border-line bg-white px-3 py-2 shadow-float"
          style={{
            left: `${(x(hover!) / W) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-[10px] text-ink-muted">{longDate(active.date)}</p>
          <p className="mt-0.5 text-[13px] font-semibold tabular-nums">
            {valueFormat(active.value)}
          </p>
        </div>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Barres horizontales — magnitude sur catégories nominales            */
/* ------------------------------------------------------------------ */

export function BarList({
  items,
  valueLabel,
  format = "compact",
}: {
  items: { label: string; value: number; hint?: string }[];
  valueLabel: string;
  format?: ValueFormat;
}) {
  const valueFormat = FORMATTERS[format];
  const max = useMemo(
    () => Math.max(...items.map((i) => i.value), 1),
    [items],
  );

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-[12px] text-ink-muted">
        Aucune donnée sur la période.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="group">
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 truncate text-[12px] text-ink">
              {item.label}
            </span>
            <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink">
              {valueFormat(item.value)}
              <span className="ml-1 text-[10px] font-normal text-ink-faint">
                {valueLabel}
              </span>
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-[4px] bg-surface-sunk">
            {/* Une seule série : une seule couleur pour toutes les barres. */}
            <div
              className="h-full rounded-r-[4px] transition-[width] duration-500"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                backgroundColor: SERIES_1,
              }}
            />
          </div>
          {item.hint ? (
            <p className="mt-1 text-[10.5px] text-ink-faint">{item.hint}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Colonnes à deux séries — légende obligatoire                        */
/* ------------------------------------------------------------------ */

export function DualColumns({
  points,
  labels,
}: {
  points: { date: string; a: number; b: number }[];
  labels: [string, string];
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 180;
  const PAD = { top: 12, right: 8, bottom: 22, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const max = niceCeil(Math.max(...points.flatMap((p) => [p.a, p.b]), 1));
  const band = innerW / points.length;
  // Barre plafonnée à 24 px : le reste de la bande est de l'air.
  const barW = Math.min(9, band / 2 - 2);

  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  return (
    <figure className="m-0">
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {[
          [labels[0], SERIES_1],
          [labels[1], SERIES_2],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`${labels[0]} et ${labels[1]} par jour`}
        onMouseLeave={() => setHover(null)}
      >
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#e8e8e4"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 3.5}
              textAnchor="end"
              className="fill-ink-faint text-[9px]"
            >
              {formatCompact(t)}
            </text>
          </g>
        ))}

        {points.map((p, i) => {
          const cx = PAD.left + band * i + band / 2;
          const on = hover === i;
          return (
            <g key={p.date} onMouseEnter={() => setHover(i)}>
              <rect
                x={PAD.left + band * i}
                y={PAD.top}
                width={band}
                height={innerH}
                fill={on ? "#f4f4f2" : "transparent"}
              />
              {/* Écart de 2 px entre les deux barres, assuré par le décalage */}
              <rect
                x={cx - barW - 1}
                y={y(p.a)}
                width={barW}
                height={PAD.top + innerH - y(p.a)}
                rx="3"
                fill={SERIES_1}
              />
              <rect
                x={cx + 1}
                y={y(p.b)}
                width={barW}
                height={PAD.top + innerH - y(p.b)}
                rx="3"
                fill={SERIES_2}
              />
            </g>
          );
        })}

        <text x={PAD.left} y={H - 6} className="fill-ink-faint text-[9px]">
          {shortDate(points[0]?.date)}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          className="fill-ink-faint text-[9px]"
        >
          {shortDate(points[points.length - 1]?.date)}
        </text>
      </svg>

      {hover !== null ? (
        <p className="mt-2 text-[11px] text-ink-muted">
          {longDate(points[hover].date)} —{" "}
          <span className="font-medium text-ink">
            {points[hover].a} {labels[0].toLowerCase()}
          </span>
          ,{" "}
          <span className="font-medium text-ink">
            {points[hover].b} {labels[1].toLowerCase()}
          </span>
        </p>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */

function shortDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  });
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-panel p-5",
        accent ? "bg-ink text-white" : "border border-line bg-white",
      )}
    >
      <p className={cn("text-[11px]", accent ? "text-white/60" : "text-ink-muted")}>
        {label}
      </p>
      <p
        className={cn(
          "mt-2.5 text-[28px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[32px]",
          accent ? "text-white" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-[10.5px] leading-[1.45]",
            accent ? "text-white/55" : "text-ink-faint",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
