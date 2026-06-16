import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { toProductCardModel } from "@/server/view-models";

export default async function PublicWatchlistPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const watchlist = await prisma.watchlist.findUnique({
    where: { publicId },
    include: {
      items: {
        include: {
          product: {
            include: {
              store: true,
              watchlistItems: true,
              priceHistory: { orderBy: { checkedAt: "asc" }, take: 30 },
            },
          },
        },
      },
    },
  });

  if (!watchlist || !watchlist.isPublic) {
    notFound();
  }

  const items = watchlist.items.map((item) => toProductCardModel(item.product));

  return (
    <main className="min-h-screen bg-[color:var(--color-app-bg)] p-4 lg:p-6">
      <div className="mx-auto max-w-6xl">
        <Card className="p-8">
          <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">รายการเฝ้าดูแบบสาธารณะ</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-ink)]">{watchlist.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-ink-muted)]">{watchlist.description}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {items.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
