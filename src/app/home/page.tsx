// Home feed — server-renders the initial query, then client islands handle
// filters and the FAB sheet.
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listingPublic } from "@/lib/sanitize";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; category?: string }>;
}) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login?next=/home");
  const sp = await searchParams;
  const kind = sp.kind === "lost" || sp.kind === "found" ? sp.kind : "found";
  const category = sp.category;

  const where: Record<string, unknown> = {
    kind,
    status: { not: "removed" },
    campus: sess.campus,
  };
  if (category && category !== "All") {
    where.category = category.toLowerCase();
  }
  const items = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { photos: { take: 1 } },
  });

  return (
    <HomeClient
      initial={items.map(listingPublic)}
      campus={sess.campus}
      kind={kind}
      category={category || "All"}
    />
  );
}
