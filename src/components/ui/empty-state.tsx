import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-panel border border-dashed border-[color:var(--color-line)] bg-white/70 px-6 py-12 text-center">
      <SearchX className="mx-auto h-8 w-8 text-[color:var(--color-ink-soft)]" />
      <h3 className="mt-4 text-lg font-semibold text-[color:var(--color-ink)]">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{description}</p>
    </div>
  );
}
