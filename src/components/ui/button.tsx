import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,opacity,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:translate-y-px",
  {
    variants: {
      variant: {
        solid: "bg-ink text-white hover:bg-ink-soft",
        light: "bg-white text-ink border border-line hover:bg-surface-soft",
        ghost: "text-ink-muted hover:text-ink",
        glass:
          "bg-white/14 text-white border border-white/25 backdrop-blur-md hover:bg-white/22",
        electric: "bg-electric text-white hover:bg-electric/90",
      },
      size: {
        sm: "h-8 rounded-[10px] px-3 text-[11px]",
        md: "h-10 rounded-btn px-4 text-[13px]",
        lg: "h-12 rounded-btn px-6 text-[14px]",
        pill: "h-9 rounded-full px-4 text-[12px]",
        pillLg: "h-11 rounded-full px-6 text-[13px]",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
