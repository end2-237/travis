import Link from "next/link";

/** En-tête des pages internes — variante opaque de la barre du hero. */
export function PageHeader() {
  return (
    <div className="px-3 pt-3 md:px-5 md:pt-5">
      <nav className="mx-auto flex h-14 w-full max-w-[1216px] items-center rounded-full bg-white pl-4 pr-2 shadow-pill md:h-16 md:pl-5 md:pr-2.5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[10px] font-semibold tracking-tight text-white">
            TR
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Travis</span>
        </Link>

        <span className="ml-auto mr-2 hidden text-[12px] text-ink-muted sm:block">
          Évaluation gratuite · Rapport à 500 FCFA
        </span>

        <Link
          href="/#destinations"
          className="flex h-10 items-center rounded-full border border-line px-4 text-[13px] font-medium text-ink transition-colors hover:bg-surface-soft"
        >
          Destinations
        </Link>
      </nav>
    </div>
  );
}
