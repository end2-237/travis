import { ACHIEVEMENTS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Section « Our Achievements » — rail de 4 tuiles, la tuile mise en avant
 * ressort en blanc tandis que les autres restent estompées derrière le masque.
 */
export function Achievements() {
  return (
    <section className="pt-14 md:pt-20">
      <div className="shell flex justify-center">
        <span className="eyebrow">Nos résultats</span>
      </div>

      <div className="relative mt-7">
        <div className="edge-fade">
          <div className="rail shell flex snap-x gap-3 pb-2 md:grid md:grid-cols-4">
            {ACHIEVEMENTS.map((item) => {
              const featured = "featured" in item && item.featured;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex min-w-[190px] snap-start flex-col items-center justify-center rounded-card px-6 py-7 text-center transition-colors md:min-w-0",
                    featured
                      ? "bg-white shadow-card"
                      : "bg-surface-sunk/60 text-ink-faint",
                  )}
                >
                  <span
                    className={cn(
                      "text-[30px] font-semibold tracking-[-0.04em] md:text-[38px]",
                      featured ? "text-ink" : "text-ink-faint",
                    )}
                  >
                    {item.value}
                  </span>
                  <span
                    className={cn(
                      "mt-1 text-[11px] md:text-[12px]",
                      featured ? "text-ink-muted" : "text-ink-faint",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Repères de défilement du rail */}
        <span
          aria-hidden
          className="absolute left-4 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-ink-faint md:block"
        />
        <span
          aria-hidden
          className="absolute right-4 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-ink-faint md:block"
        />
      </div>
    </section>
  );
}
