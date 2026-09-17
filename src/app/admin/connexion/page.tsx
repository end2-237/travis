import { Logo } from "@/components/site/logo";
import { Suspense } from "react";
import { SignInForm } from "@/components/admin/sign-in-form";
import { isAdminConfigured } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const configured = isAdminConfigured();

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center gap-2.5">
          <Logo size="md" />
          <span className="rounded-full bg-surface-sunk px-2.5 py-1 text-[10.5px] font-medium text-ink-muted">
            Back-office
          </span>
        </div>

        {configured ? (
          <Suspense
            fallback={<div className="h-[200px] rounded-panel bg-white/60" />}
          >
            <SignInForm />
          </Suspense>
        ) : (
          <div className="rounded-panel bg-white p-6 shadow-card">
            <p className="text-[14px] font-semibold">Back-office non configuré</p>
            <p className="mt-2.5 text-[12px] leading-[1.6] text-ink-muted">
              Renseignez ces deux variables d&apos;environnement, puis
              redémarrez le conteneur :
            </p>
            <pre className="mt-4 overflow-x-auto rounded-card bg-surface-sunk p-4 text-[11px] leading-[1.7]">
{`ADMIN_PASSWORD=<un mot de passe long>
ADMIN_SESSION_SECRET=<32 caractères aléatoires>`}
            </pre>
            <p className="mt-4 text-[11px] leading-[1.55] text-ink-faint">
              Générer un secret : <code>openssl rand -hex 32</code>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
