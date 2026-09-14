"use client";

import Link from "next/link";
import { useState } from "react";
import { Facebook, Instagram, Linkedin, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute inset-x-0 top-0 z-30 px-3 pt-3 md:px-5 md:pt-5">
      <nav className="mx-auto flex h-14 w-full max-w-[1216px] items-center rounded-full bg-white/96 pl-4 pr-2 shadow-pill backdrop-blur-sm md:h-16 md:pl-5 md:pr-2.5">
        {/* Marque */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[10px] font-semibold tracking-tight text-white">
            TR
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Travis</span>
        </Link>

        {/* Liens — centrés */}
        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex h-9 items-center rounded-full px-4 text-[13px] transition-colors",
                  i === 0
                    ? "bg-surface-sunk font-medium text-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Réseaux + CTA */}
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <div className="hidden items-center gap-3 pr-3 text-ink-muted xl:flex">
            <Link href="#contact" aria-label="Facebook" className="hover:text-ink">
              <Facebook className="h-[15px] w-[15px]" strokeWidth={1.6} />
            </Link>
            <Link href="#contact" aria-label="LinkedIn" className="hover:text-ink">
              <Linkedin className="h-[15px] w-[15px]" strokeWidth={1.6} />
            </Link>
            <Link href="#contact" aria-label="Instagram" className="hover:text-ink">
              <Instagram className="h-[15px] w-[15px]" strokeWidth={1.6} />
            </Link>
          </div>

          <Link
            href="/evaluation"
            className="flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-white transition-colors hover:bg-ink-soft"
          >
            Commencer
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="ml-1 grid h-10 w-10 place-items-center rounded-full text-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Volet mobile */}
      {open ? (
        <div className="mx-auto mt-2 w-full max-w-[1216px] rounded-panel bg-white p-2 shadow-float lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-field px-4 py-3 text-[14px] text-ink-soft hover:bg-surface-soft"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
