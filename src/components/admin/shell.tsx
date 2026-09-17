import Link from "next/link";
import { Logo } from "@/components/site/logo";
import {
  BarChart3,
  Handshake,
  LayoutDashboard,
  MapPin,
  Wallet,
} from "lucide-react";
import { signOut } from "@/server/admin-auth";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/finances", label: "Finances", icon: Wallet },
] as const;

/** Coquille du back-office : navigation latérale et bandeau de mode. */
export function AdminShell({
  title,
  lede,
  demo,
  actions,
  children,
}: {
  title: string;
  lede?: string;
  demo?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex w-full max-w-[1400px] gap-0 px-3 py-3 md:px-5 md:py-5 lg:gap-5">
        {/* Navigation */}
        <aside className="hidden w-[228px] shrink-0 lg:block">
          <div className="sticky top-5 rounded-panel bg-white p-3 shadow-card">
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-2"
              aria-label="Travis, accueil"
            >
              <Logo size="sm" />
              <span className="ml-auto rounded-full bg-surface-sunk px-2 py-0.5 text-[9.5px] font-medium text-ink-muted">
                Admin
              </span>
            </Link>

            <nav className="mt-3 space-y-0.5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-field px-3 py-2.5 text-[12.5px] text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.7} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <form action={signOut} className="mt-3 border-t border-line pt-3">
              <button
                type="submit"
                className="w-full rounded-field px-3 py-2.5 text-left text-[12px] text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Navigation mobile */}
          <div className="rail mb-3 flex gap-1.5 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[12px] text-ink-muted"
              >
                <item.icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-semibold tracking-[-0.03em] md:text-[28px]">
                {title}
              </h1>
              {lede ? (
                <p className="mt-1.5 max-w-[70ch] text-[12.5px] leading-[1.6] text-ink-muted">
                  {lede}
                </p>
              ) : null}
            </div>
            {actions}
          </div>

          {demo ? (
            <p className="mt-5 flex items-start gap-2.5 rounded-card border border-gold/40 bg-gold/10 px-4 py-3 text-[11.5px] leading-[1.55] text-ink-soft">
              <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
              <span>
                <strong className="font-medium text-ink">
                  Données de démonstration.
                </strong>{" "}
                Supabase n&apos;est pas configuré : ces chiffres sont générés
                pour illustrer la mise en page et ne reflètent aucune activité
                réelle.
              </span>
            </p>
          ) : null}

          <div className="mt-6 pb-16">{children}</div>
        </main>
      </div>
    </div>
  );
}
