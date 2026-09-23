import { Logo } from "@/components/site/logo";
import { BandeKente, Motif } from "@/components/site/motif";
import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/content";

/** Pied de page — wordmark géant rogné en bas, comme sur la maquette. */
export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden md:mt-24">
      <Motif nom="kuba" opacite={0.045} fondu="haut" className="-z-10" />

      <BandeKente />

      <div className="shell">
        <div className="grid gap-8 pt-10 md:grid-cols-2">
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-[18ch] text-[20px] font-medium leading-[1.2] tracking-[-0.03em] md:text-[24px]">
              Une équipe engagée pour chaque parcours
            </p>
          </div>

          <div className="md:text-right">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[11.5px] text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[11px] text-ink-faint">
              © {new Date().getFullYear()} Travis. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 px-3 md:mt-14 md:px-5">
        <p aria-hidden className="wordmark -mb-[0.15em] w-full text-center leading-none">
          TRAVIS
        </p>
      </div>
    </footer>
  );
}
