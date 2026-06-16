import { Card } from "@/components/ui/card";

export function ModalPreview() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[color:var(--color-line)] p-4">
      <div className="mb-3 text-sm font-semibold text-[color:var(--color-ink)]">Modal Preview</div>
      <Card className="max-w-md p-6">
        <div className="text-lg font-semibold text-[color:var(--color-ink)]">Alert before launch</div>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          Use this modal pattern for destructive actions such as removing a tracked product or disabling a watchlist share link.
        </p>
      </Card>
    </div>
  );
}
