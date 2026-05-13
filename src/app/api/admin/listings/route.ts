import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, requireAdmin, serverError } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const adm = await requireAdmin();
    if (!adm.ok) return adm.res;

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const limit = Math.min(
      50,
      Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "20")),
    );

    const items = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { owner: { select: { email: true, name: true } } },
    });

    const nextCursor = items.length > limit ? items[limit].id : null;
    return json({
      items: items.slice(0, limit).map((l) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        campus: l.campus,
        status: l.status,
        flagged: l.flagged,
        ownerEmail: l.owner?.email,
        createdAt: l.createdAt.toISOString(),
      })),
      nextCursor,
    });
  } catch (e) {
    return serverError(e);
  }
}
