import Link from "next/link";
import { ArrowUpRight, BadgePercent } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/site/photo";
import { DEALS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Section « Exclusive deals just for you! » — deux cartes visuelles
 * avec pastille de validité en haut à droite et pourcentage en accent.
 */
export function Deals() {
  return (
    <section id="opportunites" className="shell pt-16 md:pt-24">
      <Reveal className="flex items-end justify-between gap-4">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] md:text-[26px]">
          Des opportunités rien que pour vous&nbsp;!
        </h2>
        <Link
          href="#destinations"
          className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          Tout voir
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </Reveal>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {DEALS.map((deal, index) => (
          <Reveal key={deal.title} delay={index * 90}>
          <Photo
            src={deal.image}
            alt={deal.title}
            scrim="tile"
            sizes="(max-width: 768px) 100vw, 620px"
            className="h-[280px] rounded-panel md:h-[310px]"
          >
            <div className="absolute inset-0 flex flex-col p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/18 text-white backdrop-blur-md">
                  <BadgePercent className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="rounded-full border border-white/25 bg-white/14 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                  {deal.validity}
                </span>
              </div>

              <div className="mt-auto flex items-end gap-4">
                <span
                  className={cn(
                    "shrink-0 text-[44px] font-semibold leading-none tracking-[-0.045em] md:text-[52px]",
                    deal.percentTone === "gold" ? "text-gold" : "text-lime",
                  )}
                >
                  {deal.percent}
                </span>
                <div className="pb-1">
                  <p className="text-[14px] font-medium leading-tight text-white">
                    {deal.title}
                  </p>
                  <p className="mt-1 max-w-[38ch] text-[11px] leading-[1.5] text-white/70">
                    {deal.body}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {deal.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </Photo>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
