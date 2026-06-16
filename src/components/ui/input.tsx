import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-soft)] focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-ring)]",
        className,
      )}
      {...props}
    />
  );
}
