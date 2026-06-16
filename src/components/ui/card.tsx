import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-panel border border-[color:var(--color-line)] bg-white/90 shadow-panel backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
