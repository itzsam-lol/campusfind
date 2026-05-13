import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingPublic } from "@/lib/sanitize";
import {
  forbidden,
  json,
  notFound,
  requireSession,
  serverError,
} from "@/lib/http";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true },
    });
    if (!listing || listing.status === "removed") return notFound("Listing not found");
    return json({ listing: listingPublic(listing) });
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return notFound("Listing not found");
    if (listing.ownerId !== sess.user.sub && sess.user.role !== "admin")
      return forbidden("Not your listing");

    const body = await req.json().catch(() => ({}));
    const allowed = ["status"] as const;
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) data[k] = body[k];
    }

    if (data.status && !["open", "closed", "returned"].includes(data.status as string))
      return forbidden("Bad status");

    const updated = await prisma.listing.update({
      where: { id },
      data,
      include: { photos: true },
    });
    return json({ listing: listingPublic(updated) });
  } catch (e) {
    return serverError(e);
  }
}
