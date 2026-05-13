import { prisma } from "@/lib/prisma";
import { json, requireAdmin, serverError } from "@/lib/http";

export async function GET() {
  try {
    const adm = await requireAdmin();
    if (!adm.ok) return adm.res;

    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const prevWeek = new Date(Date.now() - 14 * 24 * 3600 * 1000);

    const [openCount, activeClaims, returnedThisWeek, returnedPrevWeek, newUsers, prevUsers] =
      await Promise.all([
        prisma.listing.count({ where: { status: "open" } }),
        prisma.claim.count({ where: { status: "pending" } }),
        prisma.listing.count({
          where: { status: "returned", updatedAt: { gte: weekAgo } },
        }),
        prisma.listing.count({
          where: {
            status: "returned",
            updatedAt: { gte: prevWeek, lt: weekAgo },
          },
        }),
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.user.count({
          where: { createdAt: { gte: prevWeek, lt: weekAgo } },
        }),
      ]);

    // 14-day timeseries for listings.
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (13 - i));
      return d;
    });

    const series = await Promise.all(
      days.map(async (d, i) => {
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        const c = await prisma.listing.count({
          where: { createdAt: { gte: d, lt: next } },
        });
        return { day: d.toISOString().slice(0, 10), value: c };
      }),
    );

    const catGroups = await prisma.listing.groupBy({
      by: ["category"],
      _count: { _all: true },
    });
    const totalCat = catGroups.reduce((a, c) => a + c._count._all, 0) || 1;

    const locGroups = await prisma.listing.groupBy({
      by: ["locationName"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });
    const locReturnRates = await Promise.all(
      locGroups.map(async (g) => {
        const total = g._count._all;
        const ret = await prisma.listing.count({
          where: { locationName: g.locationName, status: "returned" },
        });
        return { label: g.locationName, value: total ? ret / total : 0 };
      }),
    );

    const pctDelta = (a: number, b: number) =>
      b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100);

    return json({
      metrics: {
        openListings: openCount,
        activeClaims,
        returnedThisWeek,
        returnedDelta: pctDelta(returnedThisWeek, returnedPrevWeek),
        newUsers,
        newUsersDelta: pctDelta(newUsers, prevUsers),
      },
      timeseries: series,
      categories: catGroups.map((c) => ({
        label: c.category,
        value: Math.round((c._count._all / totalCat) * 100),
        count: c._count._all,
      })),
      locations: locReturnRates,
    });
  } catch (e) {
    return serverError(e);
  }
}
