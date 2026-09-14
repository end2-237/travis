import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-field border border-line bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink/35 focus:ring-2 focus:ring-ink/10 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full appearance-none rounded-field border border-line bg-white bg-[length:14px] bg-[right_14px_center] bg-no-repeat px-3.5 pr-9 text-[13px] text-ink outline-none transition-colors focus:border-ink/35 focus:ring-2 focus:ring-ink/10 disabled:opacity-50",
      className,
    )}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a8a8a' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    }}
    {...props}
  />
));
Select.displayName = "Select";

export function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[12px] font-medium text-ink">{children}</span>
      {hint ? <span className="text-[11px] text-ink-faint">{hint}</span> : null}
    </span>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <span className="mt-1.5 block text-[11px] font-medium text-red-600">
      {children}
    </span>
  );
}
