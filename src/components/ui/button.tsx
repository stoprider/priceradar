import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-strong)]",
        secondary: "bg-white text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-line)] hover:bg-[color:var(--color-surface-alt)]",
        ghost: "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-alt)] hover:text-[color:var(--color-ink)]",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
