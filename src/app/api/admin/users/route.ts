import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, requireAdmin, serverError } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const adm = await requireAdmin();
    if (!adm.ok) return adm.res;

    const q = req.nextUrl.searchParams.get("q")?.trim();
    const where = q
      ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        campus: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { listings: true, claimsMade: true } },
      },
    });

    return json({
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        campus: u.campus,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        listingsCount: u._count.listings,
        claimsCount: u._count.claimsMade,
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}
