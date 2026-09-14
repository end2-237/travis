import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2
        className={cn(
          "text-[22px] font-semibold tracking-[-0.03em] md:text-[26px]",
          eyebrow && "mt-4",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-2.5 max-w-[68ch] text-[12.5px] leading-[1.65] text-ink-muted">
          {lede}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FactRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="shrink-0 text-[11.5px] text-ink-muted sm:w-[190px]">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">
        <span className="block text-[13px] leading-[1.6] text-ink">{value}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] leading-[1.5] text-ink-faint">
            {hint}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

export function CoverageList({
  items,
  tone,
}: {
  items: string[];
  tone: "included" | "excluded";
}) {
  const Icon = tone === "included" ? Check : X;

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <Icon
            className={cn(
              "mt-[3px] h-3.5 w-3.5 shrink-0",
              tone === "included" ? "text-positive" : "text-ink-faint",
            )}
            strokeWidth={2.4}
          />
          <span
            className={cn(
              "text-[12px] leading-[1.55]",
              tone === "included" ? "text-ink-soft" : "text-ink-muted",
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Étapes numérotées reliées par un filet vertical. */
export function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="relative">
      {steps.map((step, index) => (
        <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-line"
            />
          ) : null}
          <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-white text-[11px] font-semibold text-ink">
            {index + 1}
          </span>
          <p className="pt-1.5 text-[12.5px] leading-[1.65] text-ink-soft">
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function StatTile({
  value,
  label,
  hint,
  accent,
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card p-4",
        accent ? "bg-ink text-white" : "border border-line bg-white",
      )}
    >
      <p
        className={cn(
          "text-[22px] font-semibold leading-none tracking-[-0.04em] md:text-[26px]",
          accent ? "text-white" : "text-ink",
        )}
      >
        {value}
      </p>
      <p className={cn("mt-2 text-[11px]", accent ? "text-white/70" : "text-ink-muted")}>
        {label}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-1 text-[10.5px] leading-[1.45]",
            accent ? "text-white/55" : "text-ink-faint",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
