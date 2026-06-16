import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth";
import { toProductCardModel } from "@/server/view-models";

export default async function WatchlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const watchlist = await prisma.watchlist.findFirst({
    where: { id, userId: user.id },
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

  if (!watchlist) {
    notFound();
  }

  const items = watchlist.items.map((item) => toProductCardModel(item.product));

  return (
    <AppShell user={user} title={watchlist.name} description={watchlist.description || ""}>
      {items.length ? (
        <div className="grid gap-6 md:grid-cols-2">{items.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      ) : (
        <EmptyState title="ยังไม่มีสินค้าในรายการนี้" description="เริ่มต้นด้วยการเพิ่มสินค้าที่ติดตามเข้ามาในรายการเฝ้าดูนี้" />
      )}
    </AppShell>
  );
}
