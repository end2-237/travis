import { Reveal } from "@/components/motion/reveal";

/**
 * Déroulé en quatre temps.
 *
 * Le numéro reste épinglé pendant que le texte défile : `position: sticky`
 * suffit, sans écouteur de scroll ni épinglage JavaScript. Le navigateur gère
 * l'ancrage sur le compositeur, et la mise en page reste lisible même si le
 * script ne s'exécute pas.
 */
export function StickySteps({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol className="mt-10 grid gap-px overflow-hidden rounded-panel bg-line">
      {steps.map((step, index) => (
        <li key={step.title} className="bg-canvas">
          <Reveal delay={Math.min(index, 3) * 70}>
            <div className="grid gap-5 bg-white p-7 md:grid-cols-[120px_minmax(0,1fr)] md:gap-10 md:p-10">
              <div className="md:sticky md:top-24 md:self-start">
                <span className="text-[44px] font-semibold leading-none tracking-[-0.05em] text-ink-faint md:text-[56px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="max-w-[62ch]">
                <h3 className="text-[17px] font-semibold tracking-[-0.025em] md:text-[20px]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-ink-muted">
                  {step.body}
                </p>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
