import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Champs de formulaire.
 *
 * Le message d'erreur n'est pas seulement affiché : il est **rattaché** au
 * champ par `aria-describedby`, et le champ se déclare invalide par
 * `aria-invalid`. Sans ce câblage, un lecteur d'écran annonce « Numéro,
 * zone de texte » et rien d'autre — l'erreur est à l'écran, visible pour
 * qui voit, inexistante pour les autres. Le rôle `alert` la fait annoncer
 * dès son apparition, sans attendre que le curseur y revienne.
 */

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Message d'erreur. Sa présence rend le champ invalide. */
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, name, id, ...props }, ref) => {
    const fieldId = id ?? name;
    const errorId = fieldId ? `${fieldId}-erreur` : undefined;

    return (
      <>
        <input
          ref={ref}
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && errorId ? errorId : undefined}
          className={cn(
            "h-12 w-full rounded-field border bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:ring-2 focus:ring-ink/10 disabled:opacity-50",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-line focus:border-ink/35",
            className,
          )}
          {...props}
        />
        <FieldError id={errorId}>{error}</FieldError>
      </>
    );
  },
);
Input.displayName = "Input";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, name, id, children, ...props }, ref) => {
    const fieldId = id ?? name;
    const errorId = fieldId ? `${fieldId}-erreur` : undefined;

    return (
      <>
        <select
          ref={ref}
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && errorId ? errorId : undefined}
          className={cn(
            "h-12 w-full appearance-none rounded-field border bg-white bg-[length:14px] bg-[right_14px_center] bg-no-repeat px-3.5 pr-9 text-[13px] text-ink outline-none transition-colors focus:ring-2 focus:ring-ink/10 disabled:opacity-50",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-line focus:border-ink/35",
            className,
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235f5f5f' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          {...props}
        >
          {children}
        </select>
        <FieldError id={errorId}>{error}</FieldError>
      </>
    );
  },
);
Select.displayName = "Select";

export function FieldLabel({
  children,
  hint,
  htmlFor,
}: {
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between">
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-medium text-ink"
      >
        {children}
      </label>
      {hint ? <span className="text-[11px] text-ink-muted">{hint}</span> : null}
    </span>
  );
}

export function FieldError({
  children,
  id,
}: {
  children?: React.ReactNode;
  id?: string;
}) {
  if (!children) return null;
  return (
    <span
      id={id}
      role="alert"
      className="mt-1.5 block text-[11px] font-medium text-red-700"
    >
      {children}
    </span>
  );
}
