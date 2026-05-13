import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createListingSchema,
  listingsQuerySchema,
} from "@/lib/validators";
import {
  badRequest,
  json,
  parseJson,
  requireSession,
  serverError,
  tooMany,
} from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { cleanText, listingPublic } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const q = listingsQuerySchema.safeParse(params);
    if (!q.success) return badRequest("Bad query", q.error.flatten());

    const where: Record<string, unknown> = {};
    if (q.data.kind) where.kind = q.data.kind;
    if (q.data.category) where.category = q.data.category;
    if (q.data.campus) where.campus = q.data.campus;
    if (q.data.status && q.data.status !== "any") where.status = q.data.status;
    else where.status = { not: "removed" };

    if (q.data.q) {
      where.OR = [
        { title: { contains: q.data.q } },
        { description: { contains: q.data.q } },
        { locationName: { contains: q.data.q } },
      ];
    }

    const items = await prisma.listing.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: q.data.limit + 1,
      ...(q.data.cursor
        ? { cursor: { id: q.data.cursor }, skip: 1 }
        : {}),
      include: { photos: { take: 4 } },
    });

    const nextCursor = items.length > q.data.limit ? items[q.data.limit].id : null;

    return json({
      items: items.slice(0, q.data.limit).map(listingPublic),
      nextCursor,
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const limited = await rateLimit({
      scope: "post:listing",
      identifier: sess.user.sub,
      max: 8,
      windowSeconds: 60 * 60,
    });
    if (!limited.allowed) return tooMany("Slow down — too many posts", limited.retryAfter);

    const parsed = await parseJson(req, createListingSchema);
    if (!parsed.ok) return parsed.res;

    const created = await prisma.listing.create({
      data: {
        kind: parsed.data.kind,
        title: cleanText(parsed.data.title, 120),
        description: cleanText(parsed.data.description, 2000),
        category: parsed.data.category,
        campus: sess.user.campus,
        locationName: cleanText(parsed.data.locationName, 120),
        locationLat: parsed.data.locationLat ?? null,
        locationLng: parsed.data.locationLng ?? null,
        happenedAt: parsed.data.happenedAt,
        handover: parsed.data.handover,
        ownerId: sess.user.sub,
        photos: parsed.data.photos.length
          ? { create: parsed.data.photos.map((p) => ({ data: p.data, tone: p.tone || null })) }
          : undefined,
      },
      include: { photos: true },
    });

    return json({ listing: listingPublic(created) }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
