"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronDown, GraduationCap, Wallet } from "lucide-react";
import { DEGREES, FIELDS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const TABS = ["Bourse", "Université", "Visa"] as const;

/**
 * Carte flottante du hero — équivalent Travis du module « Find the best place ».
 * Pré-remplit le formulaire d'évaluation via la query string.
 */
export function QuickCheckCard() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Bourse");
  const [field, setField] = useState("");
  const [degree, setDegree] = useState("");
  const [gpa, setGpa] = useState("");
  const [budget, setBudget] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (field) params.set("field", field);
    if (degree) params.set("degree", degree);
    if (gpa) params.set("gpa", gpa);
    if (budget) params.set("budget", budget);
    params.set("intent", tab.toLowerCase());
    router.push(`/evaluation?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-panel bg-white p-4 shadow-float md:p-5"
    >
      <p className="text-center text-[15px] font-semibold tracking-tight">
        Trouvez le bon programme
      </p>

      {/* Contrôle segmenté */}
      <div className="mt-3.5 flex rounded-full bg-surface-sunk p-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            aria-pressed={tab === item}
            className={cn(
              "h-9 flex-1 rounded-full text-[12px] font-medium transition-all",
              tab === item
                ? "bg-white text-ink shadow-pill"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Filière */}
      <div className="mt-4">
        <label htmlFor="qc-field" className="text-[11px] text-ink-muted">
          Filière
        </label>
        <div className="relative mt-1.5">
          <GraduationCap
            className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint"
            strokeWidth={1.7}
          />
          <select
            id="qc-field"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="h-11 w-full appearance-none rounded-field border border-line bg-white pl-9 pr-8 text-[12px] text-ink outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          >
            <option value="">ex. Informatique, Génie Civil, Médecine…</option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint"
            strokeWidth={1.7}
          />
        </div>
      </div>

      {/* Niveau + moyenne */}
      <div className="mt-3">
        <span className="text-[11px] text-ink-muted">Niveau &amp; moyenne</span>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              aria-label="Dernier diplôme obtenu"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="h-11 w-full appearance-none rounded-field border border-line bg-white px-3 pr-8 text-[12px] text-ink outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
            >
              <option value="">Diplôme</option>
              {DEGREES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint"
              strokeWidth={1.7}
            />
          </div>
          <input
            aria-label="Moyenne générale sur 20"
            inputMode="decimal"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="Moyenne /20"
            className="h-11 w-full rounded-field border border-line bg-white px-3 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="mt-3">
        <label htmlFor="qc-budget" className="text-[11px] text-ink-muted">
          Budget annuel
        </label>
        <div className="relative mt-1.5">
          <Wallet
            className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint"
            strokeWidth={1.7}
          />
          <select
            id="qc-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-11 w-full appearance-none rounded-field border border-line bg-white pl-9 pr-8 text-[12px] text-ink outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          >
            <option value="">Sélectionner une enveloppe</option>
            <option value="0">Bourse intégrale uniquement</option>
            <option value="500000">Jusqu&apos;à 500 000 FCFA</option>
            <option value="1500000">Jusqu&apos;à 1 500 000 FCFA</option>
            <option value="3000000">Jusqu&apos;à 3 000 000 FCFA</option>
            <option value="9000000">Plus de 3 000 000 FCFA</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-faint"
            strokeWidth={1.7}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 h-12 w-full rounded-field bg-ink text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
      >
        Explorer
      </button>
    </form>
  );
}
