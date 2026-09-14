"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { signIn, type SignInState } from "@/server/admin-auth";

const initial: SignInState = { error: null };

export function SignInForm() {
  const params = useSearchParams();
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <form
      action={formAction}
      className="rounded-panel bg-white p-6 shadow-card"
    >
      <input
        type="hidden"
        name="suite"
        value={params.get("suite") ?? "/admin"}
      />

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium">
          Mot de passe administrateur
        </span>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            strokeWidth={1.7}
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
            className="h-12 w-full rounded-field border border-line bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-ink/35 focus:ring-2 focus:ring-ink/10"
          />
        </div>
      </label>

      {state.error ? (
        <p className="mt-3 rounded-field border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11.5px] text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-ink text-[13px] font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Vérification…
          </>
        ) : (
          "Entrer"
        )}
      </button>

      <p className="mt-4 text-[10.5px] leading-[1.55] text-ink-faint">
        Session de 8 heures, cookie signé et inaccessible au JavaScript de la
        page.
      </p>
    </form>
  );
}
